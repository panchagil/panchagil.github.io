/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}


varying vec2 vUV;
uniform vec3 uColor;


void main(void) {
  
  gl_FragColor = vec4(gammaCorrect(uColor),1.0);

}