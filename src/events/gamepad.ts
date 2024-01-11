import { WebGPUFun } from "../types";

const equ = (x: number) => (Math.abs(x) / (Math.abs(x) + 1)) * 222

const makeGamepadHandler = (camera: WebGPUFun.CameraType) => {
    let lastTime = Date.now();
    function pollGamepad() {
        if (navigator.getGamepads().length === 0) return;
        const gamepad = navigator.getGamepads()[0];       

        const dt = (Date.now() - lastTime) / 100;        
        gamepad?.axes.forEach((a, i) => {
            if (Math.abs(a) < 0.1) return;
            const diff = (a > 0 ? 1 : -1) * dt;
            const dynRot = equ(a)
            if (i === 0) 
                camera.move(diff, true);
            if (i === 1)
                camera.move(-diff);
            if (i === 2)
                camera.rotate({ y: diff * dynRot });
            if (i === 3) 
                camera.rotate({ z: diff * dynRot });
        })
        
        camera.setMovement()
        lastTime = Date.now();
        requestAnimationFrame(() => pollGamepad());
    }
    
    window.addEventListener("gamepadconnected", pollGamepad);
    
}

export default makeGamepadHandler;