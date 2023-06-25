import { MouseEvent, useEffect, useRef } from "react";
import { mat4 } from "gl-matrix";

import { MeshBufferType, makeQuad, makeTriangle } from "../buffer";
import initCamera, { CameraType } from "../camera";

import triangleShader from '../shaders/triangle.wgsl';
import makeMaterial from "../material";

export type CanvasRefType = HTMLCanvasElement | null;

function makeCamera(device: GPUDevice, cameraRef: { current?: CameraType }) {
    const uniBuffer = device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    cameraRef.current = initCamera(device, uniBuffer);
    return uniBuffer;
}

function makeDepthStencil(device: GPUDevice): GPURenderPassDepthStencilAttachment {
    const depthStencilBuffer = device.createTexture({
        size: {
            width: 300,
            height: 150,
            depthOrArrayLayers: 1
        },
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const depthStencilView = depthStencilBuffer.createView({ format: "depth32float" });
    
    return {
        view: depthStencilView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
    };
}

let t = 0.0
function updateTriangles(triangleMesh: MeshBufferType) {
    t += 0.01
    if (t > 2.0 * Math.PI) {
        t -= 2.0 * Math.PI;
    }

    triangleMesh.update((o, i) => {
        const model = mat4.create();
        mat4.translate(model, model, o);
        mat4.rotateZ(model, model, t);
        return model;
    });
}

function startPipeline(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline, 
    bindGroup: GPUBindGroup,
    triangleMesh: MeshBufferType
): () => void {
    
    const depthStencilAttachment = makeDepthStencil(device);

    let frameId: number;
    function frame() {
        updateTriangles(triangleMesh);
        
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
        passEncoder.setVertexBuffer(0, triangleMesh.buffer);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(3, triangleMesh.getCount(), 0, 0);
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

        const uniBuffer = makeCamera(device, camera)

        const objBuffer = device.createBuffer({
            size: 64 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        const triangleMesh = makeTriangle(device, objBuffer);
        triangleMesh.makeObjects(400);

        const quadMesh = makeQuad(device, objBuffer, 400);
    

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage", hasDynamicOffset: false }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]
        })

        const floorMaterial = await makeMaterial(device, 'floor.jpeg')
        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: uniBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: objBuffer
                    }
                },
                {
                    binding: 2,
                    resource: floorMaterial.view
                },
                {
                    binding: 3,
                    resource: floorMaterial.sampler
                },
            ]
        })

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
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
                    code: triangleShader
                }),
                buffers: [triangleMesh.bufferLayout]
            },
            fragment: {
                entryPoint: "fs_main",
                module: device.createShaderModule({
                    code: triangleShader
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
            camera.current?.reset();
        },
        handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
            if(!document.pointerLockElement) return;
            camera.current?.update(e);
        }
    }
}

export default useRender;