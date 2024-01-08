import { useEffect, useRef, useState } from "react";

import textureShader from '../shaders/texture.wgsl';
import meshShader from '../shaders/mesh.wgsl';

import { runPipeline, makePipeline } from "../pipline";
import makeMaterial from "../material";

import {
    makeBindGroup, 
    makeCamera, 
    updateFloor, 
    updateTriangles 
} from "../utils";

import { 
    makeQuad, 
    makeTriangle, 
    meshBufferLayout, 
    textureBufferLayout 
} from "../buffer";

const triangleCount = 40;
const floorCount = 10;

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

        const { cameraBuffer, camera: initCamera } = makeCamera(device)
        setCamera(initCamera)

        const meshBuffer = device.createBuffer({
            size: 64 * triangleCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })    

        const triangleMesh = makeTriangle(device, meshBuffer);
        triangleMesh.makeObjects(triangleCount);
        updateTriangles(triangleMesh);

        const meshBindGroup = makeBindGroup(device, [cameraBuffer, meshBuffer]);
        const pipeline = makePipeline(
            device,
            meshShader, 
            meshBufferLayout,
            [meshBindGroup],
            [triangleMesh]
        );

        const textureBuffer = device.createBuffer({
            size: 64 * (1 + (floorCount*2))**2,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })    

        const floorMesh = makeQuad(device, textureBuffer);
        floorMesh.makeObjects(floorCount, true);
        updateFloor(floorMesh);

        const floorTexture = await makeMaterial(device, 'floor.jpeg')
        const textureBindGroup = makeBindGroup(device, [cameraBuffer, textureBuffer]);

        const texturePipeline = makePipeline(
            device, 
            textureShader, 
            textureBufferLayout,
            [textureBindGroup, floorTexture], 
            [floorMesh]
        );
        
        cleanupRef.current = runPipeline(
            device, 
            context, 
            [pipeline, texturePipeline]
        );
    }
    
    useEffect(() => {
        if (!context) return;
        init();
        return cleanupRef.current
    }, [context])
    
    return camera
}