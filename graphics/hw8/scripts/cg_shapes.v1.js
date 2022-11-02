var CG = CG || {};

/**
 * CG Shapes v_1
 * ----------
 * Deprecated
 **/
CG.shapes_v1 = (function() {

	/* original create parametric function */
	var createParametric = function(du, dv, f) {
		var vertices = [];

		// RETURN BOTH POINT AND NORMAL AT THIS [u,v]:

		function fd(u, v) {

			// USER'S FUNCTION f MUST EVALUATE TO AN [x,y,z] POINT:

			u = Math.max(0, Math.min(1, u));
			v = Math.max(0, Math.min(1, v));
			var p = f(u, v);

			// TO COMPUTE NORMAL VECTOR, TAKE THE CROSS PRODUCT
			// OF TANGENT VECTORS COMPUTED BY FINITE DIFFERENCE:

			var pu = f(u + du / 100, v);
			var ux = pu[0] - p[0],
				uy = pu[1] - p[1],
				uz = pu[2] - p[2];

			var pv = f(u, v + dv / 100);
			var vx = pv[0] - p[0],
				vy = pv[1] - p[1],
				vz = pv[2] - p[2];

			var x = uy * vz - uz * vy;
			var y = uz * vx - ux * vz;
			var z = ux * vy - uy * vx;
			var r = Math.sqrt(x * x + y * y + z * z);

			// RETURN BOTH THE POINT AND THE NORMAL:

			return [p[0], p[1], p[2], x / r, y / r, z / r, ux, uy, uz, vx, vy, vz];
		}

		// ADD A SINGLE QUAD, COVERING PARAMETRIC RANGE [u,v]...[u+du,v+dv]:

		function addQuad(u, v, a, b, c, d) {

			// EACH VERTEX IS: x,y,z, nx,ny,nz, u,v

			vertices.push(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], u, v);
			vertices.push(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], u + du, v);
			vertices.push(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], u + du, v + dv);
			vertices.push(d[0], d[1], d[2], d[3], d[4], d[5], f[6], d[7], d[8], d[9], d[10], d[11], u, v + dv);
			vertices.push(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], u, v);
		}

		// THE FOLLOWING WOULD BE MORE EFFICIENT IF IT
		// CREATED TRIANGLE STRIPS IN THE INNER LOOP:

		for (var v = 0; v < 1; v += dv)
			for (var u = 0; u < 1; u += du)
				addQuad(u, v, fd(u, v), fd(u + du, v), fd(u + du, v + dv), fd(u, v + dv));

		return vertices;
	}
	/** Creates a 2D circle on plane xz 
	 * uses 'steps' lines to approximate the circle.
	 *
	 * returns points [x,y,z]
	 */
	var circle = function(steps) {
		var pts = [];
		for (var u = 0; u < steps; u++) {
			var angle = Math.PI * 2 / steps * u;
			pts.push(Math.cos(angle), 0, Math.sin(angle));
		}
		return pts;
	}



	return {
		newCircle: circle,
		createParametric: createParametric
	}
})();