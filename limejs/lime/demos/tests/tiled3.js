goog.provide('test.tiled3');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.LinearGradient');
goog.require('lime.ui.Scroller');
goog.require('lime.parser.TMX');

test.WIDTH = 800;
test.HEIGHT = 600;

test.start = function(){

	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	var tmx = new lime.parser.TMX('assets/isometric_grass_and_water.tmx');
	layer = new lime.Layer().setRenderer(lime.Renderer.CANVAS).setPosition(400,0);
	//canvas renderer is recommended for tiled maps. much faster in most cases
	gamescene.appendChild(layer);
	for(var j = 0; j < tmx.layers.length; j++)
	{
		for(var i = 0; i < tmx.layers[j].tiles.length; i++)
		{
			tile = tmx.layers[j].tiles[i];
			console.log("Just a test" + tile.obsticle);
			sprite = new lime.Sprite().setPosition(tile.px,tile.py);
			sprite.setFill(tile.tile.frame);
			layer.appendChild(sprite);
		}
	}
	
	    goog.events.listen(layer, ['mousedown', 'touchstart'], function(e) {
	        e.startDrag();
	    });
	
    // set active scene
    test.director.replaceScene(gamescene);
	
}