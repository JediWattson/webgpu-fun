import textureShader from './shaders/texture.wgsl';

import { makeBindGroup } from "./utils";
import makeMaterial from "./material";
import { makePipeline } from "./pipline";

const textureBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 20,
    attributes: [
        {
            shaderLocation: 0,
            format: `float32x3`,
            offset: 0
        },
        {
            shaderLocation: 1,
            format: `float32x2`,
            offset: 12
        }
    ]
}

export async function makeTexturePipeline({
    device, 
    cameraBuffer,
    texturePath = '',
    bufferSize,
    bufferCb
}: WebGPUApp.BufferPipelineType) {
    const textureBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })    

    const materialBuffer = bufferCb(textureBuffer)
    const textureMaterial = await makeMaterial(device, texturePath)
    const textureBindGroup = makeBindGroup(device, [cameraBuffer, textureBuffer]);

    return makePipeline(
        device, 
        textureShader, 
        textureBufferLayout,
        [textureBindGroup, textureMaterial], 
        [materialBuffer]
    );
}