export enum InputKey {
    W, A, S, D,
    Q, E,
    MOUSE0, MOUSE1,
    WHEEL_UP, WHEEL_DOWN,
    NONE
}

export class InputHandler {
    keysPressed: InputKey[] = [];

    readonly mouse = {
        deltaX: 0,
        deltaY: 0
    }

    constructor(private canvas: HTMLCanvasElement) {
        document.addEventListener('keydown', event => this.addKey(event.key));
        document.addEventListener('keyup', event => this.removeKey(event.key));
        canvas.addEventListener('mousedown', event => this.addKey(`mouse${event.button}`));
        document.addEventListener('mouseup', event => this.removeKey(`mouse${event.button}`));
        document.addEventListener('wheel', event => {
            if (event.deltaY > 0) {
                this.addKey('wheeldown');
            } else if (event.deltaY < 0) {
                this.addKey('wheelup');
            }
        });

        document.addEventListener('mousemove', event => {
            this.mouse.deltaX = event.movementX;
            this.mouse.deltaY = event.movementY;
        });

        canvas.addEventListener('contextmenu', event => {
            event.preventDefault();
        });
    }

    public getKey(key: InputKey) : { pressed: boolean } {
        return {
            pressed: this.keysPressed.includes(key)
        }
    }

    public resetMouse() {
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.removeKey('wheelup');
        this.removeKey('wheeldown');
    }

    private addKey(key: string) {
        const inputKey = this.matchEnum(key.toLowerCase());
        const index = this.keysPressed.findIndex(value => value === inputKey);
        if (inputKey !== InputKey.NONE && index < 0) {
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
            case 'q':
                return InputKey.Q;
            case 'e':
                return InputKey.E;
            case 'mouse0':
                return InputKey.MOUSE0;
            case 'mouse1':
                return InputKey.MOUSE1;
            case 'wheelup':
                return InputKey.WHEEL_UP;
            case 'wheeldown':
                return InputKey.WHEEL_DOWN;
            default:
                return InputKey.NONE;
        }
    }

}
