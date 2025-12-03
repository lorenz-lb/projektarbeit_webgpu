import { mat4 } from "gl-matrix";

export enum ObjectTypes {
    TRIANGLE,
    QUAD
}

export enum PipelineTypes {
    STANDARD,
    SKY
}

export interface RenderData {
    viewTransform: mat4;
    modelTransforms: Float32Array;
    objectsCount: { [obj in ObjectTypes]: number }
}

