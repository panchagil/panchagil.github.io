var CG = CG || {}
CG.main = (function(mat4) {
	/** PRIVATE **/
	var _scenes = {};
	var _startTime;
	var _clearColor = [0, 0, 0, 1];

	var _tick = function() {
		var time = ((new Date).getTime() - startTime) / 1000;

		for (var id in _scenes) {
			var scene = _scenes[id];
			scene.update(time);
			CG.scene.draw(scene.gl, scene.objects);
		}
		requestAnimationFrame(_tick);
	};


	var _initGL = function(canvas) {
		var gl;

		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor.apply(gl, clearColor);
			gl.enable(gl.DEPTH_TEST);
		} catch (e) {
			alert("Could not initialise WebGL.");
		}

		return gl;
	}

	var _initCanvas = function(el) {
		// get the user-handler for this canvas
		var canvas = _scenes[el.id];
		if (canvas === undefined) {
			alert("no handle for " + el.id);
			throw ("no handle for " + el.id);
		}
		canvas.gl = _initGL(el);
		canvas.el = el;
		canvas.objects = [];
		canvas.setup();

	}

	/** PUBLIC **/
	var run = function() {
		startTime = (new Date).getTime();
		_tick();
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

	// set ups the handle for the canvas
	var newScene = function(canvas_id) {
		_scenes[canvas_id] = {};
		return _scenes[canvas_id];
	}

	var setClearColor = function(color) {
		clearColor = color;
	}


	return {
		initAll: initAll,
		run: run,
		newScene: newScene,
		setClearColor: setClearColor
	}
})(mat4);