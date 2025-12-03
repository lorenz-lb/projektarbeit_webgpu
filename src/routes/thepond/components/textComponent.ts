import { vec2, vec4 } from "gl-matrix";

export class TextComponent {
    text: string;
    position: vec2;
    fontAtlasID: string;
    color: vec4;
    fontSize: number;
    changed: boolean;

    // GPU 
    vertexBuffer?: GPUBuffer;
    vertexCount: number = 0;
    bufferByteSize: number = 0;

    constructor(text: string, position: vec2, fontAtlasID: string, color: vec4 = vec4.fromValues(1, 0, 0, 1), fontSize: number = 20, changed: boolean = true) {
        this.text = text;
        this.position = position;
        this.fontAtlasID = fontAtlasID;
        this.color = color;
        this.fontSize = fontSize;
        this.changed = changed;
    }
}
