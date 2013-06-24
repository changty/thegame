
/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		targetX,
		targetY,
		id,
		object, 
		moveAmount = 2;

	this.state_time = new Date().getTime();

    //Our local history of inputs
    this.inputs = [];

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	// Update player position
	var update = function() {
		var speed = 20*frame_time; 

		if(this.targetX && this.targetY) {

			if (this.getX()<this.targetX) {
				this.setX(this.getX() + speed);
			}			
			if(this.getX() > this.targetX ) {
				this.setX(this.getX() - speed);
			}
			if (this.getY() < this.targetY) {
				this.setY(this.getY() + speed);
			}			
			if(this.getY() > this.targetY ) {
				this.setY(this.getY() - speed);
			}
		}
	};

	// Draw player
	var draw = function() {
		//console.log(this.getX() + ", " + this.getY());
		this.object.setPosition(this.getX(), this.getY());

	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		targetX: targetX,
		targetY: targetY,
		update: update,
		draw: draw,
		object: object
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
if( 'undefined' != typeof global) {
	exports.Player = Player;
}
