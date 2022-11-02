(function() {

	var pts = [
		0.0, 4.0, 0.0,
		0.4, 3.9, 0.0,
		0.9, 3.5, 0.0,
		//1.2, 2.5, 0.0,
		1.7, 1.0, 0.0,
		3.0, 0.0, 0.0,
		3.0, -2.0, 0.0,
		1.4, -2.9, 0.0,
		0.0, -3.0, 0.0
	];

	var spline = Spline.bspline(pts, 3);
	var spline_items = spline.length / 3.0;
	var steps = 60;

	var my_shape = function(u, v) {
		// Our function for the shape is discrete in u,
		// and the parametric function will call it with values 
		// outside the range [0, spline_items - 1].
		// Given that our shape is a mirror its very easy to fix this
		// numbers
		if (u < 0) {
			u = 0 - u;
		} else if (u >= spline_items) {
			u = 2 * spline_items - 1 - u;
		}

		var pt = [spline[u * 3 + 0], spline[u * 3 + 1], spline[u * 3 + 2]];
		var angle = Math.PI * 2 * v / steps;
		return vec3.transformMat4(pt, mat4.yRotation(angle));
	}

	var mesh = CG.shapes.newParametricSurface(spline_items, steps, my_shape);

	var onload = window.onload || function() {};

	window.onload = function() {
		onload();

		// >> new texture shader, adds noise texture
		var canvas = CG.main.new3DScene("canvas6", "texture");
		CG.scene.addSurface(canvas, mesh, mat4.scale(1 / 5, 1 / 5, 1), {
			color: [.1, .0, 0, .9, .8, 0, 0.5, 0.5, 0.5, 2],
			lDir: [.5, .8, 0.57]
		});
		CG.scene.drawScene(canvas);
	}
})();