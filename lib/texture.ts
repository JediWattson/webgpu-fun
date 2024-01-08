import textureShader from './shaders/texture.wgsl';

import { makeBindGroup, updateFloor } from "./utils";
import { makeQuad, textureBufferLayout } from "./buffer";
import makeMaterial from "./material";
import { makePipeline } from "./pipline";

const floorCount = 10;

export async function makeTexturePipeline(device: GPUDevice, cameraBuffer: GPUBuffer) {

    const textureBuffer = device.createBuffer({
        size: 64 * (1 + (floorCount*2))**2,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })    

    const floorMesh = makeQuad(device, textureBuffer);
    floorMesh.makeObjects(floorCount, true);
    updateFloor(floorMesh);

    const floorTexture = await makeMaterial(device, 'floor.jpeg')
    const textureBindGroup = makeBindGroup(device, [cameraBuffer, textureBuffer]);

    return makePipeline(
        device, 
        textureShader, 
        textureBufferLayout,
        [textureBindGroup, floorTexture], 
        [floorMesh]
    );
}