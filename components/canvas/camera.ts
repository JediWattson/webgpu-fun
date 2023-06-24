import { mat4, vec3 } from "gl-matrix";

export function Deg2Rad(theta: number) : number {
    return theta * Math.PI / 180;
}

export function makeCamera(device: GPUDevice, uniBuffer: GPUBuffer) {
    
    const projection = mat4.create();
    mat4.perspective(projection, Math.PI/4, 800/600, 0.1, 10);
    device.queue.writeBuffer(uniBuffer, 128, <ArrayBuffer>projection);

    const eulers = [0, 0, 0];

    const position: vec3 = [-2, 0, 0];
    const up = vec3.create();
    const right = vec3.create();
    const target = vec3.create();
    const view = mat4.create();

    function setMovement() {
        const forwards: vec3 = [
            Math.cos(Deg2Rad(eulers[2])) * Math.cos(Deg2Rad(eulers[1])),
            Math.sin(Deg2Rad(eulers[2])) * Math.cos(Deg2Rad(eulers[1])),
            Math.sin(Deg2Rad(eulers[1]))
        ];
    
        vec3.cross(right, forwards, [0,0,1]);
        vec3.cross(up, right, forwards);
        vec3.add(target, position, forwards);
        mat4.lookAt(view, position, target, up);
        device.queue.writeBuffer(uniBuffer, 64, <ArrayBuffer>view);
    }

    return {
        reset() {
            eulers.forEach((e, i) => {eulers[i] = 0})
            setMovement();
        },
        update({ movementX, movementY }: { movementX: number, movementY: number }) {
            eulers[1] = Math.min(89, Math.max(-89, movementY))            
            eulers[2] -= movementX / 5;
            eulers[2] %= 360;

            setMovement();
        }
    }
}