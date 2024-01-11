import type { WebGPUFun } from "./types";

function deg2Rad(theta: number) : number {
    return theta * Math.PI / 180;
}

export const rotPos = (eulers: number[]) => [
    Math.cos(deg2Rad(eulers[1])) * Math.cos(deg2Rad(eulers[0])),
    Math.sin(deg2Rad(eulers[1])) * Math.cos(deg2Rad(eulers[0])),
    Math.sin(deg2Rad(eulers[0]))
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