// WGSL Shader Code

struct MaterialConstants {
    kdColor: vec4f,
    ksColor: vec4f,
    kaColor: vec4f,
    nsValue: f32,
    dValue: f32,
    illumModel: f32,
    scrollSpeed: f32,
    parallaxFactor: f32,
    PADDING1: f32,
    PADDING2: f32,
    PADDING3: f32
};

struct Uniforms {
    viewProjectionMatrix: mat4x4<f32>,
    cameraPosition: vec4f,
    time: f32,
    PADDING1: f32,
    PADDING2: f32,
    PADDING3: f32
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(1) @binding(0) var<uniform> materialUniforms : MaterialConstants; 
@group(2) @binding(0) var textureData: texture_2d<f32>; 
@group(2) @binding(1) var textureSampler: sampler;
        
struct VertexInput {
    @location(0) position: vec4f,
    @location(1) normal: vec4f,
    @location(2) uv: vec2f,
    @location(4) modelMatrix_0: vec4f,
    @location(5) modelMatrix_1: vec4f,
    @location(6) modelMatrix_2: vec4f,
    @location(7) modelMatrix_3: vec4f,
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(2) worldPos: vec3f,
    @location(3) @interpolate(flat) worldNormal: vec3f,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_idx: u32, input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    let modelMatrix = mat4x4<f32>(
        input.modelMatrix_0,
        input.modelMatrix_1,
        input.modelMatrix_2,
        input.modelMatrix_3
    );

    // ####### waves #########
    let px = input.position.x;
    let pz = input.position.z;
    let worldPos = (modelMatrix * input.position).xyz;
    let baseNormal = input.normal.xyz;

    // ####### wave 1 #########
    let amplitude1 = 0.2f;
    let frequenz1 = 41f;
    let speed1 = -0.05f;

    let time_term1 = frequenz1 * (px - speed1 * uniforms.time);
    let offset_y1 = amplitude1 * sin(time_term1);
    let slope1 = amplitude1 * frequenz1 * cos(time_term1);

    // ####### wave 2 #########
    let amplitude2 = 0.2f;
    let frequenz2 = 119f;
    let speed2 = -0.01f;

    let time_term2 = frequenz2 * (pz - speed2 * uniforms.time);
    let offset_y2 = amplitude2 * (sin(time_term2));
    let slope2 = amplitude2 * frequenz2 * cos(time_term2);

    // ### combine waves ###
    var total_offset_y = offset_y2 + offset_y1;
    let animatedWorldPos = worldPos + vec3f(0, total_offset_y, 0);

    // ####### normals #########
    let correctedNormal = normalize(vec3f(
        baseNormal.x * 1.0 + baseNormal.y * slope1,
        baseNormal.y * 1.0,
        baseNormal.z * 1.0 + baseNormal.y * slope2
    ));

    let worldNormal = normalize((modelMatrix * vec4f(correctedNormal, 0.0)).xyz);

    output.position = uniforms.viewProjectionMatrix * vec4(animatedWorldPos, 1.0);
    output.worldPos = animatedWorldPos;
    output.worldNormal = worldNormal;
    output.uv = vec2f(input.uv.x, 1.0 - input.uv.y);

    return output;
} 

     @fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {

    let N: vec3f = normalize(input.worldNormal);
    let L: vec3f = normalize(vec3f(0.5, 1, 0.1));
    let diffuseIntensity = max(dot(N, L), 0.0) ;
    let ambient: f32 = 0.8;
    let totalIntensity = ambient + diffuseIntensity;

    let finalColor = materialUniforms.kdColor * totalIntensity ;

    return vec4f(finalColor.xyz, 1.0);
}
