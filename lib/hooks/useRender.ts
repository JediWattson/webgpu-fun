import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";

import textureShader from '../shaders/texture.wgsl';
import meshShader from '../shaders/mesh.wgsl';

import { makeQuad, makeTriangle, meshBufferLayout } from "../buffer";
import { CameraType } from "../camera";
import makeMaterial from "../material";

import { 
    CanvasRefType, 
    PipelineType, 
    makeBindGroup, 
    makeCamera, 
    makeDepthStencil, 
    updateFloor, 
    updateTriangles 
} from "../utils";

function startPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline,
    objectBindGroup: GPUBindGroup,
    pipelines: PipelineType[], 
): () => void {
    const depthStencilAttachment = makeDepthStencil(device);

    const triangleMaterial = pipelines[1].material;
    updateTriangles(triangleMaterial);
    updateFloor(pipelines[0].material);
    let frameId: number;
    function frame() {
    
        updateTriangles(triangleMaterial);
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
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, objectBindGroup);

        let objectCount = 0
        pipelines.forEach(({ bindGroup, material }, i) => {
            passEncoder.setVertexBuffer(0, material.buffer);
            // passEncoder.setBindGroup(1, bindGroup);            
            const currentCount = material.getCount();
            passEncoder.draw( i === 0 ? 6 : 3, currentCount, 0, objectCount);    
            objectCount += currentCount
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

        const triangleCount = 4;
        const floorCount = 1;
        const objectBuffer = device.createBuffer({
            size: 64 * 4 * (triangleCount + floorCount),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })    
                
        const floorMesh = makeQuad(device, objectBuffer);
        floorMesh.makeObjects(floorCount, true);
        const floorTexture = await makeMaterial(device, 'floor.jpeg')

        const triangleMesh = makeTriangle(device, objectBuffer, floorMesh.getCount());
        triangleMesh.makeObjects(triangleCount);
        
        const objectBindGroup = makeBindGroup(device, [cameraBuffer, objectBuffer]);
        
        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [objectBindGroup.bindGroupLayout]
        })
    
        const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            depthStencil: {
                format: "depth32float",
                depthWriteEnabled: true,
                depthCompare: "less-equal"
            },
            vertex: {
                entryPoint: "vs_main",
                module: device.createShaderModule({
                    code: meshShader
                }),
                buffers: [meshBufferLayout]
            },
            fragment: {
                entryPoint: "fs_main",
                module: device.createShaderModule({
                    code: meshShader
                }),
                targets: [{ format }]
            },
            primitive : {
                topology : "triangle-list"
            },
        })

        cleanup.current = startPipeline(
            device, 
            context, 
            pipeline,
            objectBindGroup.bindGroup,
            [{ ...floorTexture, material: floorMesh }, { material: triangleMesh }]

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