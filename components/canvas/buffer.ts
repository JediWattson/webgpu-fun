export const makeBuffer = (device: GPUDevice) => {
    // each row contains 3 position values, 3 color values, 3 full points here
    const vertices = new Float32Array([
          0.0,  0.5, 1.0, 0.0, 0.0,
         -0.5, -0.5, 0.0, 1.0, 0.0, 
          0.5, -0.5, 0.0, 0.0, 1.0  
    ]);

    const descriptor: GPUBufferDescriptor = {
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };

    const buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(vertices);
    buffer.unmap();

    const bufferLayout: GPUVertexBufferLayout = {
        arrayStride: 20,
        attributes: [
            {
                shaderLocation: 0,
                format: "float32x2",
                offset: 0
            },
            {
                shaderLocation: 1,
                format: "float32x3",
                offset: 8
            }
        ]
    }

    return {
        buffer,
        bufferLayout
    }
};