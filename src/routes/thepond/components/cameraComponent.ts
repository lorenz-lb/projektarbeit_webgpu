import { vec3 } from "gl-matrix"

export interface CameraOptions {
    right?: vec3,
    up?: vec3,
    forwards?: vec3,
    fov?: number,
    near?: number,
    far?: number,
    aspect?: number,
}

export class CameraComponent {
    right: vec3;
    up: vec3;
    forwards: vec3;
    fov: number;
    near: number;
    far: number;
    aspect: number;


    /*
     * laksdjflkasdjf
     *
     * */
    constructor(
        options: CameraOptions = {}
    ) {
        this.right = options.right ?? vec3.fromValues(1, 0, 0);
        this.up = options.up ?? vec3.fromValues(0, 1, 0);
        this.forwards = options.forwards ?? vec3.fromValues(0, 0, -1);

        this.fov = options.fov ?? Math.PI / 4;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? 100;
        this.aspect = options.aspect ?? 16 / 9;
    }
}
