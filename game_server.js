//exports

var
			Player 			= require('./client/js/Player').Player,
			players 		= [];



/*****************************************

	Game logics and stuff....

******************************************/


//socket.io function for disconnecting players.
exports.onClientDisconnect = function () {
	console.log("Player has disconnected: " + this.handshake.user.clientid); 

	var removePlayer = exports.playerById(this.handshake.user.clientid)

	//Player not found
	if(!removePlayer) {
		console.log("Player not found: "+ this.handshake.user.clientid); 
		return; 
	}

	//remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	//Broadcast removed palyer to connected clients
	this.broadcast.emit("remove player", {id: this.handshake.user.clientid}); 
}

//Adding new player to game
// ---- Add here check to disable double login.... Or 
// at least somewhere.
exports.onNewPlayer = function(data) {
		var id = this.handshake.user.clientid; 
		//Create a new player
		var newPlayer = new Player(data.x, data.y); 
		newPlayer.id = id; 

		//Broadcast the new player to connected clients
		this.broadcast.emit('new player', {id:newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

		//Send existing palyers to the new player (and just for the new player)
		//the new player is not yet added to the array of players.
		// ---- What if we just send the whole list? Problem?
		var i, existingPlayer; 
		for(i=0; i<players.length; i++) {
			existingPlayer = players[i]; 
			this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
		}

		//Finally add new player to the players array
		players.push(newPlayer);
}

//Player has moved
exports.onMovePlayer = function(data) {
	console.log("move player " + data.x + ", " + data.y );
	//First find the player in array
	var movePlayer = exports.playerById(this.handshake.user.clientid); 

	//Player not found
	if(!movePlayer) {
		console.log('Player not found: ' + this.handshake.user.clientid); 
		return; 
	}

	//Update player position
	movePlayer.targetX = data.x; 
	movePlayer.targetY = data.y;

	//Finally broadcast the updated position to other players
	this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.targetX, y: movePlayer.targetY});
}


/*****************************************

	Random helper functions

******************************************/

//Find player by id
exports.playerById = function (id) {

	for(var i=0; i< players.length; i++) {
		if(players[i].id === id) {
			return players[i];
		}
	}

	return false;
}
