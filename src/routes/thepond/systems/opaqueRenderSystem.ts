import type { RenderBatch } from "../types/renderBatch";
import type { System } from "./system";

async function logBufferContent(
    device: GPUDevice,
    buffer: GPUBuffer,
    bufferSize: number,
    bufferType: typeof Float32Array | typeof Uint32Array
) {
    const stagingBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        label: `Staging Buffer for logging ${buffer.label}`
    });

    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
        buffer, 0,
        stagingBuffer, 0,
        bufferSize
    );

    const commands = commandEncoder.finish();
    device.queue.submit([commands]);

    await stagingBuffer.mapAsync(GPUMapMode.READ);

    const copyArrayBuffer = stagingBuffer.getMappedRange();
    const data = new bufferType(copyArrayBuffer);

    console.log(`Inhalt von Buffer "${buffer.label}":`, data);

    stagingBuffer.unmap();
    stagingBuffer.destroy();
}

export class OpaqueRenderSystem implements System {
    private device: GPUDevice;
    private globalBindGroup: GPUBindGroup;
    private DEBUG_ONCE = 0;

    constructor(device: GPUDevice, globalBindGroup: GPUBindGroup) {
        this.device = device;
        this.globalBindGroup = globalBindGroup;
    }

    update(commandEncoder: GPUCommandEncoder,
        instanceBuffer: GPUBuffer,
        opaqueBatches: RenderBatch[],
        currentTextureView: GPUTextureView,
        dsAttachment: GPURenderPassDepthStencilAttachment): void {

        // renderpass
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: currentTextureView,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: { r: 0.1, g: 0.2, b: 0.3, a: 1.0 },
            }],

            depthStencilAttachment: {
                view: dsAttachment.view,
                stencilLoadOp: 'clear',
                stencilStoreOp: 'store',
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
            },
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setBindGroup(0, this.globalBindGroup);

        // all batches
        for (const batch of opaqueBatches) {

            if (batch.indexed && batch.indexBuffer) {
                passEncoder.setPipeline(batch.pipeline);
                passEncoder.setBindGroup(1, batch.constantsBindGroup);

                if (batch.textureBindGroup) {
                    passEncoder.setBindGroup(2, batch.textureBindGroup);
                }

                passEncoder.setVertexBuffer(0, batch.meshBuffer);
                passEncoder.setVertexBuffer(1, instanceBuffer);
                passEncoder.setIndexBuffer(batch.indexBuffer, "uint32");


                if (this.DEBUG_ONCE == 0) {
                    this.DEBUG_ONCE = 1;

                    console.log(batch);


                    console.log(batch.indexBuffer)

                    logBufferContent(
                        this.device,          // Dein GPUDevice
                        batch.indexBuffer,    // Der zu loggende Index Buffer
                        batch.indexBuffer.size,      // 216 Bytes
                        Uint32Array           // Der Buffer-Typ
                    );

                    logBufferContent(
                        this.device,          // Dein GPUDevice
                        batch.meshBuffer,    // Der zu loggende Index Buffer
                        batch.meshBuffer.size,      // 216 Bytes
                        Float32Array           // Der Buffer-Typ
                    );


                }
                // draw call
                passEncoder.drawIndexed(batch.indexCount, batch.instanceCount, 0, batch.instanceOffset);
                //console.log("indexed render");
            }
            else {
                passEncoder.setPipeline(batch.pipeline);
                passEncoder.setBindGroup(1, batch.constantsBindGroup);

                if (batch.textureBindGroup) {
                    passEncoder.setBindGroup(2, batch.textureBindGroup);
                }

                passEncoder.setVertexBuffer(0, batch.meshBuffer);
                passEncoder.setVertexBuffer(1, instanceBuffer);

                // draw call
                passEncoder.draw(batch.vertexCount, batch.instanceCount, 0, batch.instanceOffset);
            }
        }

        passEncoder.end();
    }

}
