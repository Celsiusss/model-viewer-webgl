#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 position;
out vec3 normal;

void main() {
    position = aVertexPosition.xyz;
    normal = aNormal;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
