import { useEffect, useRef, useState } from "react";

import initCamera from "../camera";
import { runPipeline } from "../pipline";
import { makeMeshPipeline } from "../mesh";
import { makeTexturePipeline } from "../texture";

import { makeQuad, makeTriangle } from "../buffer";
import { updateFloor, updateTriangles } from "../utils";

const floorCount = 40
const triangleCount = 40;

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
        
        const meshOpts = { 
            device, 
            cameraBuffer, 
            bufferSize: 64 * floorCount, 
            bufferCb: (buffer: GPUBuffer) => {
                const triangleMesh = makeTriangle(device, buffer);
                triangleMesh.makeObjects(triangleCount);
                updateTriangles(triangleMesh);
                return triangleMesh
            } 
        }

        const textureOpts = { 
            device, 
            cameraBuffer, 
            texturePath: 'floor.jpeg', 
            bufferSize: 64 * (1 + (floorCount*2))**2, 
            bufferCb: (buffer: GPUBuffer) => {
                const floorMesh = makeQuad(device, buffer);
                floorMesh.makeObjects(floorCount, true);
                updateFloor(floorMesh);  
                return floorMesh      
            } 
        }

        const texturePipeline = await makeTexturePipeline(textureOpts);
        const meshPipeline = makeMeshPipeline(meshOpts);

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