import { vec3 } from "gl-matrix";

const makeBuffer = (verticesCoords: number[], verts: number) => 
    (device: GPUDevice, objBuffer: GPUBuffer, offset: number = 0): WebGPUApp.MaterialBufferType => {

    const vertices = new Float32Array(verticesCoords);
    const descriptor: GPUBufferDescriptor = {
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };
    
    const buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(vertices);
    buffer.unmap();

    const objects: vec3[] = [];   
    function makeObjects(objs: vec3[]) {
        objects.push(...objs);
    }

    function update(createModel: WebGPUApp.CreateModelType) {
        objects.forEach((pos, i) => {                                         
            const model = createModel(pos, i);
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

// each point contains 3 position values, 3 color values
export const makeTriangle = makeBuffer([
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0
], 3)

// each point contains 3 position values, 2 texture pos values
export const makeQuad = makeBuffer([
    -0.5,  0.5, 0.0, 1.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 1.0,
     0.5, -0.5, 0.0, 0.0, 1.0,

     0.5, -0.5, 0.0, 0.0, 1.0,
     0.5,  0.5, 0.0, 0.0, 0.0,
    -0.5,  0.5, 0.0, 1.0, 0.0,
], 6)
