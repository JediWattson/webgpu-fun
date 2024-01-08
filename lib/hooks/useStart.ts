import { useEffect, useRef, useState } from "react";

import initCamera from "../camera";
import { runPipeline } from "../pipline";
import { makeMeshPipeline } from "../mesh";
import { makeTexturePipeline } from "../texture";

export function useStart(context: GPUCanvasContext){
    const cleanupRef = useRef(() => {})
    const [camera, setCamera] = useState<WebGPUApp.CameraType>()
    const init = async () => {        
        const adapter = await navigator.gpu?.requestAdapter();
        if (!adapter) return;

        const device = await adapter.requestDevice();
        const format = navigator.gpu.getPreferredCanvasFormat();
        
        context.configure({
          device,
          format,
          alphaMode: 'opaque',
        });

        const { uniBuffer: cameraBuffer, camera: initCam } = initCamera(device)
        setCamera(initCam)
        
        const meshPipeline = makeMeshPipeline(device, cameraBuffer);
        const texturePipeline = await makeTexturePipeline(device, cameraBuffer);

        cleanupRef.current = runPipeline(
            device, 
            context, 
            [meshPipeline, texturePipeline]
        );
    }
    
    useEffect(() => {
        if (!context) return;
        init();
        return cleanupRef.current
    }, [context])
    
    return camera
}