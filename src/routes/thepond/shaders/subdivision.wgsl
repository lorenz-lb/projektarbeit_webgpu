// use vec4f for alignment 
struct QuadData {
    p0_1: vec4f,
    p0_2: vec4f,
    p1_1: vec4f,
    p1_2: vec4f,
    p2_1: vec4f,
    p2_2: vec4f,
    p3_1: vec4f,
    p3_2: vec4f,
};

struct Uniforms {
    gridDim: vec4u
}

struct Point {
    // FORMAT 
    // pos pos pos norm norm norm uv uv 
    data1: vec4f,
    data2: vec4f,
}

@group(0) @binding(0) var<uniform> quad_data: QuadData;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var<storage, read_write> output_points: array<Point>;
@group(0) @binding(3) var<storage, read_write> output_index: array<u32>;


fn generatePoints(x: u32, y: u32) {
    var index: u32 = ((y * uniforms.gridDim.x) + x);

    let maxX = uniforms.gridDim.x-1;
    let maxY = uniforms.gridDim.y-1;

    var x_part = 0f;
    var y_part = 0f;

    if x != 0 {
        x_part = f32(x) / f32(maxX);
    }
    if y != 0 {
        y_part = f32(y) / f32(maxY);
    }

    var p_x_top = mix(quad_data.p0_1.xyz, quad_data.p3_1.xyz, x_part);
    var p_x_bottom = mix(quad_data.p1_1.xyz, quad_data.p2_1.xyz, x_part);
    var p1 = mix(p_x_bottom, p_x_top, y_part);

    var p1_data1 = vec4f(p1.xyz, 1.0);
    var p1_data2 = vec4f(1, 1, 0, 1.0);

    output_points[index].data1 = p1_data1;
    output_points[index].data2 = p1_data2;
}

fn createIndex(x: u32, y: u32) {

    var index = 3 * (u32(max((i32(x) * 2 -1), 0)) + (y * (2 * (uniforms.gridDim.x-1)))) ;
    var offset = 0u;

    let xBoundMax = uniforms.gridDim.x -1;

    // left triangle
    if x > 0 {
        output_index[index + 0] = (y * uniforms.gridDim.x + x);
        output_index[index + 1] = ((y) * uniforms.gridDim.x + (x - 1));
        output_index[index + 2] = ((y + 1) * uniforms.gridDim.x + x);

        offset = 3u;

        if false {
            output_index[index + 0] = 111;
            output_index[index + 1] = x;
            output_index[index + 2] = y;
        }
    }

    // right triangle
    if x < xBoundMax {
        output_index[index + offset] = (y * uniforms.gridDim.x + x);
        output_index[index + offset + 1] = ((y + 1) * uniforms.gridDim.x + x);
        output_index[index + offset + 2] = ((y + 1) * uniforms.gridDim.x + (x + 1));

        if false {
            output_index[index + offset] = 222;
            output_index[index + offset + 1] = x;
            output_index[index + offset + 2] = y;
        }
    }
}

    @compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) global_id: vec3<u32 >
) {
    let total_points: u32 = uniforms.gridDim.x * uniforms.gridDim.y;

    let x = (global_id.x * global_id.y + global_id.x) % uniforms.gridDim.x ;
    let y = (global_id.x * global_id.y + global_id.x) / uniforms.gridDim.x ;

    if x * y + x > total_points {
        return;
    }

    generatePoints(x, y);
    createIndex(x, y);
}

