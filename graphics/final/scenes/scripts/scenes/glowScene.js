(function() {
	var onload = window.onload || function() {};
	window.onload = function() {
		onload();
		CG.main.initAll();
		startTime = (new Date).getTime();
		_tick();
	}

	var _tick = function() {
		var time = ((new Date).getTime() - startTime) / 1000;
		CG.main.update(time);
		requestAnimationFrame(_tick);
	};


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

		function barkFabricFabric(tree_id) {
			var barkFabric = function(u, v) {
				var theta = 2 * Math.PI * u;
				var r = 1.0;
				var x = r * Math.cos(theta);
				var z = r * Math.sin(theta);
				var y = 2 * v - 1.0

				// shape noise
				var ax = 0.2,
					ay = 0.2,
					az = 0.2;
				var qx = 2.0,
					qy = 1.0,
					qz = 2.0;

				x += ax * Perlin.noise(qx * x + tree_id, qx * y, qx * z);
				y += ay * Perlin.noise(qy * y + tree_id, qy * z, qy * x);
				z += az * Perlin.noise(qz * z + tree_id, qz * x, qz * y);
				return [x, y, z];
			}
			return barkFabric;
		}

		function rockFabricFabric(rock_id) {
			var rockFabric = function(v, u) {
				var theta = 2 * Math.PI * u;
				var phi = Math.PI * (v - .5);
				var cosP = Math.cos(phi);

				var x = Math.cos(theta) * cosP;
				var y = Math.sin(theta) * cosP;
				var z = Math.sin(phi);

				// shape noise
				var ax = 0.1,
					ay = 0.2,
					az = 0.2;
				var qx = 3.0,
					qy = 3.0,
					qz = 3.0;

				x += ax * Perlin.noise(qx * x + rock_id, qx * y, qx * z);
				y += ay * Perlin.noise(qy * y + rock_id, qy * z, qy * x);
				z += az * Perlin.noise(qz * z + rock_id, qz * x, qz * y);
				return [x, y, z];
			}
			return rockFabric;
		}

		function backgroundFabric(u, v) {
			return [u - 0.5, -v + 0.5, 0];
		}


	var rocks_positions = [
		[1.6, 0, 1.2],
		[1.0, 0, 0.0],
		[-0.5, 0, -2.0]
	];
	var ambientLight = [-1, 0, 1];
	var ambientColor = [0.5, 0.5, 0.5];
	var pointLight = [-2.0, 1.0, 0];
	var pointColor = [1.0, 1.0, 0.0];

	var scene = CG.main.newScene("canvas");
	scene.setup = function() {
		// this.camera = {
		// 	position: [0.0, 10.0, 0.0],
		// 	target: [0, 0, 0],
		// 	up: [0, 0, 1]
		// };
		this.camera = {
			position: [0.5, 1.0, 4],
			target: [0, 1, 0],
			up: [0, 1, 0]
		};



		/*
		 * Sky Box
		 * -----------------
		 **/

		var skyVB = this.glHelper.createMesh(CG.shapes.createPlane(), 'shader/sky.fs');
		var sky = this.addObject('sky');
		sky.transform = mat4.scale(5);

		var back = sky.addObject('back', skyVB);
		back.transform = mat4.translation(0, 0, -1);


		var left = sky.addObject('left', skyVB);
		left.transform = mat4.multiply(
			mat4.yRotation(Math.PI / 2.0),
			mat4.translation(0, 0, -1)
		);

		// NOTE: camera view does not see this ones.
		// var top = sky.addObject('top', skyVB);
		// top.transform = mat4.multiply(
		// 	mat4.xRotation(Math.PI/2.0),
		// 	mat4.translation(0,0,-1)
		// 	);

		// var right = sky.addObject('right', skyVB);
		// right.transform = mat4.multiply(
		// 	mat4.yRotation(-Math.PI/2.0),
		// 	mat4.translation(0,0,-1)
		// );

		this.particles = [];
		this.speed = [];
		for (var i = 0; i < 20; i++) {
			this.particles.push(0.2 + 0.7 * Math.random()); // x
			this.particles.push(0.5 * Math.random()); // y
			this.particles.push(Math.random()); // r
			this.particles.push(Math.random()); // g
			this.particles.push(Math.random()); // b
			this.particles.push(10.0 + 2.0 * Math.random()); // b
			this.speed.push(0.1 + Math.random());
		}
		skyVB.material.setUniform('particles', this.particles);

		skyVB.material.setSampler2D('uSampler', "img/star.gif");
		this.skyMaterial = skyVB.material;
		this.skyMaterial.blend = true; // so the stars have alpha

		var floorArray = CG.shapes.createParametric(1 / 50, 1 / 50, floorFabric);
		var floor = this.addObject('floor', this.glHelper.createMesh(floorArray, 'shader/phong.fs'));
		floor.geometry.material.setUniform('p', [0.045, 0.03, 0.00, 0.412, 0.8, 0.156, 0.5, 0.5, 0.2, 12.0]);
		floor.geometry.material.setUniform('uAmbientLight', ambientLight);
		floor.geometry.material.setUniform('uAmbientColor', ambientColor);
		floor.geometry.material.setUniform('uPointLight', pointLight);
		floor.geometry.material.setUniform('uPointLightColor', pointColor);
		floor.transform = mat4.scale(10, 5, 5);


		/**
		 * Trees
		 * ------------
		 */
		var trees_positions = [
			[-0.6, 1, 1.2],
			[-1.5, 1, 0.3],
			[-0.0, 1, 0.2],
			[-2.0, 1, -0.3],
			[-1.6, 1, 1.3]
		]
		this.trees = [];
		for (var i = 0; i < trees_positions.length; i++) {
			var treeArray = CG.shapes.createParametric(1 / 50, 1 / 50, barkFabricFabric(i));
			var tree = this.addObject('tree', this.glHelper.createMesh(treeArray, 'shader/phong.fs'));
			tree.geometry.material.setUniform('p', [0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 0.1, 0.1, 0.1, 12.0]);
			tree.geometry.material.setUniform('uAmbientLight', ambientLight);
			tree.geometry.material.setUniform('uAmbientColor', ambientColor);
			tree.geometry.material.setUniform('uPointLight', pointLight);
			tree.geometry.material.setUniform('uPointLightColor', pointColor);
			tree.geometry.material.setSampler2D('uSampler', "img/5745-diffuse.jpg");
			tree.geometry.material.setSampler2D('uNormalSampler', "img/5745-normal.jpg");
			tree.geometry.material.setUniform('textureEnabled', true);
			tree.geometry.material.setUniform('normalEnabled', true);
			tree.geometry.material.setUniform('uTextureX', 3);
			tree.geometry.material.setUniform('uTextureY', 7);

			tree.geometry.transform = mat4.scale(0.2, 2, 0.2);

			tree.geometry.material.blend = false;
			tree.transform = mat4.translation.apply(this, trees_positions[i]);
			this.trees.push(tree);
		}

		/**
		 * Rocks
		 * ------------
		 */

		this.rocks = [];
		for (var i = 0; i < rocks_positions.length; i++) {
			var rockArray = CG.shapes.createParametric(1 / 50, 1 / 50, rockFabricFabric(i));
			var rock = this.addObject('tree', this.glHelper.createMesh(rockArray, 'shader/phong.fs'));
			rock.geometry.material.setUniform('p', [0.02, 0.02, 0.02, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 4.0]);
			rock.geometry.material.setUniform('uAmbientLight', ambientLight);
			rock.geometry.material.setUniform('uAmbientColor', ambientColor);
			rock.geometry.material.setUniform('uPointLight', pointLight);
			rock.geometry.material.setUniform('uPointLightColor', pointColor);
			rock.geometry.material.setSampler2D('uSampler', "img/rock.png");
			// rock.geometry.material.setSampler2D('uNormalSampler', "img/5745-normal.jpg");
			rock.geometry.material.setUniform('textureEnabled', true);
			rock.geometry.material.setUniform('uTextureX', 2);
			rock.geometry.material.setUniform('uTextureY', 1);

			rock.geometry.transform = mat4.multiply(
				mat4.scale(0.5, 0.4, 0.4),
				mat4.zRotation(-(20 + i * 10) * Math.PI / 180)
			);

			rock.geometry.material.blend = false;
			rock.transform = mat4.translation.apply(this, rocks_positions[i]);
			this.rocks.push(rock);
		}

		/**
		 * Grass * blend
		 * --------------
		 **/
		this.floorLevels = [];
		var floorImage = new Uint8Array(256 * 256);
		for (var i = 0; i < 30000; i++) {
			var id = Math.floor(256 * 256 * Math.random());
			floorImage[id] = 200 + Math.floor(56 * Math.random());
		}
		var totalLevels = 15;
		for (var i = 0; i < totalLevels; i++) {
			var level = floor.addObject('floor', this.glHelper.createMesh(floorArray, 'shader/grass.fs'));
			level.geometry.material.setUniform('p', [0.02, 0.03, 0.00, 0.5, 0.8, 0.156, 0.5, 0.5, 0.2, 12.0]);
			level.geometry.material.setUniform('uAmbientLight', ambientLight);
			level.geometry.material.setUniform('uAmbientColor', ambientColor);
			level.geometry.material.setUniform('uPointLight', pointLight);
			level.geometry.material.setUniform('uPointLightColor', pointColor);
			level.geometry.material.setUniform('uLevel', i);
			level.geometry.material.setUniform('uTotalLevels', totalLevels);
			level.geometry.material.setLocalSampler2D('uSamplerGrass', floorImage, 'ALPHA', 256, 256);

			// level.geometry.material.blend = true;

			level.transform = mat4.translation(0, i * 0.0009, 0);
			this.floorLevels[i] = level;
		}

		this.light = this.addObject('light', this.glHelper.createMesh(CG.shapes.createSphere(20, 20), 'shader/simple_glow.fs'));
		this.light.transform = mat4.translation.apply(this, pointLight);
		this.light.geometry.material.setUniform('uColor', pointColor);
		this.light.geometry.transform = mat4.scale(0.06);

	}
	scene.update = function(time) {
		this.skyMaterial.setUniform("uTime", time);
		this.light.transform = mat4.translation.apply(this, pointLight);
	}

	var glow_scene = CG.main.newScene("glow-canvas");
	glow_scene.setup = function() {
		// this.camera = {
		// 	position: [0.0, 10.0, 0.0],
		// 	target: [0, 0, 0],
		// 	up: [0, 0, 1]
		// };
		this.camera = {
			position: [0.5, 1.0, 4],
			target: [0, 1, 0],
			up: [0, 1, 0]
		};

		/*
		 * Sky Box
		 * -----------------
		 **/

		var skyVB = this.glHelper.createMesh(CG.shapes.createPlane(), 'shader/no_glow.fs');
		var sky = this.addObject('sky');
		sky.transform = mat4.scale(5);

		var back = sky.addObject('back', skyVB);
		back.transform = mat4.translation(0, 0, -1);


		var left = sky.addObject('left', skyVB);
		left.transform = mat4.multiply(
			mat4.yRotation(Math.PI / 2.0),
			mat4.translation(0, 0, -1)
		);


		this.skyMaterial = skyVB.material;
		this.skyMaterial.blend = true; // so the stars have alpha

		var floorArray = CG.shapes.createParametric(1 / 50, 1 / 50, floorFabric);
		var floor = this.addObject('floor', this.glHelper.createMesh(floorArray, 'shader/no_glow.fs'));
		floor.transform = mat4.scale(10, 5, 5);


		/**
		 * Trees
		 * ------------
		 */
		var trees_positions = [
			[-0.6, 1, 1.2],
			[-1.5, 1, 0.3],
			[-0.0, 1, 0.2],
			[-2.0, 1, -0.3],
			[-1.6, 1, 1.3]
		]
		this.trees = [];
		for (var i = 0; i < trees_positions.length; i++) {
			var treeArray = CG.shapes.createParametric(1 / 50, 1 / 50, barkFabricFabric(i));
			var tree = this.addObject('tree', this.glHelper.createMesh(treeArray, 'shader/no_glow.fs'));
			tree.geometry.transform = mat4.scale(0.2, 2, 0.2);

			tree.geometry.material.blend = false;
			tree.transform = mat4.translation.apply(this, trees_positions[i]);
			this.trees.push(tree);
		}

		/**
		 * Rocks
		 * ------------
		 */
		this.rocks = [];
		for (var i = 0; i < rocks_positions.length; i++) {
			var rockArray = CG.shapes.createParametric(1 / 50, 1 / 50, rockFabricFabric(i));
			var rock = this.addObject('tree', this.glHelper.createMesh(rockArray, 'shader/glow.fs'));
			rock.geometry.material.setSampler2D('uSampler', "img/rock-glow.png");
			rock.geometry.material.setUniform('uTextureX', 2);
			rock.geometry.material.setUniform('uTextureY', 1);

			rock.geometry.transform = mat4.multiply(
				mat4.scale(0.5, 0.4, 0.4),
				mat4.zRotation(-(20 + i * 10) * Math.PI / 180)
			);

			rock.geometry.material.blend = false;
			rock.transform = mat4.translation.apply(this, rocks_positions[i]);
			this.rocks.push(rock);
		}

		/**
		 * Grass * blend
		 * --------------
		 **/
		this.floorLevels = [];
		var floorImage = new Uint8Array(256 * 256);
		for (var i = 0; i < 30000; i++) {
			var id = Math.floor(256 * 256 * Math.random());
			floorImage[id] = 200 + Math.floor(56 * Math.random());
		}
		var totalLevels = 15;
		for (var i = 0; i < totalLevels; i++) {
			var level = floor.addObject('floor', this.glHelper.createMesh(floorArray, 'shader/no_glow.fs'));
			level.transform = mat4.translation(0, i * 0.0009, 0);
			this.floorLevels[i] = level;
		}

		this.light = this.addObject('light', this.glHelper.createMesh(CG.shapes.createSphere(20, 20), 'shader/simple_glow.fs'));
		this.light.transform = mat4.translation.apply(this, pointLight);
		this.light.geometry.material.setUniform('uColor', pointColor);
		this.light.geometry.transform = mat4.scale(0.06);

		function getMousePos(canvas, evt) {
			var rect = canvas.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		}
		this.el.addEventListener('mousemove', function(evt) {
			var mousePos = getMousePos(canvas, evt);
			pointLight[0] = (0.5) * pointLight[0] + (0.5) * (mousePos.x / 150 - 2.0);
			pointLight[1] = (0.5) * pointLight[1] + (0.5) * (2.5 - mousePos.y / 200);

		}, false);

	}
	glow_scene.update = function() {
		this.light.transform = mat4.translation.apply(this, pointLight);
	}
})();