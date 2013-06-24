/*
*
* Game server for realtime multiplayer RPG 
* Ajax and socket.io communication supported.
* JSON, (XML), BLOB
* 
*
* Installed modules: 
* express, node-uuid, socket.io, connect, cookie, passport, passport-local,
* passport-socketio, emailjs



// Run this to install everything needed. 
 npm install express && npm install node-uuid && npm install socket.io && npm install connect && npm install cookie && npm install passport && npm install passport-local && npm install passport-socketio && npm install emailjs


*
*Thanks for Rob Hawkes for his framework for multiplayer game.
*Lot of stuff has been reworked ever since.
*https://github.com/robhawkes/mozilla-festival
*
*/

// Server settings
var 	gameport		= process.env.PORT || 1111,

		express			= require('express'),
		MemoryStore 	= express.session.MemoryStore,
		app				= express(),	
		connect 		= require('connect'),
		cookie 			= require('cookie'),
		server			= require('http').createServer(app),
		sio				= require('socket.io').listen(server),
	    passportSocketIo = require('passport.socketio'),

		sessionStore	= new MemoryStore(),
		SITE_SECRET		= 'All your base are belong to us!',

		UUID			= require('node-uuid'),
		db				= require('./db.js'),

		//login stuff
		passport		= require('passport'),
		LocalStrategy 	= require('passport-local').Strategy,

		email 			= require('emailjs'),

		Player 			= require('./client/js/Player').Player,
		game_server		= require('./game_server');
		verbose 		= false;


//
//	 Email server configuration for forgotten passwords
//

var emailServer = email.server.connect({ 
	user: 		'game.admin',			// Tested and working module.
	password: 	'',						// Needs i'ts own accoutn.
	host: 		'smtp.gmail.com',
	ssl: 		true
});

restorePassword = function (email, newPwd) {
	emailServer.send({
		text: 	'Your new password is: ' + newPwd, 
		from: 	'thegamer@thegame.com',
		to: 	email,
		subject: 	'The Game :: Reset password'
	}, function (err, message) {
		console.log('mail: ' + (err||message)); 
		});
}



//Server configuration for sessions etc. 
app.configure(function() {
	app.use(express.static('public'));

	//For parsing POST-messages.
	//Used in ajax.
	app.use(express.bodyParser());

	//For settin up session
	app.use(express.cookieParser()); 
	app.use(express.session( {store: sessionStore, secret: SITE_SECRET, key:'express.sid'} ));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);

});

//Run gameserver here.
server.listen(gameport); 


//
//	Passport login configurations
//

passport.use(new LocalStrategy(
  function(username, password, done) {

    db.login({ email: username, password: password }, function(user) {

    console.log("trying to login");
      if (!user) {
      	console.log('no username');
        return done(null, false, { message: 'Incorrect username.' });
      }
      console.log('login success');
      return done(null, user);
    }); //db.login
  }
));

//Serialize and deserialize user data. 
//Makes user session readable 
passport.serializeUser(function(user, done) {
  	done(null, user.clientid);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializing data' + id);
	  db.find_by_id(id, function(err, user) {
    	done(err, user);
  });
});



//
// Socket.io -part of the gameserver
//

//Session data and configuration for socket.io

//Socket server configure
sio.configure( function () {
	//var Session = connect.middleware.session.Session;
	//sio.set('log level', 0); 

	//Session handling
	sio.set('authorization', passportSocketIo.authorize({

		key: 	'express.sid',
		secret:  SITE_SECRET,
		store: 	 sessionStore,
		
		fail: 	 function(data, accept) {
			console.log('socket.io failed ' + data);
			accept(null, false);
		},

		success:  function(data, accept) {
			console.log('socket.io success ' ); 
			accept(null, true);
		}
	})); 
		
});

sio.on('connection', function(client) {
	var user = client.handshake.user; 
	//Tell client it's clientid
	client.emit('clientid', {clientid: user.clientid})

	//Tell client they connected and give them the userid.
	client.emit('onconnected', {nick: user.nick});


	client.on('message', function(data) {
		client.broadcast.emit('message', data.nick + ': ' + data.msg); 
	});

	//New player
	client.on('new player', game_server.onNewPlayer); 

	//Disconnected player
	client.on('disconnect', game_server.onClientDisconnect);

	//Listen for player move
	client.on('move player', game_server.onMovePlayer);
});





// Sending json and blob via websockets
// http://stackoverflow.com/questions/13028604/sending-a-javascript-object-through-websockets-with
// Not implemented yet.



//
//	Handling urls and routes.
//

// Log incoming connections. 
console.log('\t :: Gameserver :: Listening on port ' + gameport); 

// Forward / path to index.html
app.get('/', function(req, res) {
	res.sendfile(__dirname  + '/client/index.html'); 
	console.log('\t :: Gameserver :: ' + 'index.html send');
});

//Show signup page
app.get('/signup', function(req, res) {
	res.sendfile(__dirname  + '/client/newaccount.html'); 
	console.log('\t :: Gameserver :: ' + 'newaccount.html send');
});

//Validate new users email
app.get('/check-email', function(req, res) {
	var email = req.query['email']; 
	console.log('Validata email: ' + email);
	db.check_email(email, function(success) {
		console.log('email! : ' + success);
		res.json(success);
	});
});

//Validate new users nick
app.get('/check-nick', function(req, res) {
	var nick = req.query['nick']; 

	console.log('validata nick: ' + nick);
	db.check_nick(nick, function(success) {
		res.json(success);
	});
});

//Check, if user is logged in and then forward 
app.get('/game', ensureAuthenticated, function(req, res) {
	//check if user is listed as logged in.
	res.sendfile(__dirname + '/client/game.html');
});


//Register a new user with signup data
app.post('/register-data', function(req, res) {
	data = {name:req.body.name, email:req.body.email, nick: req.body.nick, password: req.body.password, clientid: UUID(), sessionid: '' };

	db.save_new_user(data, function(success) {
		res.json(success);
	});
});

app.get('/logout', function(req, res){
	console.log('redirect');
  req.logout();
  res.redirect('/');
});

app.post('/forgot', function(req, res){
	var email = req.body.email;
	var password = Math.random().toString(36).slice(-8);
	db.resetPassword({email: email, password : password}, 
		function(err) {
			if(!err) {
				restorePassword(email, password);
				res.json(true);
			}
			else {
				console.log("user not found");
			}
		}); 
});

//Fix this...
app.get('/*', function(req, res, next) {
	var file = req.params[0]; 
	//console.log("requested file: " + file);
	//console.log('\t :: Gameserver :: file requested: '  + file );
	res.sendfile(__dirname + '/' + file);
	//console.log('.... file sent: ' + __dirname + '/'+file);
});


app.post('/login',
  passport.authenticate('local', { successRedirect: '/game', 
                                   failureRedirect: '/',
                                   failureFlash: false })
); 





// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
