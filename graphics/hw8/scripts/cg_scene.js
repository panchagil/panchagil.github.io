var CG = CG || {}
CG.scene = (function() {
	/** PRIVATE **/
	var LINES = "LINE_STRIP",
		TRIANGLES = "TRIANGLE_STRIP";

	var _createVertexBuffer = function(gl, vertArray) {
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertArray), gl.STATIC_DRAW);

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

	var _setObjUniform = function(obj, name, value) {
		for (var i = 0; i < obj.uniformNames.length; i++)
			if (obj.uniformNames[i] == name) {
				obj.uniformValues[i] = value;
				break;
			}
	};

	/** Adds a new 2d sampler to the scene
	 * the uniform location is read during the pare, so we don't need
	 * to load it here
	 */
	var _setObjUniformSampler2D = function(gl, obj, name, value) {
		var image = new Image();
		image.onload = function() {
			var gl = this.gl;
			gl.bindTexture(gl.TEXTURE_2D, obj.textures[name] = gl.createTexture());
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		image.gl = gl;
		image.obj = obj;
		image.src = value;
	}

	/** PUBLIC **/
	var drawObject = function(gl, obj) {
		var sProgram = obj.shaderProgram;
		var vBuffer = obj.vertexBuffer;

		gl.useProgram(sProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

		var i = 0;
		for (var name in obj.textures) {
			var texture = obj.textures[name];
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
		gl.uniformMatrix4fv(sProgram.pMatrixUniform, false, mat4.perspective(gl.viewportHeight / gl.viewportWidth, 10));
		gl.uniformMatrix4fv(sProgram.oMatrixUniform, false, obj.matrix);
		gl.uniformMatrix4fv(sProgram.nMatrixUniform, false, mat4.normalMatrix(obj.matrix));

		// SET THE VALUES FOR THIS FRAME FOR ALL USER DEFINED UNIFORMS:

		for (var i = 0; i < obj.uniformNames.length; i++) {
			var name = obj.uniformNames[i];
			var type = obj.uniformTypes[i];
			var val = obj.uniformValues[i];
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

		var primitive = obj.drawPrimitive || TRIANGLES;
		gl.drawArrays(gl[primitive], 0, vBuffer.numItems);
	}

	var addObject = function(scene, vertArray, fragShaderId) {
		var obj = {
			matrix: mat4.identity(),
			vertexBuffer: _createVertexBuffer(scene.gl, vertArray),
			shaderProgram: CG.shader.createShaderProgram(scene.gl, fragShaderId),
			uniformNames: [],
			uniformTypes: [],
			uniformValues: []
		};
		scene.objects.push(obj);

		obj.setUniform = function(name, value) {
			_setObjUniform(obj, name, value);
		};

		obj.setSampler2D = function(name, value) {
			_setObjUniformSampler2D(scene.gl, obj, name, value);
		}

		var parse = CG.shader.parseProgram(scene.gl, obj.shaderProgram);

		obj.uniformTypes = parse.uniformTypes;
		obj.uniformNames = parse.uniformNames;
		obj.uniformValues = parse.uniformValues;
		obj.shaderProgram.uniformLocations = parse.uniformLocations;
		obj.textures = {};
		return obj;
	}

	var draw = function(gl, objects) {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		for (var n = 0; n < objects.length; n++) {
			drawObject(gl, objects[n]);
		}
	}
	return {
		addObject: addObject,
		draw: draw,
		LINES: LINES,
		TRIANGLES: TRIANGLES
	}
})();