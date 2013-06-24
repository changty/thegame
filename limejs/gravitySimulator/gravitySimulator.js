//set main namespace
goog.provide('gravitySimulator');


goog.require('box2d.BodyDef');
goog.require('box2d.BoxDef');
goog.require('box2d.CircleDef');
goog.require('box2d.CircleShape');
goog.require('box2d.PolyDef');
goog.require('box2d.Vec2');
goog.require('box2d.JointDef');
goog.require('box2d.MouseJointDef');
goog.require('box2d.World');

goog.require('lime');
goog.require('lime.fill.Frame');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.fill.LinearGradient');

defaults = {
    width: null,
    height: null
};


gravitySimulator.start = function(div, gravity, width, height) {
    console.log(width + "x" + height);
    /*

    There is no box2d integration in LimeJS yet. This file only
    shows that box2d is in correct path.

    */

    //director
    //var director = new lime.Director(document.body);
    var director = new lime.Director(document.getElementById(div));
    director.makeMobileWebAppCapable();
    defaults.width = director.getSize().width;
    defaults.height = director.getSize().height;
    console.log(defaults.height +"x" + defaults.width);

    var bgMoon = new lime.fill.Frame('data/moon.jpg', 0,0, defaults.width, defaults.height);
    var bgEarth = new lime.fill.Frame('data/earth.jpg', 0,0, defaults.width, defaults.height);

    var gamescene = new lime.Scene();

    var layer = new lime.Sprite();
    layer.setPosition(0, 0).setSize(defaults.width, defaults.height);
    gamescene.appendChild(layer);

    if(div == "earth") {
        layer.setFill(bgEarth);
    }
    else {
        layer.setFill(bgMoon);
    }

    // set active scene
    director.replaceScene(gamescene);
    
    var gravity = new box2d.Vec2(0, gravity);
    var bounds = new box2d.AABB();
    bounds.minVertex.Set(-defaults.width, -defaults.height);
    bounds.maxVertex.Set(defaults.width, defaults.height);
    var world = new box2d.World(bounds, gravity, false);

    function createCircle(radius, x, y, weight, text){
        var circle = (new lime.Circle)
            .setFill("#fff")
            .setSize(radius*2, radius*2);


       var weightLbl = new lime.Label()
            .setText(text)
            .setFontColor("#222")
            .setFontFamily("Arial")
            .setFontSize("26")
            .setAnchorPoint(0.5, 0.5)
            .setPosition(0,0);
        circle.appendChild(weightLbl);

        layer.appendChild(circle);
        
        var bodyDef = new box2d.BodyDef;
        bodyDef.position.Set(x, y);
        console.log(x + ", " + y);
        bodyDef.angularDamping = .1;

        var shapeDef = new box2d.CircleDef;
        shapeDef.radius = circle.getSize().width/2;
        shapeDef.density = 5;
        shapeDef.restitution = 0;
        shapeDef.friction = 1;
        bodyDef.AddShape(shapeDef);
        
        var body = world.CreateBody(bodyDef);
        circle._body = body; // just a reference, no API logic
        body.m_mass = weight;
        return circle;
    }

    function createBox(x, y, width, height, rotation){
        var box = (new lime.Sprite).setFill(0,100,0).setSize(width, height);
        layer.appendChild(box);
        
        var bodyDef = new box2d.BodyDef;
        bodyDef.position.Set(x, y);
        bodyDef.rotation = -rotation / 180 * Math.PI;
        
        var shapeDef = new box2d.BoxDef;
        shapeDef.restitution = .1 // how bouncy
        shapeDef.density = 0; // static
        shapeDef.friction = 1;
        shapeDef.extents.Set(width / 2, height / 2);
        
        bodyDef.AddShape(shapeDef);
        var body = world.CreateBody(bodyDef);
        box._body = body; // just a reference
        return box;
    }
    
    function makeDraggable(shape){ // only use for physics based dragging
        goog.events.listen(shape, ['mousedown', 'touchstart'], function(e){
            var pos = this.localToParent(e.position); //need parent coordinate system
            
            var mouseJointDef = new box2d.MouseJointDef(); 
            mouseJointDef.body1 = world.GetGroundBody(); 
            mouseJointDef.body2 = shape._body; // using ref created above 
            mouseJointDef.target.Set(pos.x, pos.y); 
            mouseJointDef.maxForce = 1000000 * shape._body.m_mass; 
            mouseJointDef.collideConnected = false; 
            mouseJointDef.dampingRatio = 1; 
            
            var mouseJoint = world.CreateJoint(mouseJointDef); 
            
            e.swallow(['mouseup', 'touchend'], function(e){
                world.DestroyJoint(mouseJoint); 
            });
            e.swallow(['mousemove', 'touchmove'], function(e){
                var pos = this.localToParent(e.position);
                mouseJoint.SetTarget(new box2d.Vec2(pos.x, pos.y));
            });
            
        })
    }
    
    function updateFromBody(shape){
        var pos = shape._body.GetCenterPosition();
        var rot = shape._body.GetRotation();
        shape.setRotation(-rot / Math.PI * 180);
        shape.setPosition(pos);
    }
    

    //weight = 50 almost impossible to lift up
    // weight = 60 light as feather
    // (radius, x, y, weight, text)
    var circle1 = createCircle(100, 110, 50, 64, "50 kg"),
        circle2 = createCircle(50, 270, 50, 60, "5 kg"),
        box1 = createBox(5,defaults.height-5, defaults.width*2,5, 0).setFill("#191919"),
        box2 = createBox(0, 0, 2*defaults.height ,5, 90).setFill('#222'), // left
        box3 = createBox(defaults.width,0, 2*defaults.height,5, 90).setFill('#222'); // right

    makeDraggable(circle1);
    makeDraggable(circle2);


    lime.scheduleManager.schedule(function(dt) {
        if(dt>100) dt=100; // long delays(after pause) cause false collisions
        world.Step(dt / 1000, 3);
        
        updateFromBody(circle1);
        updateFromBody(circle2);
        updateFromBody(box1);
        updateFromBody(box2);
        updateFromBody(box3);
        
    },this);


};

goog.exportSymbol('gravitySimulator.start', gravitySimulator.start);
