import { vec2, vec3 } from "gl-matrix"

/**
 * Material Properties like 
 */
export interface MaterialProperies {
    name: string;
    /** base color */
    kd: vec3;
    /** texture */
    map_kd?: string;
    /** specular color */
    ks?: vec3;
    /** ambient color */
    ka?: vec3;
    /** specular exponent */
    ns?: number;
    /** transparency */
    d?: number;
    /** illumination */
    illum?: number;

    // animation
    scrollSpeed?: number;
    parallaxFactor?: number;
    spriteSheetDimension?: vec2;

    // // physics based
    // /** roughness */
    // pr?: number;
    // /** metallic */
    // pm?: number;
    // /** sheen */
    // ps?: number;
    // /** clearcoat thickness */
    // pc?: number;
    // /** clearcoat roughness */
    // pcr?: number;
    // /** emissive */
    // ke?: number;
    // /** Normal Map Path*/
    // norm?: string;
}

/**
 * This class represents a GPU material.
 * It contains material properties such as reflection strenght, base color etc.
 * It also contains the GPU ressources needed to dispatch the material to the GPU to be used in a shader
 * Thus this class abstracts all material apects needed to perform computation within webgpu
 */
export class Material {
    // Material Props 
    name!: string;
    kd!: vec3;
    map_kd!: string | null;
    ks!: vec3;
    ka!: vec3;
    ns!: number;
    d!: number;
    illum!: number;
    scrollSpeed!: number;
    parallaxFactor!: number;
    spriteSheetDimension!: vec2;


    // Props
    hasTexture: boolean = false;

    // GPU Props
    device!: GPUDevice
    texture!: GPUTexture
    view!: GPUTextureView
    sampler!: GPUSampler
    textureBindGroup!: GPUBindGroup
    constantsBuffer!: GPUBuffer;
    constantsBindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    public async init(device: GPUDevice,
        materialData: MaterialProperies,
        pipeline: GPURenderPipeline,
        constantsLayout: GPUBindGroupLayout,
        textureLayout: GPUBindGroupLayout | null = null) {

        this.device = device;
        this.name = materialData.name;
        this.map_kd = materialData.map_kd ?? null;
        this.kd = materialData.kd;

        this.ks = materialData.ks ?? vec3.create();
        this.ka = materialData.ka ?? vec3.create();
        this.ns = materialData.ns ?? 0;
        this.d = materialData.d ?? 0;
        this.illum = materialData.illum ?? 0;

        this.scrollSpeed = materialData.scrollSpeed ?? 0;
        this.parallaxFactor = materialData.parallaxFactor ?? 1.0;
        this.spriteSheetDimension = materialData.spriteSheetDimension ?? vec2.fromValues(1, 1);

        this.pipeline = pipeline;
        this.createConstantGroup(device, constantsLayout);

        // only texture if needed
        if (this.map_kd && textureLayout) {
            await this.createTextureGroup(device, textureLayout);
            this.hasTexture = true;
        }
    }

    public setAnimationData(uvOffset: vec2) {
        const offset = 20 * 4;

        const animationData = new Float32Array([uvOffset[0], uvOffset[1], 0, 0]);

        this.device.queue.writeBuffer(
            this.constantsBuffer,
            offset,
            animationData
        );
    }

    private createConstantGroup(device: GPUDevice, layout: GPUBindGroupLayout) {
        const constantsData = new Float32Array([
            // Diffuse Color
            this.kd[0], this.kd[1], this.kd[2], 1.0,
            // Specular Color
            this.ks[0], this.ks[1], this.ks[2], 1.0,
            // Ambient Color
            this.ka[0], this.ka[1], this.ka[2], 1.0,
            // shininess, alpha, illumination,scrollSpeed 
            this.ns, this.d, this.illum, this.scrollSpeed,
            //  prallaxfactor, padding
            this.parallaxFactor, this.spriteSheetDimension[0], this.spriteSheetDimension[1], 0.0,
            // animationdata uv + padding
            0, 0, 0, 0
        ]);


        this.constantsBuffer = device.createBuffer({
            size: constantsData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            label: `Material ${this.name} ConstBuffer`
        });

        device.queue.writeBuffer(this.constantsBuffer, 0, constantsData);

        this.constantsBindGroup = device.createBindGroup({
            layout: layout,
            entries: [{ binding: 0, resource: { buffer: this.constantsBuffer } }],
            label: `${this.name}_constants`
        });
    }

    private async createTextureGroup(device: GPUDevice, layout: GPUBindGroupLayout) {
        let textureToUse: GPUTexture;

        if (!this.map_kd)
            return;

        const response: Response = await fetch(this.map_kd);
        const blob: Blob = await response.blob();
        const imageData: ImageBitmap = await createImageBitmap(blob);
        await this.loadImageBitmap(device, imageData);
        textureToUse = this.texture;

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "rgba8unorm",
            dimension: "2d",
            aspect: "all",
            baseMipLevel: 0,
            mipLevelCount: 1,
            baseArrayLayer: 0,
            arrayLayerCount: 1
        };

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            minFilter: "nearest",
            magFilter: "nearest",
            mipmapFilter: "linear",
            maxAnisotropy: 1,
        }

        this.view = textureToUse.createView(viewDescriptor);
        this.sampler = device.createSampler(samplerDescriptor);

        this.textureBindGroup = device.createBindGroup({
            layout: layout,
            entries: [
                {
                    binding: 0,
                    resource: this.view
                },
                {
                    binding: 1,
                    resource: this.sampler
                },
            ],
            label: `${this.name}_textures`
        });
    }

    private async loadImageBitmap(device: GPUDevice, imageData: ImageBitmap) {
        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: imageData.width,
                height: imageData.height
            },
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }

        this.texture = device.createTexture(textureDescriptor);

        device.queue.copyExternalImageToTexture(
            { source: imageData },
            { texture: this.texture },
            textureDescriptor.size);
    }
}
