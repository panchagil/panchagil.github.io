var CG = CG || {};

/**
 * CG Main
 * -------
 * Basic functionalities for creating a webgl scene
 *
 **/
CG.main = (function(Shader) {

	/*
	 * Initializes webgl context for a given canvas
	 * returns the context
	 */
	var initGL = function(canvas) {
		var gl;

		try {
			gl = canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0.0, 0.0, 0.0, 0.0);
			gl.enable(gl.DEPTH_TEST);
		} catch (e) {
			console.log("Could not initialise WebGL.");
		}
		return gl;
	}

	/** Creates a new scene with the specified shader 
	 *
	 * canvas_id: id of the html canvas element
	 * shader_name: name of the shader to use, must be one of the available
	 * shader in scripts/shaders/ folder
	 *
	 */
	var new3DScene = function(canvas_id, shader_name) {
		var canvas = document.getElementById(canvas_id);
		canvas.shader = CG.Shader[shader_name];

		canvas.gl = initGL(canvas);

		// TODO: ideally shader should be associated with an object
		canvas.program = canvas.shader.newShaderProgram(canvas.gl);

		// initialize some attributes of our canvas
		canvas.objs = [];

		return canvas;
	};

	return {
		new3DScene: new3DScene
	};
})(CG.Shader);