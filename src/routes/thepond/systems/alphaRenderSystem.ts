// AlphaRenderSystem.ts

import type { RenderBatch } from "../types/renderBatch";
import type { System } from "./system";

export class AlphaRenderSystem implements System {

    private globalBindGroup: GPUBindGroup;

    constructor(globalBindGroup: GPUBindGroup) {
        this.globalBindGroup = globalBindGroup;
    }


    update(
        commandEncoder: GPUCommandEncoder,
        instanceBuffer: GPUBuffer,
        transparentBatches: RenderBatch[],
        textureView: GPUTextureView,
        depthStencilAttachment: GPURenderPassDepthStencilAttachment,
    ): void {

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                loadOp: 'load',
                storeOp: 'store',
            }],

            depthStencilAttachment: {
                view: depthStencilAttachment.view,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
                stencilLoadOp: 'load',
                stencilStoreOp: 'store',
            },
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setBindGroup(0, this.globalBindGroup);

        // batches are already sorted 
        for (const batch of transparentBatches) {
            passEncoder.setPipeline(batch.pipeline);
            passEncoder.setBindGroup(1, batch.constantsBindGroup);

            if (batch.textureBindGroup) {
                passEncoder.setBindGroup(2, batch.textureBindGroup);
            }

            passEncoder.setVertexBuffer(0, batch.meshBuffer);
            passEncoder.setVertexBuffer(1, instanceBuffer);

            passEncoder.draw(batch.vertexCount, batch.instanceCount, 0, batch.instanceOffset);
        }

        passEncoder.end();
    }
}
