import { ECSApp } from "./appECS";

export class App {
    canvas: HTMLCanvasElement;

    keyLable: HTMLElement;
    mouseX: HTMLElement;
    mouseY: HTMLElement;

    forwards_amount!: number;
    right_amount!: number;

    // --- APP START ---
    async startApp() {
        const app = new ECSApp(this.canvas);

        if (await app.initialize()) {
            requestAnimationFrame(app.run);
        }
    }

    constructor(canvas: HTMLCanvasElement, lables: HTMLElement[]) {
        this.canvas = canvas;

        [this.keyLable, this.mouseX, this.mouseY] = lables;
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        };
    }
}
