import { mat4 } from "wgpu-matrix";

export const makeEvents = (canvas: HTMLCanvasElement, camera: WebGPUApp.CameraType): WebGPUApp.MakeEventsType => [
    { event: 'keydown', cb: e => camera.move((e as KeyboardEvent).key) },
    { event: 'keyup', cb: e => camera.move((e as KeyboardEvent).key, true) },
    { event: 'click', cb: () => canvas.requestPointerLock() },
    { event: 'mouseout', cb: () => camera.reset() },
    { event: 'mousemove', cb: e => {
        if(!document.pointerLockElement) return;
        camera?.rotate(e as MouseEvent);
    }}
]

export function makeBindGroup(
    device: GPUDevice, 
    buffers: GPUBuffer[], 
    bindGroupLayoutOpts: GPUBindGroupLayoutEntry[]
): WebGPUApp.BindGroupType {
    const entries = buffers.map((buffer, i) => ({ binding:  i, resource: { buffer }})) 
    const layout = device.createBindGroupLayout({ entries: bindGroupLayoutOpts })
    const bindGroup = device.createBindGroup({ layout, entries })
    return { bindGroup, bindGroupLayout: layout }
}

export function updateFloor(floorTexture: WebGPUApp.MaterialBufferType) {
    floorTexture.update(pos => mat4.translation(pos))
}

let t = 0.0
export function updateTriangles(triangleMesh: WebGPUApp.MaterialBufferType) {
    t += 0.01
    if (t > 2.0 * Math.PI) {
        t -= 2.0 * Math.PI;
    }

    triangleMesh.update(pos => {
        const model = mat4.create();
        mat4.translation(pos, model);        
        return mat4.rotateZ(model, t);
    });
}