struct Transform {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>
}
@binding(0) @group(0) var<uniform> transformUBO: Transform;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>
}

@vertex
fn vs_main(
    @location(0) vertexPos: vec2<f32>, 
    @location(1) vertexCol: vec3<f32>) -> Fragment {

    var output: Fragment;
    output.Position = vec4<f32>(vertexPos, 0.0, 1.0);
    output.Color = vec4<f32>(vertexCol, 1.0);

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32>) -> @location(0) vec4<f32> {
    return Color;
}