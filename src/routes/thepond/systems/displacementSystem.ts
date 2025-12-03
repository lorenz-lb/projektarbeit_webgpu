
import type { DisplacementComponent } from "../components/displacementComponent";
import type { System } from "./system";

export class DisplacementSystem implements System {

    device: GPUDevice;

    displacementPipeline!: GPUComputePipeline;
    bindGroupLayout!: GPUBindGroupLayout;

    private readonly GRID_SIZE_X = 64;
    private readonly GRID_SIZE_Y = 64;
    private readonly TOTAL_POINTS = this.GRID_SIZE_X * this.GRID_SIZE_Y;

    // buffer
    private uniformBuffer!: GPUBuffer;
    private inputQuadBuffer!: GPUBuffer;


    constructor(device: GPUDevice) {
        this.device = device;
    }

    update(
        displacementComponents: Map<string, DisplacementComponent>,
        deltaTime: number
    ) {


        const gridX = 64;
        const gridY = 64;

        const totalPoints = gridX * gridY;

        const dispatchX = Math.ceil(gridX / 8);
        const dispatchy = Math.ceil(gridY / 8);

        this.device.compute




    }
}
