var GLHelper = GLHelper || {};
GLHelper.main = (function() {

	var _initGL = function(canvas) {
		var gl;

		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0, 0, 0, 0);
			//gl.enable(gl.DEPTH_TEST);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.enable(gl.BLEND);
		} catch (e) {
			alert("Could not initialise WebGL.");
		}

		return gl;
	}

	var _setUniform = function(name, value) {
		for (var i = 0; i < this.uniformNames.length; i++)
			if (this.uniformNames[i] == name) {
				this.uniformValues[i] = value;
				break;
			}
	}

	var _setSampler2D = function(name, value) {
		var image = new Image();
		image.onload = function() {
			var gl = this.obj.gl;
			gl.bindTexture(gl.TEXTURE_2D, this.obj.textures[name] = gl.createTexture());
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		image.obj = this;
		image.src = value;
	}

	var _setLocalSampler2D = function(name, dataArray, type, width, height) {
		var gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.textures[name] = gl.createTexture());
		gl.texImage2D(gl.TEXTURE_2D, 0, gl[type], width, height, 0, gl[type], gl.UNSIGNED_BYTE, dataArray);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	var _createVertexBuffer = function(gl, vertArray) {
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertArray), gl.DYNAMIC_DRAW);

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
	var _createProgram = function(fragShaderId) {
		return GLHelper.shader.createShaderProgram(this.gl, fragShaderId);
	}
	var _createMesh = function(vertArray, fragShaderId) {
		var gl = this.gl;
		var obj = {
			gl: gl,
			mesh: _createVertexBuffer(gl, vertArray),
			transform: mat4.identity(),
			material: {
				gl: gl
			}
		}
		obj.material.program = GLHelper.shader.createShaderProgram(gl, fragShaderId);
		var parse = GLHelper.shader.parseProgram(gl, obj.material.program);

		obj.material.uniformTypes = parse.uniformTypes;
		obj.material.uniformNames = parse.uniformNames;
		obj.material.uniformValues = parse.uniformValues;
		obj.material.program.uniformLocations = parse.uniformLocations;

		obj.material.textures = {};
		obj.material.setUniform = _setUniform;
		obj.material.setSampler2D = _setSampler2D;
		obj.material.setLocalSampler2D = _setLocalSampler2D

		obj.updateVertex = function(vertArray) {
			this.mesh = _createVertexBuffer(this.gl, vertArray);
		}
		return obj;
	}

	var _drawMesh = function(obj, matrix, camera) {
		var gl = this.gl;
		var sProgram = obj.material.program;
		var vBuffer = obj.mesh;

		if (this.depthtest && !obj.material.nodepth) {
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}
		if (this.blend || obj.material.blend) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.enable(gl.BLEND);
		} else {
			gl.disable(gl.BLEND);
		}

		gl.useProgram(sProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

		var i = 0;
		for (var name in obj.material.textures) {
			var texture = obj.material.textures[name];
			gl.activeTexture(gl.TEXTURE0 + i)
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(sProgram.uniformLocations[name], i);
			i = i + 1;
		}

		// SET VALUES FOR THIS FRAME FOR ALL DEFAULT UNIFORMS:

		gl.vertexAttribPointer(sProgram.vertexPositionAttribute,
			vBuffer.positionElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.positionOffset
		);
		gl.vertexAttribPointer(sProgram.vertexNormalAttribute,
			vBuffer.normalElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.normalOffset
		);

		gl.vertexAttribPointer(sProgram.vertexTangentAttribute,
			vBuffer.tangentElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.tangentOffset
		);

		gl.vertexAttribPointer(sProgram.vertexBitangentAttribute,
			vBuffer.bitangentElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.bitangentOffset
		);

		gl.vertexAttribPointer(sProgram.vertexUVAttribute,
			vBuffer.uvElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.uvOffset
		);
		gl.uniformMatrix4fv(sProgram.pMatrixUniform, false, mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0));
		gl.uniformMatrix4fv(sProgram.vMatrixUniform, false, mat4.lookAt(camera.position, camera.target, camera.up));
		gl.uniformMatrix4fv(sProgram.oMatrixUniform, false, matrix);
		gl.uniformMatrix4fv(sProgram.nMatrixUniform, false, mat4.normalMatrix(matrix));

		// SET THE VALUES FOR THIS FRAME FOR ALL USER DEFINED UNIFORMS:

		for (var i = 0; i < obj.material.uniformNames.length; i++) {
			var name = obj.material.uniformNames[i];
			var type = obj.material.uniformTypes[i];
			var val = obj.material.uniformValues[i];
			var loc = sProgram.uniformLocations[name];

			// SETTING EACH TYPE OF UNIFORM REQUIRES A DIFFERENT GL FUNCTION:

			if (type == "float")
				gl.uniform1f(loc, val);
			else if (type == "float[]")
				gl.uniform1fv(loc, val);
			else if (type == "vec2")
				gl.uniform2fv(loc, val);
			else if (type == "vec3")
				gl.uniform3fv(loc, val);
			else if (type == "vec4")
				gl.uniform4fv(loc, val);
			else if (type == "mat4")
				gl.uniformMatrix4fv(loc, false, val);
			else if (type == "bool") {
				gl.uniform1i(loc, val);
			}
		}

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vBuffer.numItems);

	}
	var _prepareCanvas = function() {
		var gl = this.gl;
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	var instance = function(canvas) {
		var gl = _initGL(canvas);
		return {
			gl: gl,
			createMesh: _createMesh,
			createProgram: _createProgram,
			prepareCanvas: _prepareCanvas,
			draw: _drawMesh,
			depthtest: true,
			blend: false

		}
	}
	return {
		instance: instance
	}
})();