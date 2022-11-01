(function(cos, sin) {
	var vec3 = {};

	/* transforms a point by a 4x4 matrix */
	vec3.transformMat4 = function(p, m) {
		return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
			m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
			m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
	}

	/** Simple depth perspective transform
	 */
	vec3.depthPerspective = function(p, focalLength) {
		var pz = focalLength / (focalLength - p[2]);
		return [p[0] * pz, p[1] * pz, pz];
	}

	vec3.normalize = function(p) {
		var length = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
		return [p[0] / length, p[1] / length, p[2] / length];
	}

	var mat4 = {};
	mat4.perspective = function(aspect, fl) {
		return [aspect, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, -1 / fl, -1 / fl, /**/ 0, 0, 0, 1];
	};

	mat4.normalMatrix = function(m) {
		var sx = m[0] * m[0] + m[1] * m[1] + m[2] * m[2];
		var sy = m[4] * m[4] + m[5] * m[5] + m[6] * m[6];
		var sz = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];

		return [m[0] / sx, m[1] / sx, m[2] / sx, 0,
			m[4] / sy, m[5] / sy, m[6] / sy, 0,
			m[8] / sz, m[9] / sz, m[10] / sz, 0, 0, 0, 0, 1];
	};
	mat4.identity = function() {
		return [1, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, 1, 0, /**/ 0, 0, 0, 1];
	};

	mat4.translation = function(a, b, c) {
		return [1, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, 1, 0, /**/ a, b, c, 1];
	}

	mat4.xRotation = function(rad) {
		return [1, 0, 0, 0, /**/ 0, cos(rad), sin(rad), 0, /**/ 0, -sin(rad), cos(rad), 0, /**/ 0, 0, 0, 1];
	}

	mat4.yRotation = function(rad) {
		return [cos(rad), 0, -sin(rad), 0, /**/ 0, 1, 0, 0, /**/ sin(rad), 0, cos(rad), 0, /**/ 0, 0, 0, 1];
	}

	mat4.zRotation = function(rad) {
		return [cos(rad), sin(rad), 0, 0, /**/ -sin(rad), cos(rad), 0, 0, /**/ 0, 0, 1, 0, /**/ 0, 0, 0, 1];
	}

	mat4.scale = function(a, b, c) {
		b = b || a;
		c = c || a;
		return [a, 0, 0, 0, /**/ 0, b, 0, 0, /**/ 0, 0, c, 0, /**/ 0, 0, 0, 1];
	}

	mat4.multiply = function(a, b) {

		var m = [],
			_b0 = b[0],
			_b1 = b[1],
			_b2 = b[2],
			_b3 = b[3];

		m[0] = a[0] * _b0 + a[4] * _b1 + a[8] * _b2 + a[12] * _b3;
		m[1] = a[0 + 1] * _b0 + a[4 + 1] * _b1 + a[8 + 1] * _b2 + a[12 + 1] * _b3;
		m[2] = a[0 + 2] * _b0 + a[4 + 2] * _b1 + a[8 + 2] * _b2 + a[12 + 2] * _b3;
		m[3] = a[0 + 3] * _b0 + a[4 + 3] * _b1 + a[8 + 3] * _b2 + a[12 + 3] * _b3;

		_b0 = b[4], _b1 = b[5], _b2 = b[6], _b3 = b[7];
		m[4] = a[0] * _b0 + a[4] * _b1 + a[8] * _b2 + a[12] * _b3;
		m[5] = a[0 + 1] * _b0 + a[4 + 1] * _b1 + a[8 + 1] * _b2 + a[12 + 1] * _b3;
		m[6] = a[0 + 2] * _b0 + a[4 + 2] * _b1 + a[8 + 2] * _b2 + a[12 + 2] * _b3;
		m[7] = a[0 + 3] * _b0 + a[4 + 3] * _b1 + a[8 + 3] * _b2 + a[12 + 3] * _b3;

		_b0 = b[8], _b1 = b[9], _b2 = b[10], _b3 = b[11];
		m[8] = a[0] * _b0 + a[4] * _b1 + a[8] * _b2 + a[12] * _b3;
		m[9] = a[0 + 1] * _b0 + a[4 + 1] * _b1 + a[8 + 1] * _b2 + a[12 + 1] * _b3;
		m[10] = a[0 + 2] * _b0 + a[4 + 2] * _b1 + a[8 + 2] * _b2 + a[12 + 2] * _b3;
		m[11] = a[0 + 3] * _b0 + a[4 + 3] * _b1 + a[8 + 3] * _b2 + a[12 + 3] * _b3;

		_b0 = b[12], _b1 = b[13], _b2 = b[14], _b3 = b[15];
		m[12] = a[0] * _b0 + a[4] * _b1 + a[8] * _b2 + a[12] * _b3;
		m[13] = a[0 + 1] * _b0 + a[4 + 1] * _b1 + a[8 + 1] * _b2 + a[12 + 1] * _b3;
		m[14] = a[0 + 2] * _b0 + a[4 + 2] * _b1 + a[8 + 2] * _b2 + a[12 + 2] * _b3;
		m[15] = a[0 + 3] * _b0 + a[4 + 3] * _b1 + a[8 + 3] * _b2 + a[12 + 3] * _b3;

		return m;
	}

	// TODO: should check is not already defined
	window.vec3 = vec3;
	window.mat4 = mat4;

})(Math.cos, Math.sin);