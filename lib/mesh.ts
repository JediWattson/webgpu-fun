import meshShader from './shaders/mesh.wgsl'
import { makePipeline } from "./pipline";
import { makeBindGroup } from "./utils";

const meshBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 24,
    attributes: [
        {
            shaderLocation: 0,
            format: `float32x3`,
            offset: 0
        },
        {
            shaderLocation: 1,
            format: `float32x3`,
            offset: 12
        }
    ]
}

const triangleCount = 40;
export function makeMeshPipeline({
    device, 
    cameraBuffer,
    bufferSize,
    bufferCb
}: WebGPUApp.BufferPipelineType) {
    const meshBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })    

    const pipelineBuffer = bufferCb(meshBuffer)
    const meshBindGroup = makeBindGroup(device, [cameraBuffer, meshBuffer]);
    return makePipeline(
        device,
        meshShader, 
        meshBufferLayout,
        [meshBindGroup],
        [pipelineBuffer]
    );
}