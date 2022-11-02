Spline = (function() {
	/** Chaikin Algorithm for B-Splines**/
	var chaikin = function(pts, rec) {
		if (rec == 0) {
			return pts;
		}
		var items = pts.length / 3.0
		var pts2 = [pts[0], pts[1], pts[2]];
		for (var i = 0; i < items - 1; i++) {
			var j = 3 * i;
			pts2[3 + 2 * j + 0] = 3 / 4 * pts[j + 0] + 1 / 4 * pts[j + 3];
			pts2[3 + 2 * j + 1] = 3 / 4 * pts[j + 1] + 1 / 4 * pts[j + 4];
			pts2[3 + 2 * j + 2] = 3 / 4 * pts[j + 2] + 1 / 4 * pts[j + 5];

			pts2[3 + 2 * j + 3] = 1 / 4 * pts[j + 0] + 3 / 4 * pts[j + 3];
			pts2[3 + 2 * j + 4] = 1 / 4 * pts[j + 1] + 3 / 4 * pts[j + 4];
			pts2[3 + 2 * j + 5] = 1 / 4 * pts[j + 2] + 3 / 4 * pts[j + 5];
		}
		pts2.push(pts[pts.length - 3], pts[pts.length - 2], pts[pts.length - 1]);

		return chaikin(pts2, rec - 1);
	}

	return {
		bspline: chaikin
	}
})();