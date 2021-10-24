import { InputHandler, InputKey } from './input';
import { mat4, quat, vec3 } from 'gl-matrix';
import { compileShader, initializeShaders, loadShaderSource } from './shader-helpers.js';
import { loadModel, parseObj } from './model-loader';
import { Camera } from './camera';

class Application {
    public gl: WebGL2RenderingContext;

    private vertexArrayObject: WebGLVertexArrayObject | null = null;
    private shaderProgram: WebGLProgram;

    private projectionMatrix = mat4.create();
    private modelMatrix = mat4.create();

    private lightSource = vec3.fromValues(100, 100, 0);

    private camera = new Camera();
    private inputHandler: InputHandler;

    private vertexCount = 0;
    
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
        this.inputHandler = new InputHandler(canvas);

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
        
        await this.initBuffers();

        const fieldOfView = (45 * Math.PI) / 180;
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        const zNear = 0.1;
        const zFar = Infinity;
        mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, -10]);

        this.draw();
    }

    draw() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
    
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.handleInput();
        
        this.gl.useProgram(this.shaderProgram);
        // Set the VAO
        this.gl.bindVertexArray(this.vertexArrayObject);


        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, this.modelMatrix, this.camera.viewMatrix);

        // vec3.rotateY(this.lightSource, this.lightSource, [0, 0, 0], 0.01);
    
        // Pass uniforms
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'), false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);
        this.gl.uniform3fv(this.gl.getUniformLocation(this.shaderProgram, 'uCameraPosition'), this.camera.eye);
        this.gl.uniform3fv(this.gl.getUniformLocation(this.shaderProgram, 'uLightSource'), this.lightSource);

        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_INT, 0);
    
        window.requestAnimationFrame(() => this.draw());
    }

    async initBuffers() {
        const objSource = await loadModel('hand');
        const model = parseObj(objSource);

        const arrayBuffer = this.gl.createBuffer();
        const vertexArrayObject = this.gl.createVertexArray();
        const elementArrayBuffer = this.gl.createBuffer();
        
        this.gl.bindVertexArray(vertexArrayObject);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, arrayBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(model.vertices), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elementArrayBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(model.faces), this.gl.STATIC_DRAW);
    
        const vertexPosition = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'); 
        this.gl.enableVertexAttribArray(vertexPosition);
        this.gl.vertexAttribPointer(vertexPosition, 3, this.gl.FLOAT, false, 4*3, 0);

        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(model.normals), this.gl.STATIC_DRAW);
        const normalAttribLocation = this.gl.getAttribLocation(this.shaderProgram, 'aNormal');
        this.gl.enableVertexAttribArray(normalAttribLocation);
        this.gl.vertexAttribPointer(normalAttribLocation, 3, this.gl.FLOAT, false, 4*3, 0);

        this.vertexArrayObject = vertexArrayObject;
        this.vertexCount = model.faces.length;
    }

    handleInput() {
        const translation = vec3.create();
        const rotation = quat.create();
        quat.identity(rotation);

        const origTranslation = vec3.create();
        const origRotation = quat.create();
        mat4.getRotation(origRotation, this.modelMatrix);
        mat4.getTranslation(origTranslation, this.modelMatrix);

        const movSpeed = 0.1;
        const mouseSensitivity = 0.005;

        if (this.inputHandler.getKey(InputKey.W).pressed) {
            this.camera.moveForwards(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.S).pressed) {
            this.camera.moveBackwards(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.A).pressed) {
            this.camera.moveLeft(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.D).pressed) {
            this.camera.moveRight(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.Q).pressed) {
            this.camera.moveDown(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.E).pressed) {
            this.camera.moveUp(movSpeed);
        }
        if (this.inputHandler.getKey(InputKey.MOUSE0).pressed) {
            this.camera.rotate(this.inputHandler.mouse.deltaX * mouseSensitivity, this.inputHandler.mouse.deltaY * mouseSensitivity);
        }
        if (this.inputHandler.getKey(InputKey.WHEEL_UP).pressed) {
            this.camera.zoom(0.9);
        }
        if (this.inputHandler.getKey(InputKey.WHEEL_DOWN).pressed) {
            this.camera.zoom(1.1);
        }
        
        this.inputHandler.resetMouse();


        quat.multiply(rotation, rotation, origRotation);
        vec3.add(translation, translation, origTranslation);
        
        mat4.fromRotationTranslation(this.modelMatrix, rotation, translation);
    }
}

window.onload = () => new Application();
