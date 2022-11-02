/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}
{glsl_fog}
{glsl_noise}

/**
* Black sky with Perlin Noise stars and particle stars
**/
uniform sampler2D uSampler;
varying vec2 vUV;
uniform float uTime;

uniform float particles[120];

vec4 blend(vec4 source, vec4 destination){
  	vec4 c_source = source * source.a;
  	return destination + c_source;
}

vec4 intersectParticle(vec2 position, vec3 color, float size, int id){
	/*
	* Star data
	*/
	float star_id 	= float(id + 1);
	float time 		= uTime;

	/*
	* Intensity
	*/
  	float d 	= distance(position, vUV);
  	float a 	= (1.0 - d * 200.0/size);
  	float vari 	= (0.9 + 0.1*cos(time*(star_id/20.0 + 30.0) + star_id)); // twinkle
  	a = a * vari;

  	/*
	* Star Image
	*/
  	vec2 uv 	= 20.0 * (position - vUV);
	float angle = star_id * 2.0;
	vec2 uv_t 	= vec2(0.5,0.5) + vec2(
			uv.x*cos(angle) -  uv.y*sin(angle), 
			uv.x * sin(angle) + uv.y * cos(angle)
			); // rotate uv
  	vec3 trgb = ungammaCorrect(texture2D(uSampler, uv_t).rgb);

  	return vec4(color*trgb, max(a,0.0));
}

void main(void) {
	
	vec4 color = vec4(0,0,0,1); // background color
	
	/*
	* add Perlin noise base stars
	*/
	float t = 1.2*noise(vec3(vUV*300.0, 1));
t = t*t*t;
		color = t > 0.3 ? vec4(2.0,1.0,2.0,t) : vec4(0,0,0,1);

		
		/**
		* add particle bases starts, fixed number
		**/
		for (int i = 0; i < 20; i++){
			vec4 source = intersectParticle(
				vec2(particles[6*i],particles[6*i+1]), 
				vec3(particles[6*i + 2], particles[6*i + 3], particles[6*i + 4]),
				particles[6*i + 5], i);
			color = blend(source, color);
		}

		/** 
		* add fog? 
		**/
float fogFactor = fog() * (1.0 - gl_FragCoord.y/500.0);
  	color.rgb = mix(color.rgb, fogColor, fogFactor);

		gl_FragColor = vec4(gammaCorrect(color.rgb), clamp(color.a, 0.0, 1.0 ));
}