import type { Vec3 } from "wgpu-matrix";
import type { WebGPUFun } from "./types";

const makeAssetBuffer = (verticesCoords: number[], verts: number) => 
    (device: GPUDevice, objBuffer: GPUBuffer, offset: number = 0): WebGPUFun.AssetBufferType => {

    const vertices = new Float32Array(verticesCoords);
    const descriptor: GPUBufferDescriptor = {
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };
    
    const buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(vertices);
    buffer.unmap();

    const objects: Vec3[] = [];   
    function makeObjects(objs: Vec3[]) {
        objects.push(...objs);
    }

    function update(createModel: WebGPUFun.CreateModelType) {
        objects.forEach((pos, i) => {                                         
            const model = createModel(pos);
            device.queue.writeBuffer(objBuffer, (offset + i)*64, <ArrayBuffer>model);
        })
    }
 
    return {
        verts,
        buffer,
        getCount: () => objects.length,
        makeObjects,
        update
    }
};

export default makeAssetBuffer;