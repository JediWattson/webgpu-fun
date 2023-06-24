import { EventHandler, MouseEvent, MouseEventHandler, SyntheticEvent, useEffect, useRef } from "react";

import fragmentShader from './fragment.wgsl'
import { makeTriangle } from "./buffer";
import { mat4 } from "gl-matrix";
import { makeCamera } from "./camera";

export type CanvasRefType = HTMLCanvasElement | null;

function startPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline, 
    bindGroup: GPUBindGroup,
    triangleMesh: { buffer: GPUBuffer, update: () => void }
): () => void {
    let frameId: number;
    let t: number = 0.0
    function frame() {
        triangleMesh.update();
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
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
        passEncoder.setVertexBuffer(0, triangleMesh.buffer);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(3, 1, 0, 0);
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

function useInit(canvasRef: { current: CanvasRefType }) {
    const cleanup = useRef(() => {});
    const camera = useRef({ reset: () => {}, update: (e: MouseEvent) => {} });
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

        const uniBuffer = device.createBuffer({
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        const triangleMesh = makeTriangle(device, uniBuffer);
        camera.current = makeCamera(device, uniBuffer);

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        })

        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: uniBuffer
                    }
                }
            ]
        })

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        })

        const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                entryPoint: "vs_main",
                module: device.createShaderModule({
                    code: fragmentShader
                }),
                buffers: [triangleMesh.bufferLayout]
            },
            fragment: {
                entryPoint: "fs_main",
                module: device.createShaderModule({
                    code: fragmentShader
                }),
                targets: [{ format }]
            }
        })

        cleanup.current = startPipeline(
            device, 
            context, 
            pipeline, 
            bindGroup, 
            triangleMesh
        );
    }
    
    useEffect(() => {
        init();        
        return cleanup.current;
    }, [canvasRef.current])

    return {
        handleClick(e: MouseEvent<HTMLCanvasElement>) {
            canvasRef.current?.requestPointerLock();
        },
        handleMouseOut(e: MouseEvent<HTMLCanvasElement>) {
            camera.current.reset();
        },
        handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
            if(!document.pointerLockElement) return;
            camera.current.update(e);
        }
    }
}

export default useInit;