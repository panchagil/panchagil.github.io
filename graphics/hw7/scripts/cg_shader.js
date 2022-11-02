var CG = CG || {};
CG.Shader = (function() {

	/* Creates a shader object of the given 'type' 
	 * using the 'src' as source code
	 */
	var loadShader = function(gl, src, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	};

	/** Creates a new shader program with the appropriate vert and frag shaders*/
	var newShaderProgram = function(gl, vertShaderStr, fragShaderStr) {

		var vertexShader = loadShader(gl, vertShaderStr, gl.VERTEX_SHADER);
		var fragmentShader = loadShader(gl, fragShaderStr, gl.FRAGMENT_SHADER);

		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.log("Could not initialize shaders");
		}

		return shaderProgram;
	};


	return {
		newShaderProgram: newShaderProgram
	}
})();