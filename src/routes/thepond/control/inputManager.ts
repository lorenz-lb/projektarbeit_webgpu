export enum KeyPress {
    None = "NONE",
    Down = "DOWN",
    Held = "HELD",
    Up = "UP",
}

export class InputManager {
    private canvas: HTMLCanvasElement;

    // keyboard
    w: KeyPress = KeyPress.None;
    a: KeyPress = KeyPress.None;
    s: KeyPress = KeyPress.None;
    d: KeyPress = KeyPress.None;
    q: KeyPress = KeyPress.None;
    e: KeyPress = KeyPress.None;
    f: KeyPress = KeyPress.None;
    c: KeyPress = KeyPress.None;

    // special keys
    shift: KeyPress = KeyPress.None;

    // mouse
    primary: KeyPress = KeyPress.None;
    secondary: KeyPress = KeyPress.None;
    movementX: number = 0;
    movementY: number = 0;


    // indexing 
    [key: string]: KeyPress | any;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.initialize();
    }

    initialize() {
        this.canvas.addEventListener('keydown', this.keyDown.bind(this));
        this.canvas.addEventListener('keyup', this.keyUp.bind(this));
        this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    }

    private keyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();

        if (this[key] !== undefined && this[key] != KeyPress.Held) {
            this[key] = KeyPress.Down;
        }

        // handle special keys
        if (event.shiftKey) {
            if (this.shift != KeyPress.Held) { this.shift = KeyPress.Down }
        }
    }

    private keyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();

        if (this[key] !== undefined) {
            this[key] = KeyPress.Up;
        }

        // handle special keys
        if (event.shiftKey) {
            this.shift = KeyPress.Up;
        }
    }

    private mouseDown(event: MouseEvent) {
        if ((event.buttons & 1) > 0) { this.primary = KeyPress.Down };
        if ((event.buttons & 2) > 0) { this.secondary = KeyPress.Down };
    }

    private mouseUp(event: MouseEvent) {
        if ((event.buttons & 1) > 0) { this.primary = KeyPress.Up };
        if ((event.buttons & 2) > 0) { this.secondary = KeyPress.Up };
    }

    private mouseMove(event: MouseEvent) {
        this.movementX += event.movementX;
        this.movementY += event.movementY;
    }

    private advanceKeyPress(state: KeyPress): KeyPress {
        if (state == KeyPress.Down) {
            return KeyPress.Held;
        }

        if (state == KeyPress.Up) {
            return KeyPress.None;
        }

        return state;
    }

    public updateInputs() {
        this.w = this.advanceKeyPress(this.w);
        this.a = this.advanceKeyPress(this.a);
        this.s = this.advanceKeyPress(this.s);
        this.d = this.advanceKeyPress(this.d);
        this.q = this.advanceKeyPress(this.q);
        this.e = this.advanceKeyPress(this.e);
        this.f = this.advanceKeyPress(this.f);
        this.c = this.advanceKeyPress(this.c);

        // special keys
        this.shift = this.advanceKeyPress(this.shift);

        //mouse
        this.primary = this.advanceKeyPress(this.primary);
        this.secondary = this.advanceKeyPress(this.secondary);

        this.consumeMouse();
    }

    public consumeMouse(): { x: number, y: number } {
        const delta = { x: this.movementX, y: this.movementY };

        this.movementX = 0;
        this.movementY = 0;

        return delta;
    }
}
