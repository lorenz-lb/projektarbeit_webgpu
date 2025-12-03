import type { TextComponent } from "../components/textComponent";
import type { RenderData } from "../model/definitions";
import type { RenderBatch } from "../types/renderBatch";
import { AlphaRenderSystem } from "./alphaRenderSystem";
import { OpaqueRenderSystem } from "./opaqueRenderSystem";
import type { System } from "./system";
import { HUDRenderSystem } from "./hudRenderSystem";


export class RenderSystem implements System {

    private device: GPUDevice;
    private globalBindGroup: GPUBindGroup;
    private alphaRenderSystem: AlphaRenderSystem
    private opaqueRenderSystem: OpaqueRenderSystem
    private hudRenderSystem: HUDRenderSystem
    private context: GPUCanvasContext;
    private depthTextureView: GPUTextureView;

    constructor(device: GPUDevice,
        globalBindGroup: GPUBindGroup,
        context: GPUCanvasContext) {
        this.device = device;
        this.globalBindGroup = globalBindGroup;
        this.context = context;

        this.opaqueRenderSystem = new OpaqueRenderSystem(this.device, this.globalBindGroup);
        this.alphaRenderSystem = new AlphaRenderSystem(this.globalBindGroup);
        this.hudRenderSystem = new HUDRenderSystem(this.device, this.context.canvas.width, this.context.canvas.height);

        const depthTexture = this.device.createTexture({
            size: [context.canvas.width, context.canvas.height],
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        } as GPUTextureDescriptor);

        this.depthTextureView = depthTexture.createView();
    }

    async init() {
        await this.hudRenderSystem.init();
    }

    update(buffer: GPUBuffer, opaqueBatches: RenderBatch[], transparentBatches: RenderBatch[], textComponents: Map<number, TextComponent>): void {
        const currentTextureView = this.context.getCurrentTexture().createView();
        const dsAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.depthTextureView,
        };

        const commandEncoder = this.device.createCommandEncoder();

        // renderpasses 
        this.opaqueRenderSystem.update(commandEncoder, buffer, opaqueBatches, currentTextureView, dsAttachment);
        this.alphaRenderSystem.update(commandEncoder, buffer, transparentBatches, currentTextureView, dsAttachment);
        this.hudRenderSystem.update(commandEncoder, textComponents, currentTextureView, dsAttachment);

        this.device.queue.submit([commandEncoder.finish()]);
    }

}
