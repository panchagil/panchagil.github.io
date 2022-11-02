var CG = CG || {};
CG.main = (function(window) {
	var FOCAL_LENGTH = 8.0;
	var context, width, height, startTime;

	var init = function() {
		var element = document.getElementById("canvas1");
		context = element.getContext("2d");

		width = element.width;
		height = element.height;

		startTime = (new Date()).getTime() / 1000.0;
		tick();
	}

	var tick = function() {
		var time = ((new Date()).getTime() - startTime) / 1000.0;
		CG.scene.animate(time);
		requestAnimationFrame(tick);
	}

	var clear_canvas = function() {
		context.clearRect(0, 0, width, height);
	}

	/**
	 * Generalization of the code provided by Prof. Perlin
	 * draws a set of path defined by a set of points and
	 * a set of edges. Each shape has a single transformation for
	 * all its points.
	 **/
	var draw_shape = function(shape, transform) {
		var edges = shape.edges;
		var pts = shape.pts;

		context.strokeStyle = shape.color || "#00000000";
		transform = transform || mat4.identity();

		for (var i = 0; i < edges.length; i++) {
			// transform the endpoints of the edges
			var a = vec3.transformMat4(pts[edges[i][0]], transform);
			var b = vec3.transformMat4(pts[edges[i][1]], transform);

			// add depth perspective
			a = vec3.depthPerspective(a, FOCAL_LENGTH);
			b = vec3.depthPerspective(b, FOCAL_LENGTH);

			// change 0,0 to center of the canvas, and modify xy-scale
			a[0] = width / 2 + width / 4 * a[0];
			b[0] = width / 2 + width / 4 * b[0];

			a[1] = height / 2 - width / 4 * a[1];
			b[1] = height / 2 - width / 4 * b[1];

			// draw edge on canvas
			context.beginPath();
			context.moveTo(a[0], a[1]);
			context.lineTo(b[0], b[1]);
			context.stroke();
		}
	}

	var original_onload = window.onload || function() {};
	window.onload = function() {
		original_onload();
		CG.main.init();
	}
	return {
		init: init,
		draw: draw_shape,
		clear: clear_canvas
	};
}(window));

// empty default scene
CG.scene = CG.scene || {};
CG.scene.animate = CG.scene.animate || function(time) {};