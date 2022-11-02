/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}
{glsl_fog}

varying vec2 vUV;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vViewVertex;

//phong
uniform float p[10];
uniform vec3 uAmbientColor;
uniform vec3 uAmbientLight;
uniform vec3 uPointLight;
uniform vec3 uPointLightColor;
uniform sampler2D uSamplerGrass;

// grass
uniform float uLevel;
uniform float uTotalLevels;

vec3 color(vec3 lPosition, vec3 lColor, bool isPoint){

	vec3 lDir 		= isPoint ? normalize(vPosition.xyz - uPointLight) : normalize(lPosition);
	vec3 normal 	= normalize(vNormal);
	vec3 eyeDir 	= normalize(vViewVertex.xyz);
	vec3 h 			= normalize(lDir + eyeDir);

	vec3 diffuse 	= vec3(p[3],p[4],p[5]) * max(0.0, dot(lDir, normal));
	vec3 specular 	= vec3(p[6],p[7],p[8]) * pow(max(0., dot(h, normal)), p[9]);

	float distance 	= distance(lPosition, vPosition.xyz);
	float a 		= isPoint ? pow(distance, 0.5) : 1.0;

	vec3 c = lColor/ (a*a*a) * (diffuse + specular);
	return c;
}

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}	

void main(void) {
	vec3 trgb = ungammaCorrect(texture2D(uSamplerGrass, vec2(4.0*vUV.x, 2.0*vUV.y)).aaa);
	vec3 c 	= vec3(p[0],p[1],p[2]); // initialize color to ambient light
	if (trgb.x < 0.3*uLevel/uTotalLevels){
		discard;
	}
	/* 
	* Add lights
	*/
	c += color(uAmbientLight, uAmbientColor* (uLevel/uTotalLevels), false);
	c += color(uPointLight, uPointLightColor* (uLevel/uTotalLevels), true);

	/**
	* Add fog
	*/
	float fogFactor = fog();
	c = mix( c, fogColor, fogFactor);
	gl_FragColor = vec4(gammaCorrect(c), uLevel/uTotalLevels*0.05);

}