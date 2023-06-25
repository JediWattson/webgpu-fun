import { mat4, vec3 } from "gl-matrix";

type CreateModelType = (pos: vec3, i: number) => mat4

export type MaterialBufferType = { 
    buffer: GPUBuffer, 
    bufferLayout: GPUVertexBufferLayout,
    update: (createModel: CreateModelType) => void, 
    getCount: () => number 
}

export const meshBufferLayout: GPUVertexBufferLayout = {
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


    const objects: vec3[] = [];   
    function makeObjects(count: number = 1, isFloor?: boolean) {
        if (isFloor) {                                
            for (var x: number = -count; x <= count; x++) {
                for (var y: number = -count; y <= count; y++) {
                    objects.push([x, y, -1]);
                    console.log([x, y, -1]);
                    
                }
            }                
        } else {
            for(let i = 0; i < count; i++) {
                objects.push([2, i, 0]);
            }    
        }
    }

    function update(createModel: CreateModelType) {
        objects.forEach((pos, i) => {                                
            const model = createModel(pos, i);
            device.queue.writeBuffer(objBuffer, (offset + i)*64, <ArrayBuffer>model);
        })
    }
 
    return {
        buffer,
        getCount() {
            return objects.length;
        },
        makeObjects,
        update
    }
};

// each point contains 3 position values, 3 color values
export const makeTriangle = makeBuffer(3, 3, [
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0  
])

// each point contains 3 position values, 2 texture pos values
export const makeQuad = makeBuffer(3, 3, [
    -0.5,  0.5, 0.0, 1.0, 0.0, 0.0,
    -0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 
     0.5, -0.5, 0.0, 0.0, 0.0, 1.0,

     0.5, -0.5, 0.0, 1.0, 1.0, 1.0,
     0.5,  0.5, 0.0, 0.0, 0.0, 1.0, 
    -0.5,  0.5, 0.0, 0.0, 1.0, 0.0,
])