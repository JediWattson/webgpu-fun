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

    let movement: boolean = false;
    const keysDown = { forward: 0, right: 0 }
    function moveCamera() {
        let moved = false
        if (keysDown.forward !== 0) {
            moved = true
            vec3.scaleAndAdd(
                position, position, 
                forwards, keysDown.forward
            );
        } 

        if (keysDown.right !== 0) {
            moved = true
            vec3.scaleAndAdd(
                position, position, 
                right, keysDown.right
            );    
        }

        if (!moved) return;
        
        setMovement()

        if (movement)
            requestAnimationFrame(moveCamera);
    }


    const maxFolcrum = 89
    const moveDiff = 0.02

    const camera: WebGPUApp.CameraType = {
        reset() {
            eulers.forEach((e, i) => {eulers[i] = 0})
            setMovement();
        },
        move(key, isUpPress = false) {            
            if (isUpPress) {
                if (["w", "s"].includes(key)) {
                    keysDown.forward = 0;
                } else if (["a", "d"].includes(key)) {
                    keysDown.right = 0;
                }
                
                movement = Object.values(keysDown).some(v => v !== 0);
                return;
            }

            switch (key) {
                case "w":
                    keysDown.forward = moveDiff;
                    break;
                case "s":
                    keysDown.forward = -moveDiff;
                    break;
                case "a":
                    keysDown.right = -moveDiff;
                    break;
                case "d":
                    keysDown.right = moveDiff;
                    break;
            }
            if (!movement) {
                movement = true
                requestAnimationFrame(moveCamera)
            }
        },
        rotate({ movementX, movementY }: { movementX: number, movementY: number }) {
            eulers[0] = Math.min(maxFolcrum, Math.max(-maxFolcrum, eulers[0] - movementY / 5))            
            eulers[1] -= movementX / 5;
            eulers[1] %= 360;

            setMovement();
        }
    }

    return { uniBuffer, camera };
}