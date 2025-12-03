import { vec3 } from "gl-matrix"

import { type Component } from "./component";

export class TransformComponent implements Component {
    position: vec3;
    eulers: vec3;
    scale: vec3;

    constructor(position: vec3 = vec3.create(), eulers: vec3 = vec3.create(), scale: vec3 = vec3.fromValues(1,1,1)) {
        this.position = position;
        this.eulers = eulers;
        this.scale = scale;
    }
}
