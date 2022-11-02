var GLHelper = GLHelper || {};
GLHelper.ShaderProgram = (function() {

	var shaderTxt = {};

	function error(message) {
		//alert("Error:" + message);
		throw new Error(message);
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

	var ShaderProgram = function(fs_file) {
		var precission = "precision mediump float;";
		var fs = loadShaderText(fs_file);
		// add dependencies
		// TODO: needs optimization
		fs = fs.replace('{glsl_gammacorrect}', GLHelper.shader_utils.glsl_gammacorrect);
		fs = fs.replace('{glsl_fog}', GLHelper.shader_utils.glsl_fog);
		fs = fs.replace('{glsl_noise}', GLHelper.shader_utils.glsl_noise);

		this.shaderTxt = precission + fs;
	};

	return ShaderProgram;
})();