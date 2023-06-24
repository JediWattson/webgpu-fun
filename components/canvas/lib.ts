import { useEffect, useRef } from "react";

import fragmentShader from './fragment.wgsl'
import { makeBuffer } from "./buffer";
import { mat4 } from "gl-matrix";

export type CanvasRefType = HTMLCanvasElement | null;

function startPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline, 
    bindGroup: GPUBindGroup,
    triangleTexture: GPUBuffer,
    uniBuffer: GPUBuffer
): () => void {
    let frameId: number;
    let t: number = 0.0
    function frame() {     

        t += 0.01
        if (t > 2.0 * Math.PI) {
            t -= 2.0 * Math.PI;
        }

        //make transforms
        const projection = mat4.create();
        // load perspective projection into the projection matrix,
        // Field of view = 45 degrees (pi/4)
        // Aspect ratio = 800/600
        // near = 0.1, far = 10 
        mat4.perspective(projection, Math.PI/4, 800/600, 0.1, 10);

        const view = mat4.create();
        //load lookat matrix into the view matrix,
        //looking from [-2, 0, 2]
        //looking at [0, 0, 0]
        //up vector is [0, 0, 1]
        mat4.lookAt(view, [-2, 0, 2], [0, 0, 0], [0, 0, 1]);

        const model = mat4.create();
        //Store, in the model matrix, the model matrix after rotating it by t radians around the z axis.
        //(yeah, I know, kinda weird.)
        mat4.rotate(model, model, t, [0,0,1]);
        

        // TODO - I'd like to use this, but how?
        // const projection = mat4.perspective(Math.PI / 4, 7/6, 0.1, 10);
        // const view = mat4.lookAt([-2, 0, 2], [0, 0, 0], [0, 0, 1]);
        // let model = mat4.create()
        // mat4.rotate(model, [0, 0, 1], t, model);
        
        device.queue.writeBuffer(uniBuffer, 0, <ArrayBuffer>model);
        device.queue.writeBuffer(uniBuffer, 64, <ArrayBuffer>view);
        device.queue.writeBuffer(uniBuffer, 128, <ArrayBuffer>projection);

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
        passEncoder.setVertexBuffer(0, triangleTexture);
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
    const uniBuffer = useRef<GPUBuffer>();
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

        const triangleTexture = makeBuffer(device);

        uniBuffer.current = device.createBuffer({
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

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
                        buffer: uniBuffer.current
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
                buffers: [triangleTexture.bufferLayout]
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
            triangleTexture.buffer, 
            uniBuffer.current,

        );
    }
    
    useEffect(() => {
        init();        
        return cleanup.current;
    }, [canvasRef.current])
}

export default useInit;