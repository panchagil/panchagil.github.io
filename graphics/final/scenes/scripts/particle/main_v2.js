/**
 * This is a work in process,
 * for now the code has a lot of values hard-coded for the flame,
 * but everything should be easy to parametrize
 **/
var Particle_v2 = Particle_v2 || {};
Particle_v2.main = (function() {

	function ForceField(options) {
		this.position = {
			x: options.position_x,
			y: options.position_y
		};

		this.mass = options.mass;
	}

	function Particle(options) {
		this.position = {
			x: options.position_x,
			y: options.position_y
		};

		this.speed = {
			x: options.speed_x,
			y: options.speed_y,
		};

		this.acceleration = {
			x: 0,
			y: 0,
		}

		this.life = 0;
		this.ttl = options.ttl;
		this.start_size = options.start_size;
		this.finish_size = options.finish_size;
		this.color_start = options.color_start;
		this.color_end = options.color_end;

		this.size = 1;
		this.color = options.color_start;
	}

	function ParticleSystem(options) {
		options = options || {};

		// ---- configuration ----
		this.max_particles = options.max_particles || 50;

		this.life_span = options.life_span || 2.0;
		this.life_span_variance = 2.9;

		this.start_size = 90;
		this.start_size_variance = 10.0;

		this.finish_size = 0.0;
		this.finish_size_variance = 5.0;

		// TODO: use this variables for emit direction
		// this.emitter_angle = 270.0;
		// this.emitter_angle_variance = 0.0;

		this.emiter_x_variance = 0.0;
		this.emiter_y_variance = 0.0;

		this.emiter_speed = options.emiter_speed || 60.0;
		this.emiter_speed_variance = options.emiter_speed_variance || 20.0;

		this.particle_color_start = [1.0, 0.2, 0.0, 0.6];
		this.particle_color_end = [1.0, 0.3, 0.0, 0.0];

		this.position_x = 0;
		this.position_y = -0.7;

		this.rate = options.rate || 10;

		// ---- objects ----
		this.particles = [];
		this.forcefields = [];

		this.accumulated = 0;

		// emiter 
		for (var i = 0; i < 2; i++) {
			this.emitParticle();
		}
	};

	ParticleSystem.prototype.emitParticle = function() {
		this.particles.push(new Particle({
				position_x: this.position_x,
				position_y: this.position_y,
				speed_x: 10 * random(),
				speed_y: this.emiter_speed + this.emiter_speed_variance * random(),
				ttl: this.life_span + this.life_span_variance * Math.random(),
				start_size: this.start_size + this.start_size_variance * random(),
				finish_size: this.finish_size + this.finish_size_variance * random(),
				color_start: this.particle_color_start,
				color_end: this.particle_color_end
			}

		));
	}

	ParticleSystem.prototype.update = function(time) {
		if (this.lasttime == undefined) {
			this.lasttime = time;
		}
		var elapsed = (time - this.lasttime);
		this.lasttime = time;

		this.accumulated += elapsed;

		// emit new particles
		if (this.accumulated > 1 / this.rate) {
			while (this.accumulated > 0) {
				if (this.max_particles > this.particles.length) {
					this.accumulated = 0;
					this.emitParticle();
				}
			}
		}


		// update particles
		for (var i = 2; i < this.particles.length; i++) {
			var p = this.particles[i];
			p.life += elapsed;

			if (p.life > p.ttl) {
				this.particles.splice(i, 1);
				continue;
			}
			this.applyforcefields(p);

			p.speed.x += p.acceleration.x * elapsed;
			p.speed.y += p.acceleration.y * elapsed;

			p.position.y += p.speed.y / 100 * elapsed;
			p.position.x += p.speed.x / 100 * elapsed;

			// transition between initial and final states
			var t = easyCurve(p.life / p.ttl);

			p.size = lerp(t, p.start_size, p.finish_size) / 100;

			p.color = [];
			p.color.push(lerp(t, p.color_start[0], p.color_end[0]));
			p.color.push(lerp(t, p.color_start[1], p.color_end[1]));
			p.color.push(lerp(t, p.color_start[2], p.color_end[2]));
			p.color.push(lerp(t, p.color_start[3], p.color_end[3]));


		}

	}

	ParticleSystem.prototype.applyforcefields = function(particle) {
		var acc_x = 0,
			acc_y = 0;

		for (var i = 0; i < this.forcefields.length; i++) {
			var field = this.forcefields[i];
			var dist_x = field.position.x - particle.position.x;
			var dist_y = field.position.y - particle.position.y;
			var force_m = field.mass / Math.pow((dist_x * dist_x + dist_y * dist_y + 1), 1.5);

			acc_x += force_m * dist_x;
			acc_y += force_m * dist_y;
		}

		particle.acceleration = {
			x: acc_x,
			y: acc_y
		}
	};
	ParticleSystem.prototype.addforcefield = function(options) {
		var obj = new ForceField(options);
		this.forcefields.push(obj);
		return obj;
	}

	/* Math interpolation functions
	 * ----------------------------- */

	var easyCurve = function(t) {
		return (3 - 2 * t) * t * t;
	}

	var lerp = function(t, a, b) {
		return a + t * (b - a);
	};

	// random between -0.5 and 0.5
	var random = function() {
		return (Math.random() - 0.5);
	}

	return {
		ParticleSystem: ParticleSystem
	}
})();