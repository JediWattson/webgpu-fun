import { mat4, vec3 } from "gl-matrix";

export function Deg2Rad(theta: number) : number {
    return theta * Math.PI / 180;
}

export default function initCamera(device: GPUDevice) {
    const MOVEMENT_SCALE = 5;
    const FULL_CIRCLE = 360;
    const MOVEMENT_DIFF = 0.05;
    const MAX_FOLCRUM = 89;

    let frameNumber: number
    const keysDown: { [key: string]: number } = {}
    const eulers = [0, 0];

    const uniBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const position: vec3 = [-2, 0, 0.5];
    const forwards = vec3.create();
    const up = vec3.create();
    const side = vec3.create();
    const target = vec3.create();
    const view = mat4.create();
    const projection = mat4.create();

    mat4.perspective(projection,  (2 * Math.PI) / MOVEMENT_SCALE, 1, 0.1, 10);
    device.queue.writeBuffer(uniBuffer, 64, <ArrayBuffer>projection);

    function setMovement() {
        vec3.copy(forwards, [
            Math.cos(Deg2Rad(eulers[1])) * Math.cos(Deg2Rad(eulers[0])),
            Math.sin(Deg2Rad(eulers[1])) * Math.cos(Deg2Rad(eulers[0])),
            Math.sin(Deg2Rad(eulers[0]))
        ])        
        vec3.cross(side, forwards, [0,0,1]);
        vec3.cross(up, side, forwards);
        vec3.add(target, position, forwards);
        mat4.lookAt(view, position, target, up);
        device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>view);
    }    

    function handleDiff(direction: string[], vector: vec3) {        
        if (direction.every(k => !(k in keysDown))) return;

        let diff = MOVEMENT_DIFF
        if (direction[1] in keysDown || keysDown[direction[0]] > keysDown[direction[1]])
            diff = -MOVEMENT_DIFF

        vec3.scaleAndAdd(
            position, position, 
            vector, diff
        );
    }

    function moveCamera() {
        if (Object.keys(keysDown).length === 0) return;

        handleDiff(['d', 'a'], side)
        handleDiff(['w', 's'], forwards)
 
        setMovement()
        frameNumber = requestAnimationFrame(moveCamera);
    }

    const camera: WebGPUApp.CameraType = {
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