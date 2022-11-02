var Particle = Particle || {};
Particle.system = (function() {
	var MAX_PARTICLES = 30000;

	var lasttime = 0;

	var particleSystem = function(obj) {
		obj = obj || {};
		obj.particles = [];
		obj.lastTime = 0;
		obj.update = update;
		obj.particles = [];
		obj.fields = [];
		obj.maxParticles = MAX_PARTICLES;

		obj.addemiter = addemiter;
		obj.addfield = addfield;
		return obj;
	}

	var addemiter = function(position, speed, angle, rate, var_x, var_y) {
		var o = {};
		Particle.emiter.instance(o, position, speed, angle, rate, var_x, var_y);
		o.system = this;
		o.emitparticle = function() {
			_emitparticle(o)
		}
		this.emiter = o;
		return o;
	}

	var addfield = function(position, mass) {
		var o = {};
		Particle.field.instance(o, position, mass);
		o.system = this;
		this.fields.push(o);
		return o;
	}

	var update = function(time) {
		var elapsed = (time - lasttime);
		lasttime = time;
		for (var i = 0; i < this.emiter.rate; i++) {
			if (this.particles.length < this.maxParticles) {
				this.emiter.emitparticle();
			}
		}
		for (var j = 0; j < this.particles.length; j++) {
			var p = this.particles[j];
			p.applyFields(this.fields);

			p.update(elapsed);
			if (p.ttl < p.lived) {
				this.particles.splice(j, 1);
				delete p;
			}
		}
	}

	var _emitparticle = function(emiter) {
		var o = {};
		var theta = emiter.angle * Math.random() - emiter.angle / 2;
		var velocity = {
			x: emiter.speed * Math.cos(theta),
			y: emiter.speed * Math.sin(theta)
		}
		var position = {
			x: emiter.position.x + emiter.x_var * Math.random(),
			y: emiter.position.y + emiter.y_var * (-0.5 + Math.random())
		};
		Particle.particle.instance(o, position, velocity, 10 + 2 * Math.random());
		emiter.system.particles.push(o)
		return o;
	}

	return {
		instance: particleSystem
	}

})();
Particle.emiter = (function() {

	var emiter = function(obj, position, speed, angle, rate, x_var, y_var) {
		obj = obj || {};
		obj.position = {
			x: position.x,
			y: position.y
		};
		obj.speed = speed;
		obj.scale = 0.1;
		obj.angle = (angle || 20) * Math.PI / 180;
		obj.rate = (rate || 7);
		obj.x_var = x_var || 0;
		obj.y_var = y_var || 0;
		return obj;
	}


	return {
		instance: emiter
	}
})();

Particle.particle = (function() {
	var particle = function(obj, position, velocity, ttl) {
		obj = obj || {};

		obj.position = {
			x: position.x,
			y: position.y
		};
		obj.velocity = {
			x: velocity.x,
			y: velocity.y
		}
		obj.acceleration = {
			x: 0,
			y: 0
		}
		obj.update = update;
		obj.applyFields = applyFields;
		obj.ttl = ttl || 10;
		obj.lived = 0;
		return obj;
	};
	var applyFields = function(fields) {
		var acc_x = 0,
			acc_y = 0;
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var dist_x = field.position.x - this.position.x;
			var dist_y = field.position.y - this.position.y;
			var force_m = field.mass / Math.pow((dist_x * dist_x + dist_y * dist_y + 1), 1.5);

			acc_x += force_m * dist_x;
			acc_y += force_m * dist_y;
		}

		this.acceleration = {
			x: acc_x,
			y: acc_y
		}
	}
	var update = function(elapsed) {

		this.velocity.x += this.acceleration.x * elapsed;
		this.velocity.y += this.acceleration.y * elapsed;

		this.position.x += this.velocity.x * elapsed;
		this.position.y += this.velocity.y * elapsed;
		this.lived += elapsed;
	}
	return {
		instance: particle
	}
})();

Particle.field = (function() {
	var field = function(obj, position, mass) {
		obj = obj || {};

		obj.position = {
			x: position.x,
			y: position.y
		};
		obj.mass = mass;

		return obj;
	};

	return {
		instance: field
	}
})();