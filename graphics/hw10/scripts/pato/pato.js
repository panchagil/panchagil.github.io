var Pato = (function() {

	/** 
	 * This are all the parameters that can
	 * modify Pato's shape and expression
	 *
	 * TODO: change inconsistent names between UI and model
	 */
	var DEFAULTS = {
		"body.xrotation": 0,
		"body.yrotation": 0,
		"body.zrotation": 0,
		"body.x": 0,
		"body.z": 0,
		"head.zrotation": 0,
		"head.xrotation": 0,
		"hat.x": 0,
		"hat.z": 0,
		"peak.x": 0,
		"peak.z": 0,
		"peak.y": 0,
		"leye.w": 30,
		"leye.h": 35,
		"leye.x": 0,
		"leye.pupil.x": 0,
		"leye.pupil.y": 0,
		"leye.pupil.size": 15,
		"leye.eyelid.top": 0,
		"leye.eyelid.bottom": 0,
		"reye.w": 30,
		"reye.h": 25,
		"reye.x": 0,
		"reye.pupil.x": 0,
		"reye.pupil.y": 0,
		"reye.pupil.size": 15,
		"reye.eyelid.top": 0,
		"reye.eyelid.bottom": 0
	};

	/** 
	 * Implements ParametricSurface
	 * ------------------
	 * Creates a shape similar to a cylinder
	 * but with a smaller bottom radius
	 */
	var cyl = function(u, v) {
		var theta = 2 * Math.PI * u;
		var r = 1.0 - 0.1 * (1 - v);
		var x = r * Math.cos(theta);
		var z = r * Math.sin(theta);
		var y = 2 * v - 1.0
		return [x, y, z];
	}

	/**
	 * Implements ParametricSurfaceBuilder
	 * ------------------
	 * Returns an implementation of ParametricSurface that creates a part of a sphere.
	 * options.height: 1 - full sphere, 0.5 - half sphere
	 */
	var hfsph = function(options) {
		options = options || {};
		var h = options.height === undefined ? 0.5 : options.height;
		return function(u, v) {
			var theta = 2 * Math.PI * u;
			var phi = h * Math.PI * (1 - v);
			var R = Math.sin(phi);
			var x = R * Math.cos(theta);
			var z = R * Math.sin(theta);
			var y = Math.cos(phi);

			return [x, y, z];
		}
	}

	/**
	 * Implements ParametricSurfaceBuilder
	 * ------------------
	 * Returns an implementation of ParametricSurface that creates the peak of pato.
	 * options.sneer : makes the front of the peak turn up/down
	 * options.twist: makes the peak twist on intslef
	 */
	var pk = function(options) {
		options = options || {};
		var sneer = options.sneer || 0;
		var twist = options.twist || 0;
		return function(u, v) {

			var theta = 2 * Math.PI * u;
			var phi = Math.PI * (v - 0.5);
			var R = Math.cos(phi);
			var x = 1.3 * R * Math.cos(theta);
			var z = R / 3 * Math.sin(theta);
			var y = 2.5 * Math.sin(phi);

			if (z > 0) z = 2 * z;
			var p = [x, y, z];

			if (y >= 0.5) {
				var angle = 1.0 * (y >= 1.0 ? 1 : y);
				m = mat4.multiply(
					mat4.translation(0, 0.5, 0.0),
					mat4.multiply(
						mat4.xRotation(sneer * angle * Math.PI / 2.0),
						mat4.translation(0, -0.5, 0)
					));
				p = vec3.transformMat4(p, m);

			}

			//torce the peak
			var m = mat4.yRotation(v * twist * Math.PI / 2);
			p = vec3.transformMat4(p, m)
			return p;

		}
	}

	/** shader parameters */
	var ldir = [1.0, 0.0, -0.5];
	var yellow = [.40, .3, .00, 0.7, .7, .01, 0.0, 0.0, 0.0, 1.0];
	var orange = [0.25, .020, .00, 0.7, 0.47, .10, 0.0, 0.0, 0.0, 1.0];
	var white = [.5, .5, .5, 0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0];
	var green = [.003, 0.064, 0.035, .03, 0.64, 0.25, 0.0, 0.0, 0.0, 1.0];


	/* some common shapes for the different parts of Pato*/
	var cilynder = CG.shapes.createParametric(1 / 10, 1, cyl);
	var halfSph = CG.shapes.createParametric(1 / 10, 1 / 10, hfsph());
	var peak = CG.shapes.createParametric(1 / 20, 1 / 40, pk(0));
	var sphere = CG.shapes.createSphere(20, 10);


	/**
	 * Set of functions to build pato
	 * ------------------
	 **/

	var PatoBuilder = {
		addFace: function(scene, pato) {
			// round part of the top
			var top = scene.glHelper.createMesh(halfSph, 'uv_mapping');
			top.material.setUniform('p', yellow);
			top.material.setUniform('lDir', ldir);

			// cylinder for the head
			var head = scene.glHelper.createMesh(cilynder, 'uv_mapping');
			head.material.setUniform('p', yellow);
			head.material.setUniform('lDir', ldir);
			head.transform = mat4.multiply(
				mat4.scale(1.0, 1.0, 1.0),
				mat4.translation(0, -1.0, 0)
			);

			pato.head = pato.addObject('head', head);
			pato.head.addObject('top', top);

		},
		addNeck: function(scene, pato) {
			// cylinder for the neck
			var neck = scene.glHelper.createMesh(cilynder, 'uv_mapping');
			neck.material.setUniform('p', yellow);
			neck.material.setUniform('lDir', ldir);
			neck.transform = mat4.multiply(
				mat4.translation(0, -4.6, 0),
				mat4.scale(0.9, 3.0, 0.9)
			);

			pato.neck = pato.addObject('head', neck);
		},
		addPeak: function(scene, pato) {

			var peakMesh = scene.glHelper.createMesh(peak, 'uv_mapping');
			peakMesh.material.setUniform('p', orange);
			peakMesh.material.setUniform('lDir', ldir);
			peakMesh.transform = mat4.xRotation(Math.PI / 2.0);

			// to update the vertex of the mesh instead of modifying each the vertex 
			// we use the parametric function to create the vertex with the modifications
			// performance should be similar.
			peakMesh.update = function(options) {
				var peak = CG.shapes.createParametric(1 / 20, 1 / 40, pk(options));
				this.updateVertex(peak);
			}

			pato.peak = pato.head.addObject('pico', peakMesh);
		},
		addEye: function(scene, pato, rol) {
			// eyes
			var name = rol + 'eye';

			var eyeMesh = scene.glHelper.createMesh(sphere, 'uv_eye');
			eyeMesh.material.setUniform('p', white);
			eyeMesh.material.setUniform('lDir', ldir);
			eyeMesh.transform = mat4.translation(0, 0.5, 0);

			var topEyelidMesh = scene.glHelper.createMesh(halfSph, 'uv_mapping');
			topEyelidMesh.material.setUniform('p', orange);
			topEyelidMesh.material.setUniform('lDir', ldir);
			topEyelidMesh.transform =
				mat4.multiply(
					mat4.scale(1.1),
					mat4.translation(0, 0.5, 0)
			);

			var bottomEyelidMesh = scene.glHelper.createMesh(halfSph, 'uv_mapping');
			bottomEyelidMesh.material.setUniform('p', orange);
			bottomEyelidMesh.material.setUniform('lDir', ldir);
			bottomEyelidMesh.transform = mat4.multiply(
				mat4.zRotation(Math.PI),
				mat4.multiply(
					mat4.scale(1.1),
					mat4.translation(0, -0.5, 0)
				)
			);
			topEyelidMesh.update = function(options) {
				var eyelid = CG.shapes.createParametric(1 / 20, 1 / 40, hfsph(options));
				this.updateVertex(eyelid);
			}
			bottomEyelidMesh.update = function(options) {
				var eyelid = CG.shapes.createParametric(1 / 20, 1 / 40, hfsph(options));
				this.updateVertex(eyelid);
			}

			pato[name] = pato.head.addObject(name, eyeMesh);
			pato[name].toplid = pato[name].addObject(name + "toplid", topEyelidMesh);
			pato[name].bottomlid = pato[name].addObject(name + "bottomlid", bottomEyelidMesh);
		},
		addHat: function(scene, pato) {
			// hat
			var tophatMesh = scene.glHelper.createMesh(halfSph, 'uv_mapping');
			tophatMesh.material.setUniform('p', green);
			tophatMesh.material.setUniform('lDir', ldir);
			tophatMesh.transform = mat4.multiply(
				mat4.scale(1.0, 0.4, 1.0),
				mat4.translation(0, -1.0, 0)
			);


			var hatMesh = scene.glHelper.createMesh(cilynder, 'uv_mapping');
			hatMesh.material.setUniform('p', green);
			hatMesh.material.setUniform('lDir', ldir);
			hatMesh.transform = mat4.multiply(
				mat4.scale(1.0, 0.4, 1.0),
				mat4.translation(0, -1.0, 0)
			);

			var bottomhatMesh = scene.glHelper.createMesh(sphere, 'uv_mapping');
			bottomhatMesh.material.setUniform('p', green);
			bottomhatMesh.material.setUniform('lDir', ldir);
			bottomhatMesh.transform = mat4.multiply(
				mat4.scale(1.4, 0.2, 1.4),
				mat4.translation(0, -1.0, 0)
			);

			pato.hat = pato.head.addObject('hat');
			pato.hat.addObject('hatCenter', hatMesh);
			pato.hat.addObject('hatTop', tophatMesh)
				.transform = mat4.translation(0, 0.4, 0);
			pato.hat.addObject('hatBottom', bottomhatMesh)
				.transform = mat4.translation(0, -0.65, 0);

		}

	}

	/**
	 * Pato constructor
	 **/
	var newPato = function(scene) {
		var pato = scene.addObject('pato');
		PatoBuilder.addFace(scene, pato);
		PatoBuilder.addNeck(scene, pato);
		PatoBuilder.addPeak(scene, pato);
		PatoBuilder.addEye(scene, pato, "l");
		PatoBuilder.addEye(scene, pato, "r");
		PatoBuilder.addHat(scene, pato);

		return pato;
	}

	/**
	 * Update a Pato using the given data
	 * data: object with all the fields that we need to update pato
	 **/
	var updatePato = function(pato, data) {

		/* Body
		 * ---------
		 * rotations of Pato in x,y,z
		 * and translations in x and z
		 */
		pato.transform = mat4.multiply(
			mat4.scale(0.3),
			mat4.multiply(
				mat4.translation(data.body.x, -3.5, data.body.z),
				mat4.multiply(
					mat4.multiply(
						mat4.yRotation(data.body.yrotation),
						mat4.xRotation(data.body.xrotation)
					),
					mat4.multiply(
						mat4.zRotation(data.body.zrotation),
						mat4.translation(0, 4, 0)
					)
				)
			)
		);

		/* HEAD
		 * --------
		 * rotations of the head in z and x
		 */
		var theta = data.head.zrotation * Math.PI / 180;
		var phi = data.head.xrotation * Math.PI / 180;
		pato.head.transform =
			mat4.multiply(
				mat4.translation(0.0, -2.0, 0),
				mat4.multiply(
					mat4.xRotation(phi),
					mat4.multiply(
						mat4.zRotation(theta),
						mat4.translation(0, 2.0, 0)
					)));

		/* PEAK
		 * --------
		 * deformation of the peak mesh
		 * rotation on y
		 */
		pato.peak.geometry.update(data.peak);
		pato.peak.transform = mat4.multiply(
			mat4.yRotation(data.peak.rotation),
			mat4.translation(0, -1.7, 1.2)
		);

		/* HAT
		 * --------
		 * rotation in x and z
		 */
		pato.hat.transform = mat4.multiply(
			mat4.zRotation(data.hat.zrotation * Math.PI / 180),
			mat4.multiply(
				mat4.xRotation(data.hat.xrotation * Math.PI / 180),
				mat4.translation(0, 1.2, 0)
			));

		/* EYES
		 * --------
		 */
		data.eye.left.x = -0.5;
		data.eye.left.ybaserotation = -40;
		updateEye(pato.leye, data.eye.left);

		data.eye.right.x = 0.5;
		data.eye.right.ybaserotation = 40;
		updateEye(pato.reye, data.eye.right);



	};

	/**
	 * Update an eye using the given data
	 * data: object with all the fields that we need to update an eye
	 **/
	var updateEye = function(eye, data) {
		/**
		 * EYE
		 * -----------
		 * yrotation: move eye left/right
		 * width/height: change size of eye
		 **/
		eye.transform = mat4.multiply(
			mat4.multiply(
				mat4.yRotation(data.yrotation),
				mat4.translation(data.x, -1.0, 0.8)
			),
			mat4.multiply(
				mat4.yRotation(data.ybaserotation * Math.PI / 180),
				mat4.scale(data.width, data.height, 0.2)
			)
		);

		/**
		 * PUPIL
		 * -----------
		 * parameters are passed to the shader that paints the pupil as a circle in x,y of size
		 */
		eye.geometry.material.setUniform('pupil', [data.pupil.x, data.pupil.y, data.pupil.size]);


		/**
		 * EYELID
		 * -----------
		 * Meshes of top and bottom eyelid are modified to cover more or less of the eye.
		 */
		eye.toplid.geometry.update({
			height: data.eyelid.top
		});
		eye.bottomlid.geometry.update({
			height: data.eyelid.bottom
		});
	}

	return {
		newActor: newPato,
		updateActor: updatePato,
		DEFAULTS: DEFAULTS
	}
})();