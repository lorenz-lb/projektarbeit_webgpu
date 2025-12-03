
import { Triangle } from './triangle'
import { Quad } from './quad';
import { Camera } from './camera'
import { vec3, mat4 } from "gl-matrix"
import { ObjectTypes, type RenderData } from './definitions';
import { Statue } from './statue';

export class Scene {

    trianlges!: Triangle[];
    quads!: Quad[];
    player!: Camera;
    statue!: Statue;
    objectData!: Float32Array;
    triangleCount: number;
    quadCount: number;


    constructor() {
        this.objectData = new Float32Array(16 * 1024);
        this.triangleCount = 0;
        this.quadCount = 0;
        this.trianlges = [];
        this.quads = [];
        this.make_triangles();
        this.make_quads();

        this.statue = new Statue([0, 0, 0], [0, 0, 0]);

        this.player = new Camera([-3, 0, 0.5], 0, 0);
    }

    make_triangles() {
        let i = 0;
        for (let y = -5; y <= 5; y++) {
            this.trianlges.push(new Triangle([2, y, 0], 0));
            let blank_matrix = mat4.create();
            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>blank_matrix[j];
            }
            i++;
            this.triangleCount++;
        }
    }

    make_quads() {
        let i = this.triangleCount;

        for (let x = -10; x < 10; x++) {
            for (let y = -10; y < 10; y++) {
                this.quads.push(new Quad([x, y, 0]));
                let blank_matrix = mat4.create();
                for (let j = 0; j < 16; j++) {
                    this.objectData[16 * i + j] = <number>blank_matrix[j];
                }
                i++;
                this.quadCount++;
            }
        }
    }

    update() {
        let i = 0;

        this.trianlges.forEach((triangle) => {
            triangle.update();
            let model = triangle.get_model();
            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j];
            }
            i++;
        });

        this.quads.forEach((quad) => {
            quad.update();
            let model = quad.get_model();
            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j];
            }
            i++;
        });

        this.statue.update();
        let model = this.statue.get_model();
        for (let j = 0; j < 16; j++) {
            this.objectData[16 * i + j] = <number>model[j];
        }
        i++;

        this.player.update();
    }

    get_player(): Camera {
        return this.player;
    }
    getRenderables(): RenderData {
        return {
            viewTransform: this.player.get_view(),
            modelTransforms: this.objectData,
            objectsCount: {
                [ObjectTypes.TRIANGLE]: this.triangleCount,
                [ObjectTypes.QUAD]: this.quadCount,
            }
        }

    }

    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX;
        this.player.eulers[2] %= 360;

        this.player.eulers[1] = Math.min(
            89, Math.max(-89, this.player.eulers[1] + dY)
        );
    }

    move_player(forwards_amount: number, right_amount: number) {
        vec3.scaleAndAdd(
            this.player.position, this.player.position,
            this.player.forwards, forwards_amount
        );

        vec3.scaleAndAdd(
            this.player.position, this.player.position,
            this.player.right, right_amount
        );
    }
}
