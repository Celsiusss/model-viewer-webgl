import { InputHandler, InputKey } from './input';
import { mat4 } from 'gl-matrix';
import { compileShader, initializeShaders, loadShaderSource } from './shader-helpers.js';

class Application {
    public gl: WebGL2RenderingContext;

    private positionsBuffer: WebGLBuffer | null = null;
    private shaderProgram: WebGLProgram;

    private projectionMatrix = mat4.create();
    private modelViewMatrix = mat4.create();

    private inputHandler: InputHandler;

    private rotation = {
        x: 0,
        y: 0,
        z: 0
    }
    
    constructor() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        const gl = canvas.getContext('webgl2');
    
        if (gl === null) {
            throw new Error('webgl not supported');
        }
        this.gl = gl;
        this.shaderProgram = gl.createProgram() as WebGLProgram;
        this.inputHandler = new InputHandler();

        this.start();
    }

    async start() {
        let shaders = (
            await Promise.all([
                compileShader(this.gl, loadShaderSource('vertex-shader'), this.gl.VERTEX_SHADER),
                compileShader(this.gl, loadShaderSource('fragment-shader'), this.gl.FRAGMENT_SHADER)
            ])
        ).filter((shader) => shader !== null) as WebGLShader[];
        let program = initializeShaders(shaders, this.gl);
    
        if (program === null) {
            throw new Error('failed to initialize shaders');
        }
        this.shaderProgram = program;
        console.log(`Loaded ${shaders.length} shaders`);
    
        
        this.positionsBuffer = initBuffers(this.gl);

        const fieldOfView = (45 * Math.PI) / 180;
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        const zNear = 0.1;
        const zFar = Infinity;
        mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -10]);
        

        this.draw();
    }

    draw() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
    
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);


        this.handleInput();
    
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
        const vertexPosition = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
        this.gl.vertexAttribPointer(vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vertexPosition);
    
        this.gl.useProgram(this.shaderProgram);
    
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'), false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'), false, this.modelViewMatrix);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 4);
    
        window.requestAnimationFrame(() => this.draw());
    }

    handleInput() {
        if (this.inputHandler.getKey(InputKey.W).pressed) {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, 0.1]);
        }
        if (this.inputHandler.getKey(InputKey.S).pressed) {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -0.1]);
        }
        if (this.inputHandler.getKey(InputKey.A).pressed) {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0.1, 0, 0]);
        }
        if (this.inputHandler.getKey(InputKey.D).pressed) {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [-0.1, 0, 0]);
        }
    }
}

function initBuffers(gl: WebGL2RenderingContext) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [0, 2, 1, 0, -1, 0, 0, 0, 0, -1, -1, -1].map(v => v*1.5);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

window.onload = () => new Application();
