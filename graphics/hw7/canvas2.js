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

	// >> modified to use 3 iterations
	var iterations = 3;
	var spline = Spline.bspline(pts, iterations);
	var onload = window.onload || function() {};
	window.onload = function() {
		onload();

		var canvas = CG.main.new3DScene("canvas2", "wire");
		var matrix = mat4.scale(1 / 5, 1 / 5, 1)
		CG.scene.addObject(canvas, spline, matrix);
		CG.scene.drawScene(canvas);
	}
})();