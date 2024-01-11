import { useEffect, useRef } from "react";

import loadAssets from "../loadAssets";
import makeKeyboardEvents from "../events/keyboard";
import makeGamepadHandler from "../events/gamepad";
import { WebGPUFun } from "../types";


function useRender(canvasRef: { current: HTMLCanvasElement | null }, assets: Partial<WebGPUFun.BufferPipelineType>[]) { 
    const cleanupRef = useRef<() => void>(() => {});   
    const handleLoad = async () => {
        if (canvasRef.current === null) return;

        const ref = canvasRef.current 
        const context = ref.getContext('webgpu') as GPUCanvasContext;
        const scene = await loadAssets(context, assets);
        if (!scene) return;

        const { camera, cleanupScene } = scene;
        const cleanupEvents = makeKeyboardEvents(ref, camera);
        makeGamepadHandler(camera);
        cleanupRef.current = () => {
            cleanupScene();
            cleanupEvents()
        };
    }

    useEffect(() => {
        handleLoad();
        return () => cleanupRef.current();
    }, [canvasRef])
}

export default useRender;