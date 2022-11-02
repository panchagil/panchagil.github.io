var CG = CG || {};
CG.Scene = CG.Scene || {};

CG.Scene.FinalScene = (function() {

	/**
	 * For the shapes
	 * --------------
	 **/

	var floorFabric = function(u, v) {
		var x = u - 0.5;
		var z = v - 0.5;

		// shape noise
		var k11 = 0.1,
			k21 = 2;
		// detail noise
		var k12 = 0.03,
			k22 = 15;

		var y = k11 * Perlin.noise(k21 * x, k21, k21 * z) + k12 * Perlin.noise(k22 * z, k22, k22 * x);
		return [x, y, z];
	}

	var FinalScene = function() {
		this.shaders = new Array();
		this.objects = new Array();

		this.projectionMatrix = mat4.perspective(1, 10);

		this.camera = {
			position: [0.5, 1.0, 4],
			target: [0, 1, 0],
			up: [0, 1, 0]
		};
	}


	FinalScene.prototype.start = function() {
		var defaultProgram = this.glHelper.createShader({
			vs: "shaders/default.vs",
			fs: "shaders/default.fs"
		});

		var grassProgram = this.glHelper.createShader({
			vs: "shaders/default.vs",
			fs: "shaders/grass.fs"
		});
		this.startTime = (new Date).getTime();

		// create the ground
		var floorArray = CG.shapes.createParametric(1 / 50, 1 / 50, floorFabric);
		var floorBuff = this.glHelper.createVertexBuffer(floorArray);
		this.floor = this.addObject(
			new CG.Entity({
				geometry: floorBuff,
				program: grassProgram,
				transform: mat4.scale(10, 5, 5)
			})
		);

		// // create a sphere
		// var sphere = CG.shapes.createSphere(20, 20);
		// var sphereBuff = this.glHelper.createVertexBuffer(sphere);
		// var sphereEntity = this.addOject(new CG.Entity({
		// 	geometry: sphereBuff,
		// 	program: defaultProgram
		// }));
		// sphereEntity.transform = mat4.scale(0.2);
		// this.sphere = sphereEntity;
	}

	FinalScene.prototype.addObject = function(entity) {
		this.objects.push(entity);
		return entity;
	}
	FinalScene.prototype.draw = function() {

		var gl = this.glHelper.gl;
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.enable(gl.DEPTH_TEST);

		// draw floor
		var totalLevels = 15;
		for (var i = 0; i < totalLevels; i++) {
			this.floor.transform = mat4.multiply(
				mat4.scale(10, 5, 5),
				mat4.translation(0, i * 0.0009, 0));

			this.drawObj(this.floor);
		}
	}

	FinalScene.prototype.drawObj = function(entity) {
		var gl = this.glHelper.gl;

		var program = entity.program.program;
		var vBuffer = entity.geometry;

		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);


		gl.enableVertexAttribArray(program.attrLocation['aVertexPosition']);
		gl.vertexAttribPointer(program.attrLocation['aVertexPosition'],
			vBuffer.positionElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.positionOffset
		);
		gl.vertexAttribPointer(program.attrLocation['aVertexNormal'],
			vBuffer.normalElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.normalOffset
		);

		gl.vertexAttribPointer(program.attrLocation['aVertexTangent'],
			vBuffer.tangentElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.tangentOffset
		);

		gl.vertexAttribPointer(program.attrLocation['aVertexBitangent'],
			vBuffer.bitangentElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.bitangentOffset
		);

		gl.vertexAttribPointer(program.attrLocation['aVertexUV'],
			vBuffer.uvElementCount,
			gl.FLOAT,
			false,
			vBuffer.stride,
			vBuffer.uvOffset
		);

		var objectMatrix = entity.transform;

		gl.uniformMatrix4fv(program.uniformLocation['uPMatrix'], false, mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0));
		gl.uniformMatrix4fv(program.uniformLocation['uVMatrix'], false, mat4.lookAt(this.camera.position, this.camera.target, this.camera.up));
		gl.uniformMatrix4fv(program.uniformLocation['uOMatrix'], false, objectMatrix);
		gl.uniformMatrix4fv(program.uniformLocation['uNMatrix'], false, mat4.normalMatrix(objectMatrix));

		// SET THE VALUES FOR THIS FRAME FOR ALL USER DEFINED UNIFORMS:

		for (var i = 0; i < entity.uniforms.length; i++) {
			var name = entity.uniforms[i];
			var val = entity.uniforms[i];
			var type = program.gl_attributes[name].type;
			var loc = program.uniformLocations[name];

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
	FinalScene.prototype.update = function() {
		var time = ((new Date).getTime() - this.startTime) / 1000;
		this.draw();
	}
	return FinalScene;
})();