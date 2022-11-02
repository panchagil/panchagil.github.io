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
	var spline_items = spline.length / 3;
	var steps = 60;

	/* Adds perlin noise in the 3 dimensions
	 */
	var add3DNoise = function(pt, a, oct) {
		var n_x = a * Perlin.noise(pt[0] * oct, pt[1] * oct, pt[2] * oct);
		var n_y = a * Perlin.noise(pt[1] * oct, pt[2] * oct, pt[0] * oct);
		var n_z = a * Perlin.noise(pt[2] * oct, pt[0] * oct, pt[1] * oct);

		return [pt[0] + n_x, pt[1] + n_y, pt[2] + n_z];
	}

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
		pt = vec3.transformMat4(pt, mat4.yRotation(angle));

		// >> we add noise to the shape
		return add3DNoise(pt, 0.1, 1.0);

	}

	var mesh = CG.shapes.newParametricSurface(spline_items, steps, my_shape);

	var onload = window.onload || function() {};

	window.onload = function() {
		onload();

		var canvas = CG.main.new3DScene("canvas7", "texture");
		CG.scene.addSurface(canvas, mesh, mat4.scale(1 / 5, 1 / 5, 1), {
			color: [.1, .0, 0, .9, .8, 0, 0.5, 0.5, 0.5, 2],
			lDir: [.5, .8, 0.57]
		});
		CG.scene.drawScene(canvas);
	}

})();