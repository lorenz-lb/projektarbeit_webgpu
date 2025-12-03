import { vec3, mat4 } from "gl-matrix"
import type { System } from "./system";
import type { TransformComponent } from "../components/transformComponent";
import type { TextComponent } from "../components/textComponent";
import { type AtlasMetaData, FONTATLAS_METADATA } from "../assets/fontAtlas/fontAtlas";

const ATLAS_PIXEL_SIZE = 32;
const VERTEX_SIZE_FLOATS = 4;

export class TextMeshGeneratorSystem implements System {
    fontAtlasMap: Map<string, AtlasMetaData>;
    device: GPUDevice;

    constructor(device: GPUDevice) {
        this.device = device;
        this.fontAtlasMap = new Map();

        FONTATLAS_METADATA.forEach(x => this.fontAtlasMap.set(x.char, x));
    }

    update(
        textComponents: Map<number, TextComponent>
    ) {
        for (let [k, v] of textComponents.entries()) {
            if (!v.changed)
                continue;

            let cursorX = v.position[0];
            let cursorY = v.position[1];

            const scale = v.fontSize / ATLAS_PIXEL_SIZE;

            let vertexData = [];

            for (const char of v.text) {
                const meta = this.fontAtlasMap.get(char);
                if (!meta) continue;

                const [u1, v1, u2, v2] = meta.uv;

                const charWidth = meta.width * scale;
                const charHeight = meta.height * scale;

                const x1 = cursorX;
                const y1 = cursorY;
                const x2 = cursorX + charWidth;
                const y2 = cursorY + charHeight;

                vertexData.push(x1, y1, u1, v1);
                vertexData.push(x1, y2, u1, v2);
                vertexData.push(x2, y1, u2, v1);

                vertexData.push(x1, y2, u1, v2);
                vertexData.push(x2, y2, u2, v2);
                vertexData.push(x2, y1, u2, v1);

                cursorX += meta.advance * scale;
            }



            const bufferData = new Float32Array(vertexData);
            const requiredByteSize = bufferData.byteLength;

            if (!v.vertexBuffer || requiredByteSize > v.bufferByteSize) {

                if (v.vertexBuffer) {
                    v.vertexBuffer.destroy();
                }

                v.vertexBuffer = this.device.createBuffer({
                    size: requiredByteSize,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    label: `Text Buffer Entity ${k}`
                });

                v.bufferByteSize = requiredByteSize;
            }

            this.device.queue.writeBuffer(v.vertexBuffer, 0, bufferData);

            v.vertexCount = vertexData.length / VERTEX_SIZE_FLOATS;
            v.changed = false;
        }
    }
}
