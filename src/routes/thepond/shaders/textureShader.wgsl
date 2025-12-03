
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
    numSpritesX: f32,
    numSpritesY: f32,
    PADDING1: f32,
    uvOffset: vec2f,
    PADDING2: f32,
    PADDING3: f32,
};

struct Uniforms {
    viewProjectionMatrix: mat4x4<f32>,
    cameraPosition: vec4f,
    time: f32,
    PADDING: f32,
    PADDING1: f32,
    PADDING2: f32,
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
    @location(1) lighting_intensity: f32,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    let modelMatrix = mat4x4<f32>(
        input.modelMatrix_0,
        input.modelMatrix_1,
        input.modelMatrix_2,
        input.modelMatrix_3
    );

    output.position = uniforms.viewProjectionMatrix * modelMatrix * input.position;
    // inverse v 
    output.uv = vec2f(input.uv.x / materialUniforms.numSpritesX, ((1 - input.uv.y) / materialUniforms.numSpritesY));

    return output;
}

     @fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    var texcolor = textureSample(textureData, textureSampler, materialUniforms.uvOffset + input.uv);
    return texcolor;
}
