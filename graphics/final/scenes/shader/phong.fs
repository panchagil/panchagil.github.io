/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}
{glsl_fog}
{glsl_noise}

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec4 vPosition;
varying vec4 vViewVertex;

uniform float p[10];

uniform vec3 uAmbientLight;
uniform vec3 uAmbientColor;
uniform vec3 uPointLight;
uniform vec3 uPointLightColor;

uniform bool textureEnabled;
uniform bool normalEnabled;
uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;
uniform float uTextureX;
uniform float uTextureY;

vec3 color(vec3 lPosition, vec3 lColor, bool isPoint){
	vec3 lDir 		= isPoint ? normalize(vPosition.xyz - uPointLight) : normalize(lPosition);
	vec3 normal 	= normalize(vNormal);
	vec3 tangent 	= normalize(vTangent);
	vec3 bitangent 	= normalize(vBitangent);
	vec3 eyeDir 	= normalize(vViewVertex.xyz);
	vec3 h 			= normalize(lDir + eyeDir);


	if (normalEnabled){
		vec3 nrgb = 2.0*texture2D(uNormalSampler, vUV).xyz - 1.0;
		normal = nrgb.r * tangent + nrgb.g * bitangent + nrgb.b * normal;
		normal = normalize(normal);
	}

		vec3 diffuse 	= vec3(p[3],p[4],p[5]) * max(0.0, dot(lDir, normal));
	vec3 specular 	= vec3(p[6],p[7],p[8]) * pow(max(0., dot(h, normal)), p[9]);

	float distance 	= distance(lPosition, vPosition.xyz);
		float a 		= isPoint ? pow(distance, 0.5) : 1.0;

	vec3 c = lColor/ (a*a*a*a) * (diffuse + specular);
	return c;
}



void main(void) {

	vec3 c 	= vec3(p[0],p[1],p[2]); // initialize color to ambient light

	/* 
	* Add lights
	*/
	c += color(uAmbientLight, uAmbientColor, false);
	c += color(uPointLight, uPointLightColor, true);
	if (textureEnabled){
		vec2 uv = vec2(vUV.x * uTextureX, vUV.y * uTextureY);
		vec3 trgb = ungammaCorrect(texture2D(uSampler,uv).xyz);
	c = c * trgb;
	}

	/**
	* Add fog
	*/
	float fogFactor = fog();
	c = mix( c, fogColor, fogFactor);
	gl_FragColor = vec4(gammaCorrect(c),1);

}