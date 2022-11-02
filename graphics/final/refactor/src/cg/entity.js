var CG = CG || {};
CG.Entity = (function() {

	var Entity = function(options) {
		this.transform = options.transform || mat4.identity();
		this.geometry = options.geometry;
		this.program = options.program;
		this.uniforms = {};
	};

	Entity.prototype.setUniform = function(name, val) {
		this.uniforms[name] = val;
	}

	return Entity;
})();