import { mat4, vec3 } from "wgpu-matrix";
import { rotPos } from "./utils";
import type { WebGPUFun } from "./types";

const MOVEMENT_SCALE = 5;
const FULL_CIRCLE = 360;
const MAX_FOLCRUM = 89;
const upVec = vec3.create(0, 0, 1);

export default function initCamera(device: GPUDevice) {
    const uniBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const projection = mat4.perspective((2 * Math.PI) / MOVEMENT_SCALE, 1, 0.1, 10);
    device.queue.writeBuffer(uniBuffer, 64, <ArrayBuffer>projection);
    
    const eulers = [0, 0];
    const position = vec3.create(-2, 0, 0.5);
    const forwards = vec3.create(...rotPos(eulers));
    const side = vec3.create();

    const camera: WebGPUFun.CameraType = {
        setMovement() {
            vec3.cross(forwards, upVec, side);
            const up = vec3.cross(side, forwards);
            const target = vec3.add(position, forwards);
            const view = mat4.lookAt(position, target, up);
            device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>view);
        },
        move(diff: number, isStrafe?: boolean) {
            const vector = isStrafe ? side : forwards;
            vec3.addScaled(position, vector, diff, position); 
        },
        rotate({ y, z }: WebGPUFun.RotationalType) {
            if (y !== undefined)
                eulers[1] -= (y / MOVEMENT_SCALE) % FULL_CIRCLE;
            if (z !== undefined)
                eulers[0] = Math.min(MAX_FOLCRUM, Math.max(-MAX_FOLCRUM, eulers[0] - z / MOVEMENT_SCALE));
            vec3.copy(rotPos(eulers), forwards)
        },
        reset() {
            eulers.fill(0)
            this.setMovement();
        }
    }

    return { uniBuffer, camera };
}