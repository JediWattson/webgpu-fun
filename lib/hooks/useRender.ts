import { useEffect } from "react";
import { useStart } from "./useStart";
import { makeEvents } from "../utils";

function useRender(canvasRef?: HTMLCanvasElement) {
    const context = canvasRef?.getContext('webgpu') as GPUCanvasContext;
    const camera = useStart(context);

    useEffect(() => {
        if (!camera || !canvasRef) return;   
        const events = makeEvents(canvasRef, camera);
        events.forEach(
            ({ event: ev, cb }) => canvasRef.addEventListener(ev, cb)
        )

        return () => events.forEach(
            ({ event: ev, cb }) => canvasRef.removeEventListener(ev, cb)
        )
    }, [camera, canvasRef])
}

export default useRender;