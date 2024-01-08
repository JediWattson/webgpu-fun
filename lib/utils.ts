import { mat4 } from "gl-matrix";

import { MaterialBufferType } from "./buffer";
import initCamera, { CameraType } from "./camera";

export type BindGroupType = { 
    bindGroup: GPUBindGroup, 
    bindGroupLayout: GPUBindGroupLayout 
}

export type PipelineType = { 
    materials: MaterialBufferType[], 
    pipeline: GPURenderPipeline, 
    bindGroups: GPUBindGroup[] 
}

type MakeEventsType = { event: string, cb: (e: Event) => void }[]

export const makeEvents = (canvas: HTMLCanvasElement, camera: CameraType): MakeEventsType => [
    { event: 'keydown', cb: e => camera.move((e as KeyboardEvent).key) },
    { event: 'keyup', cb: e => camera.move((e as KeyboardEvent).key, true) },
    { event: 'click', cb: () => canvas.requestPointerLock() },
    { event: 'mouseout', cb: () => camera.reset() },
    { event: 'mousemove', cb: e => {
        if(!document.pointerLockElement) return;
        camera?.rotate(e as MouseEvent);
    }}
]

export function makeCamera(device: GPUDevice) {
    const cameraBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const camera = initCamera(device, cameraBuffer);
    return { cameraBuffer, camera };
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