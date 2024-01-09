import { makeRenderPipelineOpts } from "./config";
import makeTexture from "./texture";
import { makeBindGroup } from "./utils";

export async function makePipeline({
    device, 
    cameraBuffer,
    bufferSize,
    bufferCb,
    bindGroupLayoutOpts,
    renderPipelineOpts,
    texturePipelineOpts
}: WebGPUApp.BufferPipelineType): Promise<WebGPUApp.PipelineType> {    
    const buffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })    

    const material = bufferCb(device, buffer)
    const bindings = [makeBindGroup(device, [cameraBuffer, buffer], bindGroupLayoutOpts)];
    if (texturePipelineOpts) {
        const material = await makeTexture(device, texturePipelineOpts)
        bindings.push(material)
    }

    const { shader, vertexBufferLayout } = renderPipelineOpts;
    const renderOpts = makeRenderPipelineOpts(
        device.createShaderModule({ code: shader }), 
        vertexBufferLayout
    )
    renderOpts.layout = device.createPipelineLayout({ 
        bindGroupLayouts: bindings.map(b => b.bindGroupLayout)
    });

    const pipeline = device.createRenderPipeline(renderOpts as GPURenderPipelineDescriptor)

    return {
        pipeline,
        material,
        bindGroups: bindings.map(b => b.bindGroup)
    }
}

export function runPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelines: WebGPUApp.PipelineType[],
    opts: WebGPUApp.RunPipelineOptsType
): () => void {
    const { colorAttachments, depthStencilAttachment, depthStencil } = opts;
    depthStencilAttachment.view = device.createTexture(depthStencil.texture).createView(depthStencil.view)
    
    let frameId: number;
    function frame() {        
        const commandEncoder = device.createCommandEncoder();
        const view = context.getCurrentTexture().createView();
        colorAttachments.forEach(attachment => { attachment.view = view; })

        const renderPassDescriptor: GPURenderPassDescriptor = {
            depthStencilAttachment: depthStencilAttachment as GPURenderPassDepthStencilAttachment,
            colorAttachments: colorAttachments as GPURenderPassColorAttachment[],
        };
        
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        pipelines.forEach(({ bindGroups, pipeline, material }) => {
            passEncoder.setPipeline(pipeline);
            bindGroups.forEach((bindGroup, i) => {
                passEncoder.setBindGroup(i, bindGroup);    
            })
            if (material.updateMaterial) material.updateMaterial(material);
            passEncoder.setVertexBuffer(0, material.buffer);            
            const currentCount = material.getCount();                
            passEncoder.draw(material.verts, currentCount, 0, 0);
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