var CG = CG || {}
CG.scene = (function() {
	var m_stack = [];
	var m = mat4.identity();

	var Scene = function() {
		this.objects = [];
		this.camera = {
			position: [0, 0, -20],
			target: [0, 0, -10],
			up: [0, 1, 0]
		};
	}

	Scene.prototype.drawObject = function(glHelper, object) {
		if (object.draw !== undefined && !object.draw) {
			return;
		}
		m_stack.push(m);
		m = mat4.multiply(m, object.transform);

		// draw object
		if (object.geometry !== undefined) {
			m_stack.push(m);
			m = mat4.multiply(m, object.geometry.transform);
			glHelper.draw(object.geometry, m, this.camera);
			m = m_stack.pop();
		}

		for (var i in object.objects) {
			this.drawObject(glHelper, object.objects[i]);
		}
		m = m_stack.pop();
	}

	Scene.prototype.draw = function() {
		m_stack.push(m);
		this.glHelper.prepareCanvas();

		for (var n in this.objects) {
			this.drawObject(this.glHelper, this.objects[n]);
		}
		m = m_stack.pop();
	}

	Scene.prototype.addObject = function(id, geometry) {
		var obj = {
			id: id,
			transform: mat4.identity(),
			geometry: geometry,
			objects: [],
			addObject: Scene.prototype.addObject
		}
		this.objects.push(obj);
		return obj;
	}

	Scene.prototype.updateCamera = function(options) {
		var angle = options.theta * Math.PI / 180;
		var R = 20 - (options.zoom || 0);
		this.camera.position = [R * Math.sin(angle), options.y, -10 + R * Math.cos(angle)];

	}
	return Scene;

})();