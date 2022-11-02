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

	var steps = 30;
	var iterations = 2;

	var spline = Spline.bspline(pts, iterations);
	var onload = window.onload || function() {};

	window.onload = function() {
		onload();

		var canvas = CG.main.new3DScene("canvas8", "wirenoise");

		// add meridians
		for (var u = 0; u < steps; u++) {
			var angle = Math.PI * 2 / steps * u;
			var objMatrix = mat4.multiply(
				mat4.yRotation(angle),
				mat4.scale(1 / 5)
			);
			CG.scene.addObject(canvas, spline, objMatrix);
		}
		//>> add parallels
		var circle = CG.shapes.newCircle(steps);

		for (var v = 0; v < spline.length / 3; v++) {
			var radius = spline[v * 3 + 0]; // distance on x
			var height = spline[v * 3 + 1]; // distance on y
			if (radius > 0.0) {
				var objMatrix = mat4.multiply(
					mat4.translation(0, height / 5, 0),
					mat4.scale(radius / 5.0)
				);
				CG.scene.addObject(canvas, circle, objMatrix);
			}

		}
		CG.scene.drawScene(canvas);
	}
})();