/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}


varying vec2 vUV;
uniform sampler2D uSampler;
uniform float uTextureX;
uniform float uTextureY;


void main(void) {
  vec2 uv   = vec2(vUV.x * uTextureX, vUV.y * uTextureY);
  vec3 c    = ungammaCorrect(texture2D(uSampler,uv).xyz);
  vec3 aaa  = ungammaCorrect(texture2D(uSampler,uv).aaa);

  /**
  * Add fog
  */
  // float fogFactor = fog();
  // 		c = mix( c, fogColor, fogFactor);
  gl_FragColor = vec4(gammaCorrect(c),aaa.x);

}