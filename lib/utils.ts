import { mat4 } from "gl-matrix";

import { MaterialBufferType } from "./buffer";
import initCamera, { CameraType } from "./camera";

export type CanvasRefType = HTMLCanvasElement | null;
export type BindGroupType = { 
    bindGroup: GPUBindGroup, 
    bindGroupLayout: GPUBindGroupLayout 
}
export type PipelineType = { 
    materials: MaterialBufferType[], 
    pipeline: GPURenderPipeline, 
    bindGroups: GPUBindGroup[] 
}

export function makeCamera(device: GPUDevice, cameraRef: { current?: CameraType }) {
    const uniBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    cameraRef.current = initCamera(device, uniBuffer);
    return uniBuffer;
}

export function makeDepthStencil(device: GPUDevice): GPURenderPassDepthStencilAttachment {
    const depthStencilBuffer = device.createTexture({
        size: {
            width: 300,
            height: 150,
            depthOrArrayLayers: 1
        },
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const depthStencilView = depthStencilBuffer.createView({ format: "depth32float" });
    
    return {
        view: depthStencilView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
    };
}

export function makeBindGroup(device: GPUDevice, buffers: GPUBuffer[]): BindGroupType {
    const bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
        {
            // perspective
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: 'uniform' }
        },
        {
            // object position
            binding: 1,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "read-only-storage", hasDynamicOffset: false }
        }
    ]

    const bindGroupEntries: GPUBindGroupEntry[] = buffers.map(
        (buffer, i) => ({ binding:  i, resource: { buffer }})
    ) 

    const bindGroupLayout = device.createBindGroupLayout({ entries: bindGroupLayoutEntries })

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: bindGroupEntries
    })

    return { bindGroup, bindGroupLayout }
}

export function makePipeline(
    device: GPUDevice, 
    shader: string, 
    bufferLayout: GPUVertexBufferLayout,
    bindGroups: BindGroupType[], 
    materials: MaterialBufferType[]
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

export function updateFloor(floorTexture: MaterialBufferType) {
    floorTexture.update((pos, i) => {            
        const model = mat4.create();
        mat4.translate(model, model, pos);        
        return model;
    })
}

let t = 0.0
export function updateTriangles(triangleMesh: MaterialBufferType) {
    t += 0.01
    if (t > 2.0 * Math.PI) {
        t -= 2.0 * Math.PI;
    }

    triangleMesh.update((o, i) => {
        const model = mat4.create();
        mat4.translate(model, model, o);
        mat4.rotateZ(model, model, t);
        return model;
    });
}