import type { Material } from "../view/material";

export class MeshRenderComponent {
    material: Material;

    // mesh data
    meshVAO: GPUBuffer;
    vertexCount: number;

    // indexed rendering 
    indexed: boolean
    indexBuffer: GPUBuffer | null;
    indexCount: number;

    constructor(material: Material,
        meshVAO: GPUBuffer,
        vertexCount: number,
        indexed: boolean = false,
        indexBuffer: GPUBuffer | null = null,
        indexCount: number = 0) {

        this.material = material;
        this.meshVAO = meshVAO;
        this.vertexCount = vertexCount;


        this.indexed = indexed;
        this.indexBuffer = indexBuffer;
        this.indexCount = indexCount;
    }
}
