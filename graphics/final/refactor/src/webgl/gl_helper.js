var GLHelper = GLHelper || {};
GLHelper.Helper = (function() {

	function error(message) {
		alert("Error:" + message);
		throw new Error(message);
	}

	var Helper = function(canvas) {
		this.el = canvas;
		this.gl = null;
	}

	Helper.prototype.initGL = function() {
		try {
			var gl = this.el.getContext("webgl") || this.el.getContext("experimental-webgl");

			gl.viewportWidth = this.el.width;
			gl.viewportHeight = this.el.height;

			// check extension
			var floatTextureSupported = gl.getExtension("OES_texture_float") != null;
			if (!floatTextureSupported) {
				error("Float Texture not supported");
			}

			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);

			this.gl = gl;

		} catch (e) {
			error("Could not initialise WebGL");
		}
	};

	Helper.prototype.newFrameBuffer = function(options) {
		options.gl = this.gl;
		return new GLHelper.FrameBuffer(options);
	}

	Helper.prototype.createShader = function(options) {
		options.gl = this.gl;
		return new GLHelper.Shader(options);
	}

	Helper.prototype.createVertexBuffer = function(vertArray) {
		var vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertArray), this.gl.DYNAMIC_DRAW);

		vertexBuffer.positionElementCount = 3;
		vertexBuffer.normalElementCount = 3;
		vertexBuffer.tangentElementCount = 3;
		vertexBuffer.bitangentElementCount = 3;
		vertexBuffer.uvElementCount = 2;

		vertexBuffer.positionOffset = 0 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.normalOffset = 3 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.tangentOffset = 6 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.bitangentOffset = 9 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.uvOffset = 12 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.stride = 14 * Float32Array.BYTES_PER_ELEMENT;

		vertexBuffer.numItems = vertArray.length / 14;
		return vertexBuffer;
	}

	Helper.prototype.clearCanvas = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	return Helper;
})();