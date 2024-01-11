import type { WebGPUFun } from "../types";

const MOVEMENT_DIFF = 0.01;

const handleKeys = (camera: WebGPUFun.CameraType) => {
    camera.setMovement()
    let frameId: number | null = null;
    const strife: string[] = []
    const forward: string[] = []
    return (key: string, isUpPress?: boolean) => {
        if (!['w', 'a', 's', 'd'].includes(key)) return
        const isStrife = ['a', 'd'].includes(key)

        if (isUpPress) {            
            if (isStrife && strife.includes(key))
                strife.splice(strife.indexOf(key), 1)
            else if(!isStrife && forward.includes(key))
                forward.splice(forward.indexOf(key), 1)

            if (forward.length === 0 && strife.length === 0 && frameId !== null) {
                cancelAnimationFrame(frameId)
                frameId = null;
            }
            return;
        }
        
        if (isStrife && !strife.includes(key)) strife.unshift(key)
        else if(!isStrife && !forward.includes(key)) forward.unshift(key)

        let lastTime = Date.now()
        const onKey = () => {
            const dx = Date.now() - lastTime
            if (strife.length > 0) {
                const diff = strife[0] === 'd' ? MOVEMENT_DIFF : -MOVEMENT_DIFF
                camera.move(diff*dx, true)
            }

            if (forward.length > 0) {
                const diff = forward[0] === 'w' ? MOVEMENT_DIFF : -MOVEMENT_DIFF
                camera.move(diff*dx)
            }

            camera.setMovement()
            lastTime = Date.now()
            frameId = requestAnimationFrame(onKey)
        }

        if (frameId === null) 
            frameId = requestAnimationFrame(onKey)
    }
}

const makeGamePadeEvents = (init: () => void, cleanup: () => void) => {
    const events = [
        { event: 'gamepadconnected', cb: cleanup },
        { event: 'gamepaddisconnected', cb: init }
    ] as WebGPUFun.MakeEventsType

    init()
    events.forEach(
        ({ event: ev, cb }) => window.addEventListener(ev, cb)
    )
}

const makeKeyboardEvents = (canvas: HTMLCanvasElement, camera: WebGPUFun.CameraType) => {
    const handleKey = handleKeys(camera)
    const events = [
        { event: 'keydown', cb: e => handleKey((e as KeyboardEvent).key) },
        { event: 'keyup', cb: e => handleKey((e as KeyboardEvent).key, true) },
        { event: 'click', cb: () => canvas.requestPointerLock() },
        { event: 'mouseout', cb: () => camera.reset() },
        { event: 'mousemove', cb: e => {
            if(!document.pointerLockElement) return;
            const { movementX: y, movementY: z } = e as MouseEvent;
            camera.rotate({ y, z });
            camera.setMovement()
        }}
    ] as WebGPUFun.MakeEventsType


    const init = () => events.forEach(
        ({ event: ev, cb }) => canvas.addEventListener(ev, cb)
    )
    
    const cleanup = () => {
        events.forEach(
            ({ event: ev, cb }) => canvas.removeEventListener(ev, cb)
        )
    }

    makeGamePadeEvents(init, cleanup)

    return cleanup
}

export default makeKeyboardEvents;