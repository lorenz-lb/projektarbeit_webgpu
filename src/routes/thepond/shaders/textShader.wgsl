@group(0) @binding(0) var<uniform> projectionMatrix: mat4x4<f32>;

@group(1) @binding(0) var atlasSampler: sampler;    
@group(1) @binding(1) var atlasTexture: texture_2d<f32>; 
@group(2) @binding(0) var<uniform> textColor: vec4<f32>;

struct VertexInput {
    @location(0) position: vec2<f32>,
    @location(1) uv: vec2<f32>,
};

struct FragmentOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) @interpolate(perspective, center) frag_uv: vec2<f32>,
};


@vertex
fn vs_main(input: VertexInput) -> FragmentOutput {
    var output: FragmentOutput;
    output.clip_position = projectionMatrix * vec4<f32>(input.position.x, input.position.y, 0.0, 1.0);
    output.frag_uv = input.uv;
    return output;
}


@fragment
fn fs_main(input: FragmentOutput) -> @location(0) vec4<f32> {
    let texel = textureSample(atlasTexture, atlasSampler, input.frag_uv);

    if texel.a < 0.01 {
        discard;
    }


    //return vec4<f32>(textColor.rgb, textColor.a * texel.a);
    return vec4<f32>(1, 1, 1, 1);
}
