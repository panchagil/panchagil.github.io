/**
 * CG Shader - Wire
 * ----------------
 * Shader that draws wireframe/line-strip objects
 **/
CG.Shader.wire = (function() {

	/**
	 * Fragment shader paints front lines in black,
	 * and back lines in grey.
	 **/
	var fragShaderStr = "\
	precision mediump float;\
	varying vec4 vXYZW;\
	void main(void) {\
		if (vXYZW.z > 0.0){\
			gl_FragColor = vec4(0.8, 0.8, 0.8, 1);\
		}\
		else{\
			gl_FragColor = vec4(0, 0, 0, 1);\
		}\
	}";

	/** Vertex shader simply calculates the position of the vertex
	 * given the perspective and object matrix;
	 * Position is passed to the fragment shader.
	 */
	var vertShaderStr = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	uniform mat4 uMVMatrix; /* object matrix */\
	uniform mat4 uPMatrix; /* perspective matrix */\
	varying vec4 vXYZW;\
	void main(void) {\
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
		vXYZW = gl_Position;\
	}";

	/** Creates a new program object that uses the vertex and fragment
	 * shaders defined above.
	 */
	var newShaderProgram = function(gl) {
		var shaderProgram = CG.Shader.newShaderProgram(gl, vertShaderStr, fragShaderStr);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

		return shaderProgram;

	}
	/**
	 * Draws an object to the canvas. Assumes the shader passed it a wire-shader.
	 * Also assumes the objects are line_strips
	 *
	 **/
	var drawObject = function(gl, shader, obj) {
		gl.useProgram(shader);

		var mvMatrix = obj.matrix;
		gl.uniformMatrix4fv(shader.pMatrixUniform, false, mat4.perspective(10));
		gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
		gl.vertexAttribPointer(shader.vertexPositionAttribute, obj.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);


		gl.lineWidth(1.0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
		gl.drawElements(gl.LINE_STRIP, obj.vertexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	}

	return {
		newShaderProgram: newShaderProgram,
		drawObject: drawObject
	}
})();
