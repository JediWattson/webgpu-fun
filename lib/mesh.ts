import meshShader from './shaders/mesh.wgsl'
import { makePipeline } from "./pipline";
import { makeTriangle, meshBufferLayout } from "./buffer";
import { makeBindGroup, updateTriangles } from "./utils";

const triangleCount = 40;
export function makeMeshPipeline(device: GPUDevice, cameraBuffer: GPUBuffer) {
    const meshBuffer = device.createBuffer({
        size: 64 * triangleCount,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })    

    const triangleMesh = makeTriangle(device, meshBuffer);
    triangleMesh.makeObjects(triangleCount);
    updateTriangles(triangleMesh);

    const meshBindGroup = makeBindGroup(device, [cameraBuffer, meshBuffer]);
    return makePipeline(
        device,
        meshShader, 
        meshBufferLayout,
        [meshBindGroup],
        [triangleMesh]
    );
}