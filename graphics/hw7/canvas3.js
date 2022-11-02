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

	// >> number of meridians
	var steps = 30;

	var iterations = 3;
	var spline = Spline.bspline(pts, iterations);
	var onload = window.onload || function() {};
	window.onload = function() {
		onload();

		var canvas = CG.main.new3DScene("canvas3", "wire");

		// >> we add one object for each meridian line
		for (var u = 0; u < steps; u++) {
			var angle = Math.PI * 2 / steps * u;
			var matrix = mat4.multiply(
				mat4.yRotation(angle),
				mat4.scale(1 / 5, 1 / 5, 1)
			);
			CG.scene.addObject(canvas, spline, matrix);
		}
		CG.scene.drawScene(canvas);
	}
})();