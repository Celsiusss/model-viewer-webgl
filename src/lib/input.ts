import { mat4 } from 'gl-matrix';

export enum InputKey {
    W, A, S, D,
    MOUSE0,
    NONE
}

export class InputHandler {
    keysPressed: InputKey[] = [];

    public mouse = {
        deltaX: 0,
        deltaY: 0
    }

    constructor() {
        document.addEventListener('keydown', event => this.addKey(event.key));
        document.addEventListener('keyup', event => this.removeKey(event.key));
        document.addEventListener('mousedown', event => this.addKey('mouse0'));
        document.addEventListener('mouseup', event => this.removeKey('mouse0'));

        document.addEventListener('mousemove', event => {
            this.mouse.deltaX = event.movementX;
            this.mouse.deltaY = event.movementY;
        });
    }

    public getKey(key: InputKey) : { pressed: boolean } {
        return {
            pressed: this.keysPressed.includes(key)
        }
    }

    private addKey(key: string) {
        const inputKey = this.matchEnum(key.toLowerCase());
        const index = this.keysPressed.findIndex(value => value === inputKey);
        if (index < 0) {
            this.keysPressed.push(inputKey);
        }
    }
    private removeKey(key: string) {
        const index = this.keysPressed.findIndex(value => this.matchEnum(key.toLowerCase()) === value);
        if (index >= 0) {
            this.keysPressed.splice(index, 1);
        }
    }
    private matchEnum(key: string): InputKey {
        switch (key) {
            case 'w':
                return InputKey.W;
            case 'a':
                return InputKey.A;
            case 's':
                return InputKey.S;
            case 'd':
                return InputKey.D;
            default:
                return InputKey.NONE;
        }
    }

}
