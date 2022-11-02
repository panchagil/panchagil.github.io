var CG = CG || {};

/**
 * CG Shapes
 * ----------
 * Functions to create basic shapes.
 **/
CG.shapes = (function() {

	/**
	 * du: float, step size in u-axis
	 * dv: float, step size in v-axis
	 * f: user function, should have signature f(u,v) and return an array [x,y,z]
	 **/
	var createParametric = function(du, dv, f) {
		var vertices = [];

		/** Calculates the point, normal and uv
		 * u: float representing the distance in the u-axis
		 * v: float representing the distance in the v-axis
		 *
		 * both u and v vary from 0 to 1.
		 * */
		var fd = function(u, v) {

			// fix for floating point issues
			u = Math.max(0, Math.min(1, u));
			v = Math.max(0, Math.min(1, v));

			// call user function 
			var p = f(u, v);

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

			var rt = Math.sqrt(ux * ux + uy * uy + uz * uz);
			var rb = Math.sqrt(vx * vx + vy * vy + vz * vz);

			//x,y,z, <3-normal>, <3-tangent>, <3-bitangent> u,v
			return [p[0], p[1], p[2], x / r, y / r, z / r, ux / rt, uy / rt, uz / rt, vx / rb, vy / rb, vz / rb, u, v];
		}

		/* u,v : define the point to add
		 * times: int, specify the number of times to add the point
		 */
		var addPoint = function(u, v, times) {
			times = times || 1
			var p = fd(u, v);
			for (var i = 0; i < times; i++) {
				vertices.push.apply(vertices, p);
			}
		}

		/* We iterate on the grid defined by u and v.
		 * on u we change left/right on each iteration
		 *
		 * d c
		 * a b
		 */
		var rigth = true;
		for (var v = 0; v < 1; v += dv) {
			var u;
			if (rigth) {
				u = 0;
				addPoint(u, v); //a
				for (u; u < 1; u += du) {
					addPoint(u, v + dv); //d
					addPoint(u + du, v); //b
				}
				// we add the last point 2 times, the third time is added 
				// by the next iteration. Not optimal but simpler code.
				addPoint(u + du, v + dv, 2); //c
			} else {
				u = 1;
				addPoint(u, v); // b; point c from the previous iteration
				for (u; u > 0; u -= du) {
					addPoint(u, v + dv); // c
					addPoint(u - du, v); //a
				}
				// we add the last point 2 times, the third time is added 
				// by the next iteration
				// this way is consistent with the first iteration where 
				// we start by adding point a
				addPoint(u, v + dv, 2); //d

			}
			rigth = !rigth;
		}

		return vertices;
	}
	//plane in xy
	var createPlane = function() {
		var nx = 0,
			ny = 0,
			nz = 1;
		var ux = 0,
			uy = 1,
			uz = 0;
		var vx = 1,
			vy = 0,
			vz = 0;

		var vertices = [];

		vertices.push(-1, -1, 0, nx, ny, nz, ux, uy, uz, vx, vy, vz, 0, 0);
		vertices.push(-1, 1, 0, nx, ny, nz, ux, uy, uz, vx, vy, vz, 0, 1);
		vertices.push(1, -1, 0, nx, ny, nz, ux, uy, uz, vx, vy, vz, 1, 0);
		vertices.push(1, 1, 0, nx, ny, nz, ux, uy, uz, vx, vy, vz, 1, 1);

		return vertices;
	}

	/** Returns the points  [x,y,z, nx,ny,nz, u,v]
	 * that define a 1x1x1 cube centered at [0,0,0]
	 * tangent and bitangent vectors
	 */
	var createCube = function() {
		var vertices = [];

		function addFace(c, a, b) {
			var x = c[0],
				y = c[1],
				z = c[2];
			var A = a[0],
				B = a[1],
				C = a[2];
			var D = b[0],
				E = b[1],
				F = b[2];

			// EACH VERTEX IS: x,y,z, nx,ny,nz, u,v

			vertices.push(x - A - D, y - B - E, z - C - F, x, y, z, y, z, x, z, x, y, 0, 0);
			vertices.push(x + A - D, y + B - E, z + C - F, x, y, z, y, z, x, z, x, y, 1, 0);
			vertices.push(x + A + D, y + B + E, z + C + F, x, y, z, y, z, x, z, x, y, 1, 1);
			vertices.push(x - A + D, y - B + E, z - C + F, x, y, z, y, z, x, z, x, y, 0, 1);
			vertices.push(x - A - D, y - B - E, z - C - F, x, y, z, y, z, x, z, x, y, 0, 0);
		}

		var xn = [-1, 0, 0],
			yn = [0, -1, 0],
			zn = [0, 0, -1];
		var xp = [1, 0, 0],
			yp = [0, 1, 0],
			zp = [0, 0, 1];

		addFace(xn, yn, zn);
		addFace(xp, yp, zp);
		addFace(yn, zn, xn);
		addFace(yp, zp, xp);
		addFace(zn, xn, yn);
		addFace(zp, xp, yp);

		return vertices;
	}

	/**
	 * Mapping of uv to sphere. Meant to be used with createParametric
	 **/
	var sph = function(u, v) {
		var theta = 2 * Math.PI * u,
			phi = Math.PI * (v - .5),
			cosT = Math.cos(theta),
			cosP = Math.cos(phi),
			sinT = Math.sin(theta),
			sinP = Math.sin(phi);
		return [cosT * cosP, sinT * cosP, sinP];
	}



	return {
		createParametric: createParametric,
		sph: sph,
		createPlane: createPlane,
		createCube: createCube
	}
})();