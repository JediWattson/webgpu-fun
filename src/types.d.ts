import { Mat4, Vec3 } from "wgpu-matrix"

declare namespace WebGPUFun {
    
    type MakeMaterialType = Promise<MaterialType & BindGroupType>
    type CreateModelType = (pos: Vec3) => Mat4
    type MakeEventsType = { event: string, cb: (e: Event) => void }[]

    interface MaterialType { texture: GPUTexture }
    
    interface RunPipelineOptsType {
        depthStencil: { view: GPUTextureViewDescriptor, texture: GPUTextureDescriptor };
        depthStencilAttachment: Partial<GPURenderPassDepthStencilAttachment>;
        colorAttachments: Partial<GPURenderPassColorAttachment>[];
    }
    
    interface TextureOptsType { 
        materialUrl: string;
        textureDescriptor: Partial<GPUTextureDescriptor>;
        viewDescriptor: GPUTextureViewDescriptor;
        samplerDescriptor: GPUSamplerDescriptor;
        bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor;
    }
    
    interface renderPipelineOptsType {
        shader: string;
        vertexBufferLayout: GPUVertexBufferLayout[];
    }
    
    interface BufferPipelineType {
        isTexture?: boolean;
        texturePipelineOpts?: TextureOptsType;
        bindGroupLayoutOpts: GPUBindGroupLayoutEntry[];
        renderPipelineOpts: renderPipelineOptsType;
        device: GPUDevice;
        cameraBuffer: GPUBuffer;
        bufferSize: number;
        bufferCb: (device: GPUDevice, buffer: GPUBuffer) => AssetBufferType;
    }
    
    interface CameraType {
        reset: () => void;
        move: (key: string, isUpPress?: boolean) => void;
        rotate: (e: MouseEvent) => void;
    }
    
    interface AssetBufferType {
        verts: number;
        buffer: GPUBuffer;
        update: (createModel: CreateModelType) => void;
        makeObjects: (objs: Vec3[]) => void;
        updateMaterial?: (mesh: AssetBufferType) => void;
        getCount: () => number;
    }
    
    interface BindGroupType {
        bindGroup: GPUBindGroup;
        bindGroupLayout: GPUBindGroupLayout;
    }
    
    interface PipelineType {
        material: AssetBufferType;
        pipeline: GPURenderPipeline;
        bindGroups: GPUBindGroup[];
    }
}    