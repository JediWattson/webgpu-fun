export function deg2Rad(theta: number) : number {
    return theta * Math.PI / 180;
}

export const makeEvents = (canvas: HTMLCanvasElement, camera: WebGPUFun.CameraType): WebGPUFun.MakeEventsType => [
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
): WebGPUFun.BindGroupType {
    const entries = buffers.map((buffer, i) => ({ binding:  i, resource: { buffer }})) 
    const layout = device.createBindGroupLayout({ entries: bindGroupLayoutOpts })
    const bindGroup = device.createBindGroup({ layout, entries })
    return { bindGroup, bindGroupLayout: layout }
}