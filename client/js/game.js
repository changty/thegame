var frame_time = 60/1000; // run the local game at 16ms/ 60hz
if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz

( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
           
            //update();
           
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );

/************************************************∂**
** GAME VARIABLES
**************************************************/
var localPlayer,	// Local player
	clientid,		// client identifier.
	remotePlayers,	// Remote players
	socket;			// Socket connection


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	console.log('Initilaizing the game...');
	// Declare the canvas and rendering context
	//canvas = document.getElementById("gameCanvas");
	//ctx = canvas.getContext("2d");

	// Maximise the canvas
	//canvas.width = window.innerWidth;
	//canvas.height = window.innerHeight;

	//start limejs 
	villegame.start(document.getElementById('gameStage'));

	// Initialise keyboard control
	//keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*($(window).width()-5)),
		startY = Math.round(Math.random()*($(window).height()-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);
	localPlayer.object = new lime.Sprite().setSize(20,20).setFill('#ff0000').setPosition(20, 20).setStroke(2, '#fff');
	GameData.scene.appendChild(localPlayer.object);


	// Initialise socket connection
	socket = io.connect();

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {

	var txt = $('#txt');
	var content = $('#content');
	var nick = ''; 


		$('#btn').click(function(e) {
			e.preventDefault(); 
			content.append('<br />' + nick +': ' + txt.val()); 
			socket.emit('message', {nick: nick, msg: txt.val()} );	

			txt.val('');
		});


	// Keyboard
	//window.addEventListener("keydown", onKeydown, false);
	//window.addEventListener("keyup", onKeyup, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	content.append('Connected...' + '<br />');

	socket.on('onconnected', function(client) {
		nick = client.nick;
		content.append(client.nick + '<br/>');
	})

	socket.on('message', function(msg) {
		content.append('<b><br />' + msg + '</b>');		
	});

};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.object = new lime.Sprite().setSize(20,20).setFill('#000').setPosition(data.x, data.y);
	newPlayer.id = data.id;

	//Add player to canvas
	GameData.scene.appendChild(newPlayer.object);

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
// This is called after server updates new position for any player.
function onMovePlayer(data) {
	console.log('player ' + data.id + ' moved');
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.targetX = data.x;
	movePlayer.targetY = data.y;

	// this updates player position 
	// WRONG PLACE FOR THIS!
	//movePlayer.object.setPosition(data.x, data.y);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	//Remove player from canvas
	GameData.scene.removeChild(removePlayer.object);

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
//function animate() {
//	update();
	//draw();

	// Request a new animation frame using Paul Irish's shim
	//window.requestAnimFrame(animate);
//;


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	localPlayer.update();

	// update remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].update();
	};
};


/**************************************************
** GAME DRAW tells limejs to update position
**************************************************/
function draw() {

	// Draw the local player
	localPlayer.draw();

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw();
	};
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};

	return false;
};