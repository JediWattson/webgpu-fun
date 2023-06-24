import { mat4 } from "gl-matrix";

const makeBuffer = (verticesCoords: number[]) => (device: GPUDevice, uniBuffer: GPUBuffer) => {
    // each row contains 3 position values, 3 color values, 3 full points here
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
        arrayStride: 24,
        attributes: [
            {
                shaderLocation: 0,
                format: "float32x3",
                offset: 0
            },
            {
                shaderLocation: 1,
                format: "float32x3",
                offset: 12
            }
        ]
    }

    let t = 0.0
    return {
        buffer,
        bufferLayout,
        update() {
            t += 0.01
            if (t > 2.0 * Math.PI) {
                t -= 2.0 * Math.PI;
            }

            const model = mat4.create();
            mat4.rotate(model, model, t, [0,0,1]);            
            device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>model);

        }
    }
};

// each row contains 3 position values, 3 color values, 3 full points here
export const makeTriangle = makeBuffer([
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0  
])