import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";

import textureShader from '../shaders/texture.wgsl';
import meshShader from '../shaders/mesh.wgsl';
import { CameraType } from "../camera";
import makeMaterial from "../material";

import { 
    makeQuad, 
    makeTriangle, 
    meshBufferLayout, 
    textureBufferLayout 
} from "../buffer";

import { 
    CanvasRefType, 
    PipelineType, 
    makeBindGroup, 
    makeCamera, 
    makeDepthStencil, 
    makePipeline, 
    updateFloor, 
    updateTriangles 
} from "../utils";

const triangleCount = 40;
const floorCount = 10;

function startPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelines: PipelineType[]
): () => void {
    const depthStencilAttachment = makeDepthStencil(device);
    
    let frameId: number;
    function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            depthStencilAttachment,
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };
        
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        pipelines.forEach(({ bindGroups, pipeline, materials }) => {
            passEncoder.setPipeline(pipeline);
            bindGroups.forEach((bindGroup, i) => {
                passEncoder.setBindGroup(i, bindGroup);    
            })
            let objectCount = 0
            materials.forEach((material, i) => {
                if (material.type === "TRI") updateTriangles(material);

                passEncoder.setVertexBuffer(0, material.buffer);            
                const currentCount = material.getCount();
                const vertices = material.type === "QUAD" ? 6 : 3;
                passEncoder.draw(vertices, currentCount, 0, objectCount);    
                objectCount += currentCount

            })
        })

        passEncoder.end();
    
        device.queue.submit([commandEncoder.finish()]);
        frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    
    return () => {       
        if (!Number.isInteger(frameId)) return;
        cancelAnimationFrame(frameId);
    };
}

function useRender(canvasRef: { current: CanvasRefType }) {
    const cleanup = useRef(() => {});
    const camera = useRef<CameraType>();
    const init = async () => {        
        if (!canvasRef.current) return;        
        const canvas = canvasRef.current;
        const adapter = await navigator.gpu?.requestAdapter();
        if (!adapter) return;
        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const device = await adapter.requestDevice();
        const format = navigator.gpu.getPreferredCanvasFormat();
        
        context.configure({
          device,
          format,
          alphaMode: 'opaque',
        });

        const cameraBuffer = makeCamera(device, camera)

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
        
        cleanup.current = startPipeline(
            device, 
            context, 
            [pipeline, texturePipeline]
        );
    }
    
    useEffect(() => {
        init();        
        return cleanup.current;
    }, [canvasRef.current])

    return {
        handleKeyDown(e: KeyboardEvent<HTMLCanvasElement>) {
            camera.current?.move(e.key);
        },
        handleKeyUp(e: KeyboardEvent<HTMLCanvasElement>) {
            camera.current?.move(e.key, true);
        },
        handleClick(e: MouseEvent<HTMLCanvasElement>) {
            canvasRef.current?.requestPointerLock();
        },
        handleMouseOut(e: MouseEvent<HTMLCanvasElement>) {
            // camera.current?.reset();
        },
        handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
            if(!document.pointerLockElement) return;
            camera.current?.rotate(e);
        }
    }
}

export default useRender;