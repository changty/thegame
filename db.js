//DB helper 
var	mysql			= require('mysql');
var connection		= mysql.createConnection( {
							host		: '127.0.0.1',
							user 		: 'game',
							password 	: 'game',
							database	: 'gameserver',	
						});

console.log("---- connected to db -------");
//Data is in object form, for example {email: 'einari.kurvinen@mymail.com', password: 'my secret'}
//just reference to this require('./db.js').login(data, callback);
exports.login = function(data, callback) {
	var login_query = 'select * from player where email=' + mysql.escape(data.email) + ' AND password=' + mysql.escape(data.password)+';'; 
	console.log(data.email + ", "+ data.password);
	var q = connection.query(login_query, 
		function(err, results, fields) {
			if(err) {
				console.log(err);
				callback(false);
			}
			else if(results[0]) {
				callback(results[0]);
			}
			else {
				callback(false);
			}
		});
}



//Check, if email is taken
//Also resetPassword uses this method in a different way to check that requested 
//email exists.
exports.check_email = function(data, callback) {

	var check_query = 'select email from player where email=' + mysql.escape(data)+';'; 
	var q = connection.query(check_query, 
		function(err, results, fields) {
			if(err) {
				console.log(err);
				callback(false);
			}
			if(results[0]) {
				// email is taken
				callback(false);
			}
			else {
				callback(true);
			}
		});
}

exports.check_password = function(data, callback) {
	var check_query = 'select * from player where email=' + mysql.escape(data.email)+' AND password=' + mysql.escape.data.password + ';'; 
	var q = connection.query(check_query, 
		function(err, results, fields) {
			if(err) {
				console.log(err);
				callback(false);
			}
			if(results[0]) {
				callback(results[0]);
			}
			else {
				callback(false);
			}
		});
}

//Check, if nick is taken
exports.check_nick = function(data, callback) {

	var check_query = 'select nick from player where nick=' + mysql.escape(data)+';'; 
	var q = connection.query(check_query, 
		function(err, results, fields) {
			if(err) {
				console.log(err);
				callback(false);
			}
			if(results[0]) {
				callback(results[0]);
			}
			else {
				callback(true);
			}
		});

}

//Save new user
exports.save_new_user = function(data, callback) {

	var add_query = 'insert into player SET ?'; 

	var q = connection.query(add_query, data, 
		function(err, results) {
			if(err) {
				console.log(err);
				callback(false);
			}
			else {
				callback(true);
			}
		});
}

exports.find_by_id = function(data, callback) {
	var check_query = 'select * from player where clientid=' + mysql.escape(data)+';'; 
	var q = connection.query(check_query, 
		function(err, results, fields) {
			callback(err, results[0]);
		});
}

exports.resetPassword = function(data, callback) {
	var found = false; 
	exports.check_email(data.email, function (success) {
		//check_email is for checking it's duplicacy - not existense. 
		//if email is found, succes is false. That's why I use !success.

		if(!success) {
			var update_query = 'update player set password=' + mysql.escape(data.password) + ' where email=' + mysql.escape(data.email) +';'; 
					var q = connection.query(update_query,
						function(err, results, fields) {
							callback(err);
			});
		}
			else {
				callback(true);
			} 
		
	});
}

		/*
	connection.query('SELECT * FROM player WHERE email=? AND password=?;', data, function(err, result){
	 	console.log('raw: ' + result.email);
	 	callback(result);
			
	});

		//Test mysql query
		var query = db.query('SELECT * FROM player;');

		query.on('error', function(err) {
			console.log(error); 
		});

		query.on('result', function(row) {
			console.log(row);
			console.log(row.nick);
		});

		query.on('end', function() {
			console.log('end');
		});

	*/
