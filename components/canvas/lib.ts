import { useEffect, useRef } from "react";

import triangleShader from './triangle-vert.wgsl';
import redFragShader from './red-frag.wgsl';

export type CanvasRefType = HTMLCanvasElement | null;

function startPipeline(device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline): () => void {
    let frameId: number;
    function frame() {        
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
    const init = async () => {        
        if (!canvasRef.current) return;        
        const canvas = canvasRef.current;
        const adapter = await navigator.gpu?.requestAdapter();
        if (!adapter) return;
        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const device = await adapter.requestDevice();

        // const devicePixelRatio = window.devicePixelRatio || 1;
        // canvas.width = canvas.clientWidth * devicePixelRatio;
        // canvas.height = canvas.clientHeight * devicePixelRatio;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
      
        context.configure({
          device,
          format: presentationFormat,
          alphaMode: 'opaque',
        });
        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                entryPoint: "main",
                module: device.createShaderModule({
                    code: triangleShader
                })
            },
            fragment: {
                entryPoint: "main",
                module: device.createShaderModule({
                    code: redFragShader
                }),
                targets: [{
                    format: presentationFormat
                }]
            },
        })
        cleanup.current = startPipeline(device, context, pipeline);
    }
    
    useEffect(() => {
        init();        
        return cleanup.current;
    }, [canvasRef.current])
}

export default useInit;