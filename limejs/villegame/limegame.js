//set main namespace
goog.provide('villegame');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.fill.Frame');
goog.require('lime.fill.Color');
goog.require('lime.fill.Image');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Loop');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Event');
goog.require('lime.audio.Audio');

GameData = {
	scene: null
}

// entrypoint
villegame.start = function(element){


	var director = new lime.Director(element),
		prefix = 'client/img/game/',
		size = director.getSize();
		//testLayer = new lime.Sprite().setSize(20, 20).setPosition(200, 200).setFill('#00ff00');

		GameData.scene = new lime.Scene();


		goog.events.listen(GameData.scene,['mousedown','touchstart'],function(e){
			socket.emit('move player', {x: e.position.x, y: e.position.y});
			localPlayer.targetX = e.position.x;
			localPlayer.targetY = e.position.y;
			console.log("pos: " + e.position + " target: " + localPlayer.targetX +"x"+ localPlayer.targetY); 
		});

	//GameData.scene.appendChild(testLayer);


	director.appendChild(GameData.scene);
	director.makeMobileWebAppCapable();

	// set current scene active
	director.pushScene(GameData.scene);

	lime.scheduleManager.schedule(function(dt){
   		update();
   		draw();
	});

}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('villegame.start', villegame.start);
