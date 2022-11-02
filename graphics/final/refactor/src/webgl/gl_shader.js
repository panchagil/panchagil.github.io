var GLHelper = GLHelper || {};
GLHelper.Shader = (function() {

	var shaderTxt = {};

	function error(message) {
		//alert("Error:" + message);
		throw new Error(message);
	}

	function createShader(gl, src, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(src);
			error(gl.getShaderInfoLog(shader));
		}

		shader.gl_attributes = parseShader(src, "attribute");
		shader.gl_uniforms = parseShader(src, "uniform");

		return shader;
	}

	function parseShader(string, primitive) {
		var prim = {};
		var str = string;

		function skipSpace(str, j) {
			for (; str.substring(j, j + 1) == " "; j++);
			return j;
		}

		for (var i = 0; i < str.length; i++) {

			// PARSE ONE UNIFORM VARIABLE IN SHADER TO GET ITS TYPE AND NAME:

			var j = str.indexOf(primitive, i);
			if (j == -1) {
				break;
			}

			j = skipSpace(str, j + primitive.length);
			var k = str.indexOf(" ", j);
			var uType = str.substring(j, k);

			k = skipSpace(str, k);
			var l0 = str.indexOf(";", k);
			var l1 = str.indexOf(" ", k);
			var l = l0 == -1 ? l1 : l1 == -1 ? l0 : Math.min(l0, l1);
			var uName = str.substring(k, l);

			var m = uName.indexOf("[");
			if (m >= 0) {
				uName = uName.substring(0, m);
				uType += "[]";
			}

			prim[uName] = {
				type: uType
			};

			i = l + 1;
		}
		return prim;
	}

	function loadShaderText(url) {
		if (shaderTxt[url] !== undefined) {
			return shaderTxt[url];
		}
		var request = new XMLHttpRequest();
		request.open('GET', url, false);

		var src;
		request.onreadystatechange = function() {

			if (request.readyState == 4) {
				if (request.status == 200) {
					src = request.responseText;
				} else { // Failed
					error("Failed fetching " + url);
				}
			}
		}
		request.send(null);
		shaderTxt[url] = src;
		return src;
	}



	var Shader = function(options) {
		var gl = options.gl;
		var vs = null,
			fs = null;

		vs = createShader(gl, loadShaderText(options.vs), gl.VERTEX_SHADER);
		fs = createShader(gl, loadShaderText(options.fs), gl.FRAGMENT_SHADER);

		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vs);
		gl.attachShader(shaderProgram, fs);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			error("Could not initialise shaders");
		}

		shaderProgram.attrLocation = {};
		shaderProgram.uniformLocation = {};

		// load locations
		for (var name in vs.gl_attributes) {
			shaderProgram.attrLocation[name] = gl.getAttribLocation(shaderProgram, name);;

			gl.enableVertexAttribArray(shaderProgram.attrLocation[name]);
		}
		for (var name in vs.gl_uniforms) {
			shaderProgram.uniformLocation[name] = gl.getUniformLocation(shaderProgram, name);
		}

		for (var name in fs.gl_uniforms) {
			shaderProgram.uniformLocation[name] = gl.getUniformLocation(shaderProgram, name);
		}
		this.program = shaderProgram;
	}

	return Shader;
})();