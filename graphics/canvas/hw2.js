MAIN = (function(){
	var circle;
	var FL = 5.0;
	var light = {
		position: vec4.fromValues(-0.5,-0.3,0.5,0.0),
		color: vec3.fromValues(1,1,1)
	};
	vec4.normalize(light, light);

	var MATERIAL = {
		ambient: vec3.fromValues(0.0,0.0,0.1),
		diffuse: vec3.fromValues(0.8,0.1,0.7), 
		specular: vec3.fromValues(0.146,1.0,0.975),
		power: 12.0
	};

	var getFirstHit = function(v, w){
		var co = circle;
		var vc = vec4.create();

		// vc = v -1.0*c;
		vec4.scaleAndAdd(vc, v, co.center, -1.0);

		var b = 2.0 * vec4.dot(w, vc);
		var c = vec4.dot(vc, vc) - co.r * co.r;

		var discriminant = b * b - 4.0 * c;
		var t_o = -1.0;

		if (discriminant >= 0.0){
	        var root1 = (-b + Math.sqrt(discriminant))/2.0;
	        var root2 = (-b - Math.sqrt(discriminant))/2.0;

	        var s = vec4.create();
	        var t_en = Math.min(root1, root2);
			vec4.scaleAndAdd(s, v, w, t_en); // s = v + w * t[0]

	        var n = vec4.create();
	        vec4.scaleAndAdd(n, s, co.center, -1.0);
	        vec4.normalize(n,n);

	        return {
	         t_en: t_en, 
	         t_ex: Math.max(root1, root2),
	         material: MATERIAL,
	         normal: n,
	         isHit: t_en >= 0.0
	        };
	    }
	    return {t_en: -1.0, t_ex: -1.0, isHit: false};

	}

	var paintPixel = function(x, y){
		var v = vec4.fromValues(0.0,0.0,FL,1.0);
		var w = vec4.fromValues(x - 0.5, 0.5 - y, -1.0*FL, 0.0);
		vec4.normalize(w,w);

		var hit = getFirstHit(v, w);
		if (hit.t_en < 0.0){
			return vec3.fromValues(0,0,0,1);
		}
		var s = vec4.create();
		vec4.scaleAndAdd(s, v, w, hit.t_en); // s = v + w * t[0]

		var color = vec4.clone(hit.material.ambient);
		// for each light
		var L = light.position;
		var v2 = vec4.create();
		vec4.scaleAndAdd(v2, s, L, 0.001);
		
		if (!getFirstHit(v2, L).isHit){ // no hit
			var h = vec4.create();
			vec4.scaleAndAdd(h, L, w, -1.0);
			vec4.normalize(h, h);

			var cd = vec3.create(), cs = vec3.create();

			vec3.scale(cd, hit.material.diffuse, Math.max(0.0, vec4.dot(hit.normal, L)));
			vec3.scale(cs, hit.material.specular, Math.pow(vec4.dot(h,hit.normal), hit.material.power));

			vec3.mul(cd, light.color, cd);
			vec3.mul(cs, light.color, cs);
			vec3.add(color, color, cd);
			vec3.add(color, color, cs);

		}
		return color;
		
	}

	var main = function(x, y, time){
		circle = { 
			center: vec4.fromValues(0, 0, 0, 1),
			r: 0.2
		}

	    var color = paintPixel(x, y);
	    return [color[0], color[1], color[2], 1];
	}
	return main;
})();