export class FreeCamComponent {
    speed: number;
    mouseSpeed: number;

    constructor(speed: number = 10.0, mouseSpeed: number = 0.2) {
        this.speed = speed;
        this.mouseSpeed = mouseSpeed;
    }
}
