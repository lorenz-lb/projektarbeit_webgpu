import shaderCode from "../shaders/subdivision.wgsl?raw"

export class QuadTesselation {
    device: GPUDevice;

    computePipeline!: GPUComputePipeline;
    bindGroupLayout!: GPUBindGroupLayout;

    private readonly GRID_SIZE_X: number = 4 * 8.0;
    private readonly GRID_SIZE_Y: number = 4 * 8.0;
    private readonly TOTAL_POINTS = this.GRID_SIZE_X * this.GRID_SIZE_Y;
    private readonly NUM_INDEX_BUFFER_ELEMENTS = 4 * 3 * (((this.GRID_SIZE_X - 1) * 2) * (this.GRID_SIZE_Y - 1));
    private readonly POINT_SIZE = (3 + 3 + 2) * 4;

    private uniformBuffer!: GPUBuffer;
    private inputQuadBuffer!: GPUBuffer;
    public outputPointsBuffer!: GPUBuffer;
    public outputIndexBuffer!: GPUBuffer;
    private readbackPointsBuffer!: GPUBuffer;
    private readbackIndexBuffer!: GPUBuffer;

    constructor(device: GPUDevice) {
        this.device = device;
        this.initComputePipeline();
    }

    private initComputePipeline() {
        const shaderModule = this.device.createShaderModule({
            label: 'Quad Subdivision Compute Shader Module',
            code: shaderCode,
        });

        const uniformData = new Uint32Array([
            this.GRID_SIZE_X,
            this.GRID_SIZE_Y,
            0.0, 0.0
        ]);

        this.uniformBuffer = this.device.createBuffer({
            label: 'Uniform Grid Size Buffer',
            size: uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.uniformBuffer.getMappedRange()).set(uniformData);
        this.uniformBuffer.unmap();


        this.outputPointsBuffer = this.device.createBuffer({
            label: 'outputPointsBuffer',
            size: this.TOTAL_POINTS * this.POINT_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC,
        });

        this.outputIndexBuffer = this.device.createBuffer({
            label: 'outputIndexBuffer',
            // triangle list => points * index Size * Triangle Vertex
            size: this.NUM_INDEX_BUFFER_ELEMENTS,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.INDEX,
        });

        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: 'Compute Bind Group Layout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
            ],
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout],
        });

        this.computePipeline = this.device.createComputePipeline({
            label: 'Quad Subdivision Compute Pipeline',
            layout: pipelineLayout,
            compute: {
                module: shaderModule,
                entryPoint: 'main',
            },
        });

        this.readbackPointsBuffer = this.device.createBuffer({
            label: 'point readback',
            size: this.TOTAL_POINTS * this.POINT_SIZE,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        this.readbackIndexBuffer = this.device.createBuffer({
            label: 'index readback',
            size: this.NUM_INDEX_BUFFER_ELEMENTS,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
    }


    public async subdivide(quad: Float32Array): Promise<[Float32Array, Uint32Array]> {

        if (!this.inputQuadBuffer) {
            this.inputQuadBuffer = this.device.createBuffer({
                label: 'Input Quad Corner Buffer',
                size: quad.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        }

        this.device.queue.writeBuffer(
            this.inputQuadBuffer,
            0,
            quad
        );
        const bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.inputQuadBuffer } },
                { binding: 1, resource: { buffer: this.uniformBuffer } },
                { binding: 2, resource: { buffer: this.outputPointsBuffer } },
                { binding: 3, resource: { buffer: this.outputIndexBuffer } },
            ],
        });

        let commandEncoder = this.device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass({
            label: 'Quad Subdivision Compute Pass',
        });

        computePass.setPipeline(this.computePipeline);
        computePass.setBindGroup(0, bindGroup);

        const dispatchX = Math.ceil(this.GRID_SIZE_X * 4 );
        const dispatchY = Math.ceil(this.GRID_SIZE_Y * 4 );

        computePass.dispatchWorkgroups(dispatchX, dispatchY);

        computePass.end();

        commandEncoder.copyBufferToBuffer(
            this.outputPointsBuffer,
            0,
            this.readbackPointsBuffer,
            0,
            this.readbackPointsBuffer.size
        );

        commandEncoder.copyBufferToBuffer(
            this.outputIndexBuffer,
            0,
            this.readbackIndexBuffer,
            0,
            this.readbackIndexBuffer.size
        );

        this.device.queue.submit([commandEncoder.finish()]);

        await this.readbackPointsBuffer.mapAsync(GPUMapMode.READ);
        await this.readbackIndexBuffer.mapAsync(GPUMapMode.READ);

        const arrayBuffer = this.readbackPointsBuffer.getMappedRange();
        const arrayBufferIndex = this.readbackIndexBuffer.getMappedRange();

        const resultPoints = new Float32Array(arrayBuffer).slice();
        const resultIndex = new Uint32Array(arrayBufferIndex).slice();

        this.readbackPointsBuffer.unmap();
        this.readbackIndexBuffer.unmap();

        return [resultPoints, resultIndex];
    }




}
