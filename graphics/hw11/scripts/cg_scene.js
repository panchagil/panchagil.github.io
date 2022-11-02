var CG = CG || {}
CG.scene = (function() {
	var m_stack = [];
	var m = mat4.identity();

	var drawObject = function(glHelper, object) {
		if (object.draw !== undefined && !object.draw) {
			return;
		}
		m_stack.push(m);
		m = mat4.multiply(m, object.transform);

		// draw object
		if (object.geometry !== undefined) {
			m_stack.push(m);
			m = mat4.multiply(m, object.geometry.transform);
			glHelper.draw(object.geometry, m);
			m = m_stack.pop();
		}

		for (var i in object.objects) {
			drawObject(glHelper, object.objects[i]);
		}
		m = m_stack.pop();
	}

	var draw = function() {
		m_stack.push(m);
		this.glHelper.prepareCanvas();

		for (var n in this.objects) {
			drawObject(this.glHelper, this.objects[n]);
		}
		m = m_stack.pop();
	}

	var addObject = function(id, geometry) {
		var obj = {
			id: id,
			transform: mat4.identity(),
			geometry: geometry,
			objects: [],
			addObject: addObject
		}
		this.objects.push(obj);
		return obj;
	}
	return {
		draw: draw,
		addObject: addObject
	}
})();