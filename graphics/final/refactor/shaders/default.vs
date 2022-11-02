attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexTangent;
attribute vec3 aVertexBitangent;
attribute vec2 aVertexUV;

uniform mat4 uPMatrix; /* perspective matrix */
uniform mat4 uOMatrix; /* object matrix */
uniform mat4 uNMatrix; /* normal matrix */
uniform mat4 uVMatrix; /* View matrix */

varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vViewVertex;

varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vXYZ;
varying vec4 vXYZW;
varying vec2 vUV;

void main(void) {
	vPosition = uOMatrix * vec4(aVertexPosition, 1.0);
	vViewVertex = uVMatrix * vPosition;
	gl_Position = uPMatrix * vViewVertex;
   	
	vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
	vTangent = normalize((uNMatrix * vec4(aVertexTangent, 0.0)).xyz);
	vBitangent = normalize((uNMatrix * vec4(aVertexBitangent, 0.0)).xyz);
	vXYZ = aVertexPosition;
	vUV = aVertexUV;
	vXYZW = gl_Position;
}