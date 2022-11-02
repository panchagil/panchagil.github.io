var GLHelper = GLHelper || {};
GLHelper.shader = (function() {
	var DEFAULT_VERTX = "\
	   precision mediump float;\
	   attribute vec3 aVertexPosition;\
	   attribute vec3 aVertexNormal;\
	   attribute vec3 aVertexTangent;\
	   attribute vec3 aVertexBitangent;\
	   attribute vec2 aVertexUV;\
	   uniform mat4 uPMatrix; /* perspective matrix */\
	   uniform mat4 uVMatrix; /* View matrix */\
	   uniform mat4 uOMatrix; /* object matrix */\
	   uniform mat4 uNMatrix; /* normal matrix */\
	   varying vec3 vNormal;\
	   varying vec3 vTangent;\
	   varying vec3 vBitangent;\
	   varying vec3 vXYZ;\
	   varying vec4 vXYZW;\
	   varying vec2 vUV;\
	   void main(void) {\
		  gl_Position = uPMatrix * uVMatrix * uOMatrix * vec4(aVertexPosition, 1.0);\
	      vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);\
	      vTangent = normalize((uNMatrix * vec4(aVertexTangent, 0.0)).xyz);\
	      vBitangent = normalize((uNMatrix * vec4(aVertexBitangent, 0.0)).xyz);\
	      vXYZ = aVertexPosition;\
	      vUV = aVertexUV;\
	      vXYZW = gl_Position;\
	   }";

	var _createShader = function(gl, src, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			alert(gl.getShaderInfoLog(shader));
		return shader;
	}

	var _getFragShaderStr = function(fragShaderId) {
		var el = document.getElementById(fragShaderId);
		var fragShaderStr = "precision mediump float;";
		if (el.hasAttribute("data-include")) {
			var includes = el.getAttribute("data-include").split(";");
			for (var i = 0; i < includes.length; i++) {
				fragShaderStr += GLHelper.shader_utils[includes[i]];
			}
		}
		return fragShaderStr + document.getElementById(fragShaderId).innerHTML;

	}

	var createShaderProgram = function(gl, fragShaderId, vertShaderStr) {
		vertShaderStr = vertShaderStr || DEFAULT_VERTX;
		var fragShaderStr = _getFragShaderStr(fragShaderId);

		// BUILD VERTEX AND FRAGMENT SHADERS, LINK TOGETHER INTO A SHADER PROGRAM:

		var vertShader = _createShader(gl, vertShaderStr, gl.VERTEX_SHADER);
		var fragShader = _createShader(gl, fragShaderStr, gl.FRAGMENT_SHADER);

		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertShader);
		gl.attachShader(shaderProgram, fragShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
			alert("Could not initialise shaders");

		// FIND THE LOCATIONS OF THE DEFAULT SHADER PROGRAM ATTRIBUTES:

		shaderProgram.vertexPositionAttribute =
			gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.vertexNormalAttribute =
			gl.getAttribLocation(shaderProgram, "aVertexNormal");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

		shaderProgram.vertexTangentAttribute =
			gl.getAttribLocation(shaderProgram, "aVertexTangent");
		gl.enableVertexAttribArray(shaderProgram.vertexTangentAttribute);

		shaderProgram.vertexBitangentAttribute =
			gl.getAttribLocation(shaderProgram, "aVertexBitangent");
		gl.enableVertexAttribArray(shaderProgram.vertexBitangentAttribute);

		shaderProgram.vertexUVAttribute =
			gl.getAttribLocation(shaderProgram, "aVertexUV");
		gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
		shaderProgram.oMatrixUniform = gl.getUniformLocation(shaderProgram, "uOMatrix");
		shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

		// PREPARE TO CREATE THE LOCATIONS FOR THE SHADER'S OTHER ATTRIBUTES:

		shaderProgram.uniformLocations = [];

		shaderProgram.fragShaderStr = fragShaderStr;

		return shaderProgram;
	}

	var parseProgram = function(gl, program) {
		var types = [],
			names = [],
			values = [],
			locations = {};
		var str = program.fragShaderStr;

		function skipSpace(str, j) {
			for (; str.substring(j, j + 1) == " "; j++);
			return j;
		}

		for (var i = 0; i < str.length; i++) {

			// PARSE ONE UNIFORM VARIABLE IN SHADER TO GET ITS TYPE AND NAME:

			var j = str.indexOf("uniform", i);
			if (j == -1) {
				break;
			}

			j = skipSpace(str, j + "uniform".length);
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

			// SAVE TYPE, NAME AND DEFAULT VALUE OF THIS UNIFORM VARIABLE:

			types.push(uType);
			names.push(uName);
			values.push(
				uType == "vec2" ? [0, 0] : uType == "vec3" ? [0, 0, 0] : uType == "vec4" ? [0, 0, 0, 0] : uType == "mat4" ? identity() : uType == "float[]" ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0);

			// RECORD THE LOCATION OF THIS VARIABLE IN THE SHADER PROGRAM:

			locations[uName] =
				gl.getUniformLocation(program, uName);

			i = l + 1;
		}

		return {
			uniformTypes: types,
			uniformValues: values,
			uniformNames: names,
			uniformLocations: locations
		}
	}

	return {
		parseProgram: parseProgram,
		createShaderProgram: createShaderProgram
	}
})();
