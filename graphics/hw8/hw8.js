(function() {
	var scene1 = CG.main.newScene('canvas1');
	scene1.setup = function() {
		CG.scene.addObject(scene1, CG.shapes.createParametric(1 / 24, 1 / 12, CG.shapes.sph), 'fs_phong');
		CG.scene.addObject(scene1, CG.shapes.createCube(), 'fs_phong');
	}

	scene1.update = function(time) {
		var cy = .5 * Math.cos(time);
		var sy = .5 * Math.sin(time);

		var obj0 = this.objects[0];
		var obj1 = this.objects[1];

		obj0.matrix = [.4, 0, 0, 0, 0, .4, 0, 0, 0, 0, .4, 0, 0, sy, 0, 1];
		obj1.matrix = [.4 * cy, 0, .4 * sy, 0, 0, .5, 0, 0, -.4 * sy, 0, .4 * cy, 0, 0, 0, 0, 1];

		obj0.setUniform('p', [.1, .0, 0, .9, .0, 0, 1, 1, 1, 20]);
		obj1.setUniform('p', [.1, .1, 0, .9, .4, 0, 1, 1, 1, 10]);

		obj0.setUniform('lDir', [.57, .57, .57]);
		obj1.setUniform('lDir', [.57, .57, .57]);

	}

	var scene2 = CG.main.newScene('canvas2');
	scene2.setup = function() {
		CG.scene.addObject(scene2, CG.shapes.createCube(), 'fs_uv');
		CG.scene.addObject(scene2, CG.shapes.createCube(), 'fs_uv');
	}

	scene2.update = function(time) {
		var cy = .5 * Math.cos(time);
		var sy = .5 * Math.sin(time);

		var cz = .5 * Math.cos(2 * time);
		var sz = .5 * Math.sin(2 * time);

		var obj0 = this.objects[0];
		var obj1 = this.objects[1];

		obj0.matrix = [cy, 0, sy, 0, 0, .3, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1];
		obj1.matrix = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, .5, 0, 0, 0, 0, 1];

		obj0.setUniform('rgb', [1, .5, .5]);
		obj1.setUniform('rgb', [.5, .5, 1]);

	}

})();