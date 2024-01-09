import { useEffect, useRef, useState } from "react";
import { vec3 } from "gl-matrix";

import initCamera from "../camera";
import { makePipeline, runPipeline } from "../pipline";
import { makeRenderPipelineOpts, runPipelineOpts, bindGroupLayoutOpts, texturePipelineOpts } from "../config";

import textureShader from "../shaders/texture.wgsl";
import meshShader from "../shaders/mesh.wgsl";

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
        
        const textureOpts = { 
            device, 
            cameraBuffer,  
            texturePipelineOpts,
            bindGroupLayoutOpts,
            bufferSize: 64 * (1 + (floorCount*2))**2,
            shader: textureShader,
            renderPipelineOpts: makeRenderPipelineOpts(
                device.createShaderModule({ code: textureShader }), 
                [{
                    arrayStride: 20,
                    attributes: [
                        {
                            shaderLocation: 0,
                            format: `float32x3`,
                            offset: 0
                        },
                        {
                            shaderLocation: 1,
                            format: `float32x2`,
                            offset: 12
                        }
                    ]
                }]
            ),
            bufferCb: (buffer: GPUBuffer) => {
                const floorMesh = makeQuad(device, buffer);
                const objects: vec3[] = Array(floorCount**2).fill(0).map((_, i) => [i%floorCount, Math.floor(i/floorCount), -1]);
                floorMesh.makeObjects(objects);
                updateFloor(floorMesh);  
                return floorMesh      
            } 
        }

        const meshOpts = { 
            device, 
            cameraBuffer,
            bindGroupLayoutOpts,
            bufferSize: 64 * floorCount,
            renderPipelineOpts: makeRenderPipelineOpts(
                device.createShaderModule({ code: meshShader }), 
                [{
                    arrayStride: 24,
                    attributes: [
                        {
                            shaderLocation: 0,
                            format: `float32x3`,
                            offset: 0
                        },
                        {
                            shaderLocation: 1,
                            format: `float32x3`,
                            offset: 12
                        }
                    ]
                }]
            ), 
            bufferCb: (buffer: GPUBuffer) => {
                const triangleMesh = makeTriangle(device, buffer);
                const objects: vec3[] = Array(triangleCount).fill(0).map((_, i) => [2, i, -0.5]);
                triangleMesh.makeObjects(objects);
                triangleMesh.updateMaterial = updateTriangles;
                return triangleMesh
            } 
        }

        const texturePipeline = await makePipeline(textureOpts as WebGPUApp.BufferPipelineType);
        const meshPipeline = await makePipeline(meshOpts as WebGPUApp.BufferPipelineType);

        cleanupRef.current = runPipeline(
            device, 
            context, 
            [meshPipeline, texturePipeline],
            runPipelineOpts
        );
    }
    
    useEffect(() => {
        if (!context) return;
        init();
        return cleanupRef.current
    }, [context])
    
    return camera
}