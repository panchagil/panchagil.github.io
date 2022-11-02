var CG = CG || {};
CG.shapes = (function(PI, cos, sin) {

	/**
	 * Sphere
	 * --------------------------------------------------------
	 * The algorithm we uses was to subdivide each of the six faces of a
	 * unit cube into a mesh, and then "inflate" the cube.
	 *
	 * subdivisions : number of x and y sections of the grid, default 4
	 * radius: radius of the circle, default 0.5
	 **/
	var newSphere = function(subdivisions, radius) {

		radius = radius || 1;
		var shapes = [];

		/**
		 * Generates an n x n grid.
		 * width: total width of the grid, default 1
		 * n: number of subdivisions, default 4
		 */
		var squareGrid = function(width, n, z) {
			width = width || 1;
			n = n || 4;
			var z = z || width / 2.0;

			var edges = [],
				pts = [];

			var step = width / n;
			for (var u = 0; u < n; u++) {
				var u_added = u * n * 4;
				for (var v = 0; v < n; v++) {
					var delta = u_added + 4 * v;

					var t_v = step * (v - n / 2);
					var t_u = step * (u - n / 2);

					pts.push([t_v, t_u, z]); // top left
					pts.push([t_v, t_u + step, z]); // top right
					pts.push([t_v + step, t_u + step, z]); // bottom right
					pts.push([t_v + step, t_u, z]); // bottom left

					edges.push([delta + 0, delta + 1]);
					edges.push([delta + 1, delta + 2]);
					edges.push([delta + 2, delta + 3]);
					edges.push([delta + 3, delta + 0]);
				}

			}
			return {
				edges: edges,
				pts: pts
			};
		}

		var inflateGrid = function(grid_points, radius) {
			var origin = [0, 0, 0];

			for (var i = 0; i < grid_points.length; i++) {
				var pt = grid_points[i];
				var n = [pt[0] - origin[0], pt[1] - origin[1], pt[2] - origin[2]];
				n = vec3.normalize(n);

				pt = [radius * n[0], radius * n[1], radius * n[2]];
				grid_points[i] = pt;
			}
			return grid_points;
		}

		var transformGrid = function(grid, matrix) {
			var pts = [];
			var or_pts = grid.pts;

			for (var i = 0; i < or_pts.length; i++) {
				var pt = or_pts[i];
				pt = vec3.transformMat4(pt, matrix);
				pts.push(pt);
			}

			return {
				pts: pts,
				edges: grid.edges
			}
		}

		var faces = [];
		var grid = squareGrid(2 * radius, subdivisions);

		grid.pts = inflateGrid(grid.pts, radius);


		// now we copy paste to 6 phases
		var m = mat4.translation(0, 0, radius);

		faces.push(transformGrid(grid, mat4.xRotation(PI)));
		faces.push(transformGrid(grid, mat4.xRotation(PI / 2)));
		faces.push(transformGrid(grid, mat4.xRotation(-PI / 2)));
		faces.push(transformGrid(grid, mat4.yRotation(PI / 2)));
		faces.push(transformGrid(grid, mat4.yRotation(-PI / 2)));
		faces.push(grid);

		return {
			faces: faces
		};
	}

	/**
	 * Cylinder
	 * -----------------------------------------------
	 * We generate the cylinder extruding the circle C along the x axis
	 *
	 * nsides: Number of sides for each radial section.
	 * radius: Radius of circle C, default = 1
	 * height: Height of the cylinder, default = 1
	 **/
	var newCylinder = function(nsides, radius, height) {
		radius = radius || 1;
		height = height || 1;

		var v_step = 2 * Math.PI / nsides;

		var pts = [];
		var edges = [];

		var total_points = 2 * nsides + 2;

		for (var v = 0; v < nsides; v++) {
			var v_angle = v_step * v;

			var y = radius * Math.cos(v_angle),
				z = radius * Math.sin(v_angle);

			pts.push([0.5, y, z]);
			pts.push([-0.5, y, z]);

			var top_id = 2 * v,
				bottom_id = top_id + 1,
				top_next = 2 * ((v + 1) % nsides),
				bottom_next = top_next + 1;

			// edges from bottom to top
			edges.push([top_id, bottom_id]);

			// edges of the radial section
			edges.push([top_id, top_next]);
			edges.push([bottom_id, bottom_next]);

			// edges from the radial section to the center of the section
			edges.push([top_id, total_points - 2]);
			edges.push([bottom_id, total_points - 1]);
		}
		// adding the point of the center of the top/bottom
		pts.push([0.5, 0, 0]);
		pts.push([-0.5, 0, 0]);

		return {
			edges: edges,
			pts: pts
		};
	}

	/**
	 * Torus of revolution
	 * --------------------
	 *
	 * We generate the torus rotating the circle C in the xz along the z axis.
	 * diameter of C is outerRadius - innerRadius
	 *
	 * innerRadius: Inner radius of the torus.
	 * outerRadius: Outer radius of the torus.
	 * nsides: Number of sides for each radial section.
	 * rings: Number of radial divisions for the torus.
	 *
	 * returns {pts, edges} of wireframe of the torus
	 */
	var newTorus = function(innerRadius, outerRadius, nsides, rings) {
		var r = (outerRadius - innerRadius) / 2;
		var R = outerRadius - r; // distance from the center of the doughnut to the center of C

		var u_step = 2 * Math.PI / nsides;
		var v_step = 2 * Math.PI / rings;

		var pts = [];
		var edges = [];

		for (var v = 0; v < rings; v++) {
			for (var u = 0; u < nsides; u++) {
				var u_angle = u * u_step;
				var v_angle = v * v_step;
				var h = R + r * Math.cos(u_angle);
				var g = r * Math.sin(u_angle)

				pts.push([h * Math.cos(v_angle), h * Math.sin(v_angle), g]);

				// edges of the radial section
				var delta = v * nsides;
				edges.push([delta + u, delta + (u + 1) % nsides]);

				//edges of the torus
				edges.push([delta + u, ((v + 1) % rings) * nsides + u]);
			}
		}

		return {
			edges: edges,
			pts: pts
		};
	}

	/** Perlin code for generating a 1x1x1 cube */
	var newCube = function() {

		var pts = [
			[-1, -1, -1],
			[1, -1, -1],
			[-1, 1, -1],
			[1, 1, -1],
			[-1, -1, 1],
			[1, -1, 1],
			[-1, 1, 1],
			[1, 1, 1]
		];

		var edges = [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
			[0, 2],
			[1, 3],
			[4, 6],
			[5, 7],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7]
		];

		return {
			pts: pts,
			edges: edges
		};
	}

	return {
		sphere: newSphere,
		cylinder: newCylinder,
		torus: newTorus,
		cube: newCube
	}
})(Math.PI, Math.cos, Math.sin);