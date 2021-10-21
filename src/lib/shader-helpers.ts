export async function compileShader(
    gl: WebGL2RenderingContext,
    shaderSource: string | Promise<string>,
    shaderType: number
) {
    if (typeof shaderSource !== 'string') {
        shaderSource = await shaderSource;
    }

    const shader = gl.createShader(shaderType);

    if (shader === null) {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Failed to compile shader');
        console.error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

export function initializeShaders(shaders: WebGLShader[], gl: WebGL2RenderingContext) {
    const program = gl.createProgram();

    if (program === null) {
        return null;
    }

    for (let shader of shaders) {
        gl.attachShader(program, shader);
    }
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Failed to initialize shader program: ', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

export async function loadShaderSource(name: string) {
    const res = await fetch(`/shaders/${name}.glsl`);
    return await res.text();
}
