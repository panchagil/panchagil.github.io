/**
* Dependencies
* -------------
*/
{glsl_gammacorrect}
void main(void) {
	gl_FragColor = vec4(gammaCorrect(vec3(0, 0, 0)), 0);
}