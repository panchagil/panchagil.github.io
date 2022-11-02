var CG = CG || {}
CG.main = (function(mat4) {
	/** PRIVATE **/

	var _clearColor = [0, 0, 0, 0];
	var _scenes = {};

	var update = function(time) {
		for (var id in _scenes) {
			var scene = _scenes[id];
			scene.update(time);
			scene.draw();
		}
	}


	var _initCanvas = function(el) {
		// get the user-handler for this canvas
		var scene = _scenes[el.id];
		if (scene === undefined) {
			alert("no handle for " + el.id);
			throw ("no handle for " + el.id);
		}
		scene.glHelper = GLHelper.main.instance(el);
		scene.el = el;
		scene.objects = [];
		scene.setup();

	}

	// initializes all the canvas that have the attribute 'data-render'
	var initAll = function() {
		var c = document.getElementsByTagName("canvas");
		for (var n = 0; n < c.length; n++) {
			var el = c[n];

			if (el.getAttribute("data-render") === "gl") {
				_initCanvas(el);
			}
		}
	}


	var newScene = function(canvas_id) {
		_scenes[canvas_id] = new Object();
		_scenes[canvas_id].draw = CG.scene.draw;
		_scenes[canvas_id].addObject = CG.scene.addObject;
		return _scenes[canvas_id];
	}


	return {
		initAll: initAll,
		update: update,
		newScene: newScene
	}
})(mat4);