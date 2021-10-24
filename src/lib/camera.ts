import { mat3, mat4, quat, vec2, vec3 } from "gl-matrix";

export class Camera {
    public position = vec3.fromValues(0, 0, 0);
    public front = vec3.fromValues(1, 0, 0);
    public up = vec3.fromValues(0, 1, 0);
    public eye = vec3.fromValues(0, 0, 0);

    public yaw = 0;
    public pitch = 0;

    public viewMatrix = mat4.create();

    constructor() {
        this.calculate();
    }

    public move(x: number, y: number, z: number, backwards = false) {
        const direction = vec3.fromValues(x, y, z);
        vec3.add(this.position, this.position, direction);
        vec3.add(this.front, this.front, direction);

        this.calculate();
    }

    public moveUp(speed: number) {
        const a = speed * 0.1;

        const right = vec3.fromValues(1, 0, 0);
        const up = vec3.create();
        vec3.cross(up, this.front, right);
        vec3.normalize(up, up);

        vec3.scale(up, up, a);

        vec3.add(this.position, this.position, up);
        // vec3.subtract(this.front, this.front, up);
        
        this.calculate();
    }
    public moveDown(speed: number) {
        this.moveUp(-speed);
    }
    public moveForwards(speed: number) {
        this.move(0, 0, speed);
    }
    public moveBackwards(speed: number) {
        this.move(0, 0, -speed, true);
    }
    public moveLeft(speed: number) {
        this.move(speed, 0, 0, true);
    }
    public moveRight(speed: number) {
        this.move(-speed, 0, 0);
    }

    public rotate(yaw: number, pitch: number) {
        this.yaw += yaw;
        this.pitch += pitch;
        const direction = vec3.fromValues(
            Math.cos(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.sin(this.yaw) * Math.cos(this.pitch)
        );
        vec3.normalize(direction, direction);
        vec3.scale(this.front, direction, vec3.length(this.front));

        this.calculate();
    }

    public zoom(factor: number) {
        if (factor < 1 && vec3.len(this.front) < 0.2) {
            return;
        }
        vec3.scale(this.front, this.front, factor);
        this.calculate();
    }

    private calculate() {
        vec3.add(this.eye, this.position, this.front);
        mat4.lookAt(this.viewMatrix, this.eye, this.position, this.up);
    }

}
