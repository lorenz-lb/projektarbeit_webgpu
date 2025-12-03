import { vec2, vec3 } from "gl-matrix"

export class ObjMesh {

    buffer!: GPUBuffer
    bufferLayout!: GPUVertexBufferLayout

    v: vec3[]
    vt: vec2[]
    vn: vec3[]
    vertices!: Float32Array
    vertexCount: number

    constructor() {
        this.v = [];
        this.vt = [];
        this.vn = [];
        this.vertexCount = 0;

    }

    async initialize(device: GPUDevice, url: string) {

        await this.readFile(url);
        this.vertexCount = this.vertices.length / 5;

        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        const descriptor: GPUBufferDescriptor = {
            size: this.vertices.byteLength,
            usage: usage,
            mappedAtCreation: true
        };

        this.buffer = device.createBuffer(descriptor);

        new Float32Array(this.buffer.getMappedRange()).set(this.vertices);
        this.buffer.unmap();

        this.bufferLayout = {
            arrayStride: 20,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0,
                },
                {
                    shaderLocation: 1,
                    format: "float32x2",
                    offset: 12 /**2 4 byte numbers**/,
                }

            ]
        };
    }

    // obj parse
    async readFile(url: string) {
        let result: number[] = [];

        const response: Response = await fetch(url);
        const blob: Blob = await response.blob();
        const fileContents: string = (await blob.text());
        const lines = fileContents.split("\n");

        lines.forEach(
            line => {

                if (line[0] == "v" && line[1] == " ") {
                    this.readVertex(line);
                }
                else if (line[0] == "v" && line[1] == "t") {
                    this.readTexCoord(line);
                }
                else if (line[0] == "v" && line[1] == "n") {
                    this.readNomal(line);
                }
                else if (line[0] == "f") {
                    this.readFace(line, result);
                }


            });

        this.vertices = new Float32Array(result);
    }

    readVertex(line: string) {
        const [, x, y, z] = line.split(' ').map(Number);
        const vec: vec3 = [x, y, z]
        this.v.push(vec);
    }

    readTexCoord(line: string) {
        const [, u, v] = line.split(' ').map(Number);
        const vec: vec2 = [u, v];
        this.vt.push(vec);
    }

    readNomal(line: string) {
        const [, nx, ny, nz] = line.split(' ').map(Number);
        const vec: vec3 = [nx, ny, nz]
        this.vn.push(vec);
    }

    readFace(line: string, result: number[]) {
        // fix last line of file sometimes beeing special
        line = line.replace("\n", "");

        const vertexDescription = line.split(" ");
        const triangle_count = vertexDescription.length - 3;

        for (let i = 0; i < triangle_count; i++) {
            this.readVec(vertexDescription[1], result);
            this.readVec(vertexDescription[2 + i], result);
            this.readVec(vertexDescription[3 + i], result);
        }
    }

    readVec(vertexDescription: string, result: number[]) {
        const [vIndex, vtIndex,] = vertexDescription.split("/").map(Number);
        const v = this.v[(vIndex) - 1]
        const vt = this.vt[(vtIndex) - 1]

        result.push(v[0]);
        result.push(v[1]);
        result.push(v[2]);
        result.push(vt[0]);
        result.push(vt[1]);
    }

}
