import { vec2, vec3 } from "gl-matrix"
import { Material } from "../view/material"

export interface OBJData {
    v: vec3[]
    vt: vec2[]
    vn: vec3[]
    vertices: Float32Array
    vertexCount: number
    drawGroups: Array<{ materialName: string, startIndex: number, count: number }>
    mtlFilename: string
}

export interface MTLData {
    name: string;
    kd: vec3;
    map_kd: string;
    map_bump: string;
}

export class OBJParser {

    public static createEmptyObjData(): OBJData {
        let objData = {
            v: [],
            vt: [],
            vn: [],
            vertexCount: 0,
            vertices: new Float32Array(),
            drawGroups: [],
            mtlFilename: "",
        } as OBJData;

        return objData;
    }

    // obj parse
    private static async readOBJFile(url: string): Promise<OBJData> {
        let objData = OBJParser.createEmptyObjData();
        let result: number[] = [];

        const response: Response = await fetch(url);
        const blob: Blob = await response.blob();
        const fileContents: string = (await blob.text());
        const lines = fileContents.split("\n");

        let currentMaterialName = "default";
        let currentStartIndex = 0;

        for (let line of lines) {

            line = line.trim();
            const prefix = line.substring(0, line.indexOf(' ') > 0 ? line.indexOf(' ') : line.length);

            // ------------------------------------------------------------------
            // Material and Group 
            // ------------------------------------------------------------------
            if (line.startsWith('mtllib ')) {
                objData.mtlFilename = line.split(" ")[1]
            }
            else if (prefix === 'usemtl') {
                const newMaterialName = line.substring(7).trim();

                const count = (result.length / 8) - currentStartIndex;

                if (count > 0) {
                    objData.drawGroups.push({
                        materialName: currentMaterialName,
                        startIndex: currentStartIndex,
                        count: count
                    });
                }

                currentMaterialName = newMaterialName;
                currentStartIndex = result.length / 8; // Index des nächsten Vertex
            }
            else if (prefix === 'g') {
                // const groupName = line.substring(2).trim();
            }

            // ------------------------------------------------------------------
            // Geometry (v, vt, vn)
            // ------------------------------------------------------------------
            else if (line.startsWith('v ')) { // vertex
                const parts = line.split(/\s+/).map(Number);
                objData.v.push([parts[1], parts[2], parts[3]]);
            }
            else if (line.startsWith('vt')) { // texture
                const parts = line.split(/\s+/).map(Number);
                objData.vt.push([parts[1], parts[2]]);
            }
            else if (line.startsWith('vn')) { // normals
                const parts = line.split(/\s+/).map(Number);
                objData.vn.push([parts[1], parts[2], parts[3]]);
            }

            // ------------------------------------------------------------------
            // Faces (f) 
            // ------------------------------------------------------------------
            else if (prefix === 'f') {
                const vertexDescription = line.split(/\s+/);
                vertexDescription.shift();

                const triangle_count = vertexDescription.length - 2;

                for (let i = 0; i < triangle_count; i++) {
                    OBJParser.readVec(vertexDescription[0], result, objData);
                    OBJParser.readVec(vertexDescription[i + 1], result, objData);
                    OBJParser.readVec(vertexDescription[i + 2], result, objData);
                }
            }
        }

        const finalCount = (result.length / 8) - currentStartIndex;
        if (finalCount > 0) {
            objData.drawGroups.push({
                materialName: currentMaterialName,
                startIndex: currentStartIndex,
                count: finalCount
            });
        }


        objData.vertices = new Float32Array(result);

        return objData;
    }


    private static readVec(vertexDescription: string, result: number[], objData: OBJData) {
        const parts = vertexDescription.split("/");

        const vIndex = Number(parts[0]);
        const vtIndex = (parts.length > 1 && parts[1]) ? Number(parts[1]) : 0;
        const vnIndex = (parts.length > 2 && parts[2]) ? Number(parts[2]) : 0;

        const v = objData.v[vIndex - 1];
        const vt = (vtIndex > 0) ? objData.vt[vtIndex - 1] : [0, 0];
        const vn = (vnIndex > 0) ? objData.vn[vnIndex - 1] : [0, 0, 0];

        result.push(v[0], v[1], v[2]);
        result.push(vn[0], vn[1], vn[2]);
        result.push(vt[0], vt[1]);
    }

    static async createMesh(device: GPUDevice, url: string, label: string)
        : Promise<{ buffer: GPUBuffer, count: number, groups: Array<{ materialName: string, startIndex: number, count: number }>, vertices: Float32Array }> {
        let objData = await OBJParser.readOBJFile(url);

        // Vertex, Normal, UV
        objData.vertexCount = objData.vertices.length / 8;

        const buffer = device.createBuffer({
            size: objData.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
            label: label
        });

        new Float32Array(buffer.getMappedRange()).set(objData.vertices);
        buffer.unmap();

        console.log(`OBJ-File read: \t vertexCount: ${objData.vertexCount} \t vertices.length: ${objData.vertices.length} \t vertexNormals: ${objData.vn.length}`)

        return { buffer, count: objData.vertexCount, groups: objData.drawGroups, vertices: objData.vertices };
    }
}

export class MTLParser {
    static async readMTLFile(url: string): Promise<{ [name: string]: MTLData }> {
        const basePath = url.replace(/\\/g, '/').substring(0, url.lastIndexOf('/') + 1);

        const response: Response = await fetch(url);
        const fileContents: string = (await response.text());
        const lines = fileContents.split("\n");


        let materials: { [name: string]: MTLData } = {};
        let currentMaterial: Partial<MTLData> | null = null;

        // Standardwerte für Robustheit
        const defaultKd: vec3 = [1, 1, 1];

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const keyword = parts[0];

            if (keyword === 'newmtl') {
                // 1. Altes Material abschließen
                if (currentMaterial && currentMaterial.name) {
                    currentMaterial.kd = currentMaterial.kd || defaultKd;
                    currentMaterial.map_kd = currentMaterial.map_kd ? basePath + currentMaterial.map_kd : '';
                    currentMaterial.map_bump = currentMaterial.map_bump ? basePath + currentMaterial.map_bump : '';

                    materials[currentMaterial.name] = currentMaterial as MTLData;
                }

                // 2. Neues Material starten
                const name = parts[1].trim();
                currentMaterial = { name: name };
            }

            else if (!currentMaterial) {
                continue;
            }

            // 3. Eigenschaften parsen
            else if (keyword === 'Kd') { // Diffuse Farbe (Basisfarbe)
                currentMaterial.kd = [Number(parts[1]), Number(parts[2]), Number(parts[3])] as vec3;
            }
            else if (keyword === 'map_Kd') { // Pfad zur Diffuse Textur
                // Nehmen wir an, der Pfad ist nur der zweite Teil
                currentMaterial.map_kd = parts[1];
            }
            else if (keyword === 'map_Bump' || keyword === 'bump') { // Pfad zur Normal Map
                currentMaterial.map_bump = parts[1];
            }
        }

        // 4. Das allerletzte Material abschließen
        if (currentMaterial && currentMaterial.name) {
            currentMaterial.kd = currentMaterial.kd || defaultKd;
            currentMaterial.map_kd = currentMaterial.map_kd ? basePath + currentMaterial.map_kd : '';
            currentMaterial.map_bump = currentMaterial.map_bump ? basePath + currentMaterial.map_bump : '';

            materials[currentMaterial.name] = currentMaterial as MTLData;
        }

        return materials;
    }
}

