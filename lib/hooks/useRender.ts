import { useEffect, useRef } from "react";
import { makeEvents } from "../utils";
import loadAssets from "../loadAssets";

function useRender(canvasRef: { current: HTMLCanvasElement | null }, assets: Partial<WebGPUApp.BufferPipelineType>[]) { 
    const cleanupRef = useRef<() => void>(() => {});   
    const handleLoad = async () => {
        if (canvasRef.current === null) return;

        const ref = canvasRef.current 
        const context = ref.getContext('webgpu') as GPUCanvasContext;
        const obj = await loadAssets(context, assets);
        if (!obj) return;

        const { camera, cleanup } = obj;
        const events = makeEvents(ref, camera);

        events.forEach(
            ({ event: ev, cb }) => ref.addEventListener(ev, cb)
        )
        
        cleanupRef.current = () => {
            cleanup();
            events.forEach(
                ({ event: ev, cb }) => ref.removeEventListener(ev, cb)
            )
        };

    }

    useEffect(() => {
        handleLoad();
        return () => cleanupRef.current();
    }, [canvasRef])
}

export default useRender;