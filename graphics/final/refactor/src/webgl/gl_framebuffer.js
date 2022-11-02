var GLHelper = GLHelper || {};
GLHelper.FrameBuffer = (function() {

	function error(message) {
		alert("Error:" + message);
		throw new Error(message);
	}

	var FrameBuffer = function(options) {
		var width = options.dim[0];
		var height = options.dim[1];
		var b_texture = options.isTexture;
		var b_depth = options.isDepth;
		var gl = options.gl;

		this.bufferId = gl.createFramebuffer();

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.bufferId);

		if (b_depth) {
			var renderbuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			this.renderbuffer = renderbuffer;
		}

		if (b_texture) {
			var rttTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, rttTexture);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);

			gl.bindTexture(gl.TEXTURE_2D, null);
			this.texture = rttTexture;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	}
	return FrameBuffer;
})();