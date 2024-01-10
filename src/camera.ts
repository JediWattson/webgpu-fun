import { Vec3, mat4, vec3 } from "wgpu-matrix";
import { deg2Rad } from "./utils";
import type { WebGPUFun } from "./types";

const MOVEMENT_SCALE = 5;
const FULL_CIRCLE = 360;
const MOVEMENT_DIFF = 0.05;
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
    const forwards = vec3.create();
    const up = vec3.create();
    const side = vec3.create();
    const target = vec3.create();
    const view = mat4.create();

    function setMovement() {
        vec3.copy([
            Math.cos(deg2Rad(eulers[1])) * Math.cos(deg2Rad(eulers[0])),
            Math.sin(deg2Rad(eulers[1])) * Math.cos(deg2Rad(eulers[0])),
            Math.sin(deg2Rad(eulers[0]))
        ], forwards)        
        vec3.cross(forwards, upVec, side);
        vec3.cross(side, forwards, up);
        vec3.add(position, forwards, target);
        mat4.lookAt(position, target, up, view);
        device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>view);
    }    

    setMovement();

    const keysDown: { [key: string]: number } = {}
    function handleDiff(direction: string[], vector: Vec3) {        
        if (direction.every(k => !(k in keysDown))) return;

        let diff = MOVEMENT_DIFF
        if (direction[1] in keysDown || keysDown[direction[0]] > keysDown[direction[1]])
            diff = -MOVEMENT_DIFF
        vec3.addScaled(position, vector, diff, position);        
    }

    let frameNumber: number
    function moveCamera() {
        if (Object.keys(keysDown).length === 0) return;

        handleDiff(['d', 'a'], side)
        handleDiff(['w', 's'], forwards)
 
        setMovement()
        frameNumber = requestAnimationFrame(moveCamera);
    }

    const camera: WebGPUFun.CameraType = {
        move(key, isUpPress = false) {   
            if (!['w', 'a', 's', 'd'].includes(key)) return

            if (isUpPress) {
                delete keysDown[key]
                return;
            }

            keysDown[key] = Object.keys(keysDown).length
            cancelAnimationFrame(frameNumber)
            frameNumber = requestAnimationFrame(moveCamera)
        },
        rotate({ movementX, movementY }: { movementX: number, movementY: number }) {
            eulers[0] = Math.min(MAX_FOLCRUM, Math.max(-MAX_FOLCRUM, eulers[0] - movementY / MOVEMENT_SCALE));            
            eulers[1] -= (movementX / MOVEMENT_SCALE) % FULL_CIRCLE;
            setMovement();
        },
        reset() {
            eulers.fill(0)
            setMovement();
        }
    }

    return { uniBuffer, camera };
}