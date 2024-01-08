import { mat4, vec3 } from "gl-matrix";

export function Deg2Rad(theta: number) : number {
    return theta * Math.PI / 180;
}

export default function initCamera(device: GPUDevice) {
    const uniBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const projection = mat4.create();
    mat4.perspective(projection,  (2 * Math.PI) / 5, 1, 0.1, 10);
    device.queue.writeBuffer(uniBuffer, 64, <ArrayBuffer>projection);
    
    const position: vec3 = [-2, 0, 0.5];
    const forwards = vec3.create();
    const up = vec3.create();
    const right = vec3.create();
    const target = vec3.create();
    const view = mat4.create();

    const maxFolcrum = 89
    const moveDiff = 0.05
    let frameNumber: number
    const keysDown: { [key: string]: number } = {}
    const eulers = [0, 0];

    function setMovement() {
        vec3.copy(forwards, [
            Math.cos(Deg2Rad(eulers[1])) * Math.cos(Deg2Rad(eulers[0])),
            Math.sin(Deg2Rad(eulers[1])) * Math.cos(Deg2Rad(eulers[0])),
            Math.sin(Deg2Rad(eulers[0]))
        ])        
        vec3.cross(right, forwards, [0,0,1]);
        vec3.cross(up, right, forwards);
        vec3.add(target, position, forwards);
        mat4.lookAt(view, position, target, up);
        device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>view);
    }    

    function moveCamera() {
        if (['w', 's'].some(k => k in keysDown)) {
            let vert = moveDiff
            if ('s' in keysDown || keysDown.s > keysDown.w) vert = -moveDiff

            vec3.scaleAndAdd(
                position, position, 
                forwards, vert
            );
        } 

        if (['a', 'd'].some(k => k in keysDown)) {
            let hor = moveDiff
            if ('a' in keysDown || keysDown.a > keysDown.d) hor = -moveDiff
            
            vec3.scaleAndAdd(
                position, position, 
                right, hor
            );    
        }
        
        if (Object.keys(keysDown).length === 0) return;

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
            eulers[0] = Math.min(maxFolcrum, Math.max(-maxFolcrum, eulers[0] - movementY / 5))            
            eulers[1] -= movementX / 5;
            eulers[1] %= 360;

            setMovement();
        },
        reset() {
            eulers.forEach((e, i) => {eulers[i] = 0})
            setMovement();
        }
    }

    return { uniBuffer, camera };
}