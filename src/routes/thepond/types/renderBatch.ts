export interface RenderBatch {
    isTransparent: boolean;
    pipeline: GPURenderPipeline;
    meshBuffer: GPUBuffer;
    textureBindGroup?: GPUBindGroup;
    constantsBindGroup: GPUBindGroup;
    /* Number of Entities in Batch */
    vertexCount: number;
    instanceCount: number;
    instanceOffset: number;

    indexed: boolean;
    indexBuffer: GPUBuffer | null;
    indexCount: number;
}
