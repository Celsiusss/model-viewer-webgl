#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;

uniform vec3 uLightSource;
uniform vec3 uCameraPosition;

out vec4 frag_color;

void main() {
    vec3 ambient = vec3(0.2);
    vec3 lightPos = uLightSource;
    vec3 lightDir = normalize(lightPos - position);
    vec3 N = normalize(normal);
    vec3 diffuse = vec3(0.5) * min(max(dot(N, lightDir), 0.0), 1.0);

    vec3 viewDir = normalize(uCameraPosition - position);
    vec3 reflectDir = reflect(-lightPos, N);

    vec3 spec = vec3(1) * pow(max(dot(viewDir, normalize(reflectDir)), 0.0), 6.0) * 0.1;

    vec3 result = (ambient + diffuse + spec) * vec3(1, 0.9, 0.9);
    frag_color = vec4(result, 1.0);
}
