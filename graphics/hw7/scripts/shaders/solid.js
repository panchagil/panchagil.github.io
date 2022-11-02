/**
 * CG Shader - Solid
 * ----------------
 * Shader that draws a solid mesh, including phong illumination
 **/
CG.Shader.solid = (function() {

	var defaults = {
		p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		lDir: [.57, .57, 0.57]
	}

	/** Both shader are based in the code provided by Prof. Perlin */

	var fragShaderStr = "\
	precision mediump float;\
	uniform float p[10];\
	uniform vec3 lDir;\
	varying vec3 vNormal;\
	\
	void main(void) {\
		vec3 normal = normalize(vNormal);\
		float ldn = dot(lDir, normal);\
		float diffuse = max(0., ldn);\
		\
		vec3 refl = 2. * ldn * normal - lDir;\
		float specular = pow(max(0., refl.z), p[9]);\
		vec3 c = vec3(p[0],p[1],p[2]) +\
				vec3(p[3],p[4],p[5]) * diffuse +\
				vec3(p[6],p[7],p[8]) * specular;\
		gl_FragColor = vec4(pow(c.x, 0.45), pow(c.y, 0.45), pow(c.z, 0.45), 1.0);\
	}";

	var vertShaderStr = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	attribute vec3 aVertexNormal;\
	attribute vec2 aVertexUV;\
	uniform mat4 uMVMatrix; /* object matrix */\
	uniform mat4 uPMatrix; /* perspective matrix */\
	uniform mat4 uNMatrix; /* normal matrix */\
	varying vec4 vXYZW;\
	varying vec3 vNormal;\
	varying vec3 vXYZ;\
	varying vec2 vUV;\
	void main(void) {\
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
		vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);\
		vXYZW = gl_Position;\
		vXYZ = aVertexPosition;\
		vUV = aVertexUV;\
	}";

	/** Creates a new program object that uses the vertex and fragment
	 * shaders defined above.
	 */
	var newShaderProgram = function(gl, solid) {
		var shaderProgram = CG.Shader.newShaderProgram(gl, vertShaderStr, fragShaderStr);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

		shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

		shaderProgram.vertexUVAttribute = gl.getAttribLocation(shaderProgram, "aVertexUV");
		gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);
		shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

		shaderProgram.p = gl.getUniformLocation(shaderProgram, "p");
		shaderProgram.lDir = gl.getUniformLocation(shaderProgram, "lDir");

		return shaderProgram;
	};

	/**
	 * Draws an object to the canvas. Assumes the shader passed it a solid-shader.
	 * Also assumes the objects have the format ...
	 *
	 **/
	var drawObject = function(gl, shader, obj) {
		var mvMatrix = obj.matrix;
		var vBuffer = obj.vertexBuffer;

		gl.useProgram(shader);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

		gl.vertexAttribPointer(shader.vertexPositionAttribute,
			vBuffer.positionElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.positionOffset
		);
		gl.vertexAttribPointer(shader.vertexNormalAttribute,
			vBuffer.normalElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.normalOffset
		);
		gl.vertexAttribPointer(shader.vertexUVAttribute,
			vBuffer.uvElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.uvOffset
		);

		gl.uniformMatrix4fv(shader.pMatrixUniform, false, mat4.perspective(10));
		gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(shader.nMatrixUniform, false, mat4.normalMatrix(mvMatrix));
		gl.uniform1fv(shader.p, obj.options.color || defaults.p);
		gl.uniform3fv(shader.lDir, obj.options.lDir || defaults.lDir);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vBuffer.numItems);
	}

	return {
		newShaderProgram: newShaderProgram,
		drawObject: drawObject
	}
})();
