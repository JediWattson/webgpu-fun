import { mat4 } from "gl-matrix";

import { MaterialBufferType } from "./buffer";
import initCamera, { CameraType } from "./camera";

export type CanvasRefType = HTMLCanvasElement | null;
export type BindGroupType = { 
    bindGroup: GPUBindGroup, 
    bindGroupLayout: GPUBindGroupLayout 
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

export function updateFloor(floorTexture: MaterialBufferType) {
    t += 0.01
    if (t > 2.0 * Math.PI) {
        t -= 2.0 * Math.PI;
    }

    floorTexture.update((pos, i) => {            
        const model = mat4.create();
        mat4.translate(model, model, pos);
        // mat4.invert(model, model);
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