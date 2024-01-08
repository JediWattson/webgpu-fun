import { makeDepthStencil, updateTriangles } from "./utils";

export function makePipeline(
    device: GPUDevice, 
    shader: string, 
    bufferLayout: GPUVertexBufferLayout,
    bindGroups: WebGPUApp.BindGroupType[], 
    materials: WebGPUApp.MaterialBufferType[]
) {    
    const pipelineLayout = device.createPipelineLayout({ 
        bindGroupLayouts: bindGroups.map(b => b.bindGroupLayout)
    });

    const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        depthStencil: {
            format: "depth32float",
            depthWriteEnabled: true,
            depthCompare: "less-equal"
        },
        vertex: {
            entryPoint: "vs_main",
            module: device.createShaderModule({
                code: shader
            }),
            buffers: [bufferLayout]
        },
        fragment: {
            entryPoint: "fs_main",
            module: device.createShaderModule({
                code: shader
            }),
            targets: [{ format: "bgra8unorm" }]
        },
        primitive : {
            topology : "triangle-list"
        },
    })

    return {
        pipeline,
        bindGroups: bindGroups.map(b => b.bindGroup),
        materials
    }
}

export function runPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelines: WebGPUApp.PipelineType[]
): () => void {
    const depthStencilAttachment = makeDepthStencil(device);
    
    let frameId: number;
    function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            depthStencilAttachment,
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };
        
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        pipelines.forEach(({ bindGroups, pipeline, materials }) => {
            passEncoder.setPipeline(pipeline);
            bindGroups.forEach((bindGroup, i) => {
                passEncoder.setBindGroup(i, bindGroup);    
            })
            let objectCount = 0
            materials.forEach((material, i) => {
                if (material.updateMaterial) material.updateMaterial(material);
                passEncoder.setVertexBuffer(0, material.buffer);            
                const currentCount = material.getCount();                
                passEncoder.draw(material.verts, currentCount, 0, objectCount);    
                objectCount += currentCount
            })
        })

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    
    return () => {       
        if (!Number.isInteger(frameId)) return;
        cancelAnimationFrame(frameId);
    };
}