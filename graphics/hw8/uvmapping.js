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

	var iterations = 3;
	var steps = 50;

	var spline = CG.shapes.bspline(pts, iterations);
	var spline_items = spline.length / 3.0;

	/* Adds perlin noise in the 3 dimensions
	 */
	var add3DNoise = function(pt, a, oct) {
		var n_x = a * Perlin.noise(pt[0] * oct, pt[1] * oct, pt[2] * oct);
		var n_y = a * Perlin.noise(pt[1] * oct, pt[2] * oct, pt[0] * oct);
		var n_z = a * Perlin.noise(pt[2] * oct, pt[0] * oct, pt[1] * oct);

		return [pt[0] + n_x, pt[1] + n_y, pt[2] + n_z];
	}


	var my_shape = function(u, v) {
		if (v < 0) {
			v = 0 - v;
		} else if (v > spline_items - 1) {
			v = 2 * spline_items - 1 - v;
		}

		var pt = [spline[v * 3 + 0], spline[v * 3 + 1], spline[v * 3 + 2]];
		var angle = Math.PI * -2 * u / steps;
		pt = vec3.transformMat4(pt, mat4.yRotation(angle));

		// >> we add noise to the shape
		return add3DNoise(pt, 0.0, 1.0);
	}

	var pear = CG.shapes.createParametricDiscrete(steps, spline_items, my_shape);
	//var pear = CG.shapes.createParametric(1 / 10, 1 / 10, CG.shapes.sph);

	(function() {
		var scene = CG.main.newScene("spline");

		scene.setup = function() {
			var obj = CG.scene.addObject(scene, pear, 'uv_mapping');
			obj.setUniform('p', [.08, .08, .08, .5, .2, 0, 0.9, 0.9, 0.9, 1.0]);
			obj.setUniform('lDir', [0.57, 0.57, 0.57]);
			obj.matrix = mat4.scale(1 / 5, 1 / 5, 1);
			obj.setSampler2D("uSampler", "img/snake_diffuse.jpg");
			obj.setSampler2D("uNormalSampler", "img/snake_normal.jpg");
		};
		scene.update = function(time) {
			var obj = scene.objects[0];
			obj.matrix = mat4.multiply(mat4.yRotation(time / 2.0), mat4.scale(1 / 5, 1 / 5, 1 / 5));
		};

	})();


})();