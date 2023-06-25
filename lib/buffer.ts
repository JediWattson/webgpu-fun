import { mat4, vec3 } from "gl-matrix";


type CreateModelType = (pos: vec3, i: number) => mat4

export type MeshBufferType = { 
    buffer: GPUBuffer, 
    update: (createModel: CreateModelType) => void, 
    getCount: () => number 
}

const makeBuffer = (posByteCount: 2 | 3, colorByteCount: 2 | 3,  verticesCoords: number[]) => 
    (device: GPUDevice, objBuffer: GPUBuffer, offset: number = 0) => {
    
    const vertices = new Float32Array(verticesCoords);
    const descriptor: GPUBufferDescriptor = {
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };

    const buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(vertices);
    buffer.unmap();

    const bufferLayout: GPUVertexBufferLayout = {
        arrayStride: (posByteCount+colorByteCount)*4,
        attributes: [
            {
                shaderLocation: 0,
                format: `float32x${posByteCount}`,
                offset: 0
            },
            {
                shaderLocation: 1,
                format: `float32x${colorByteCount}`,
                offset: posByteCount*4
            }
        ]
    }

    const objects: vec3[] = [];    
    return {
        buffer,
        bufferLayout,
        getCount() {
            return objects.length;
        },
        makeObjects(count: number = 1) {
            for(let i = 0; i < count; i++) {
                objects.push([ 7 + (i - (count/2)), 1 + (i - (count/2))*.25, 0]);
            }
        },
        update(createModel: CreateModelType) {
            objects.forEach((pos, i) => {
                const model = createModel(pos, i);
                device.queue.writeBuffer(objBuffer, offset + i*64, <ArrayBuffer>model);    
            })
        }
    }
};

// each point contains 3 position values, 3 color values
export const makeTriangle = makeBuffer(3, 3, [
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0  
])

// each point contains 2 position values, 2 color values
export const makeQuad = makeBuffer(3, 2, [
    -0.5, -0.5, 0.0, 0.0, 0.0,
     0.5, -0.5, 0.0, 1.0, 0.0,
     0.5,  0.5, 0.0, 1.0, 1.0,

     0.5,  0.5, 0.0, 1.0, 1.0,
    -0.5,  0.5, 0.0, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0, 0.0
])