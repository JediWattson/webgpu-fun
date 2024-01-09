
declare module '*.wgsl' {
    const shader: string;
    export default shader;
}

namespace WebGPUApp {
    export type CreateModelType = (pos: vec3) => mat4
    export type MakeMaterialType = Promise<MaterialType & BindGroupType>
    export type MaterialType = { 
        texture: GPUTexture 
    }

    export type RunPipelineOptsType = {
        depthStencil: { view: GPUTextureViewDescriptor, texture: GPUTextureDescriptor },
        depthStencilAttachment: Partial<GPURenderPassDepthStencilAttachment>,
        colorAttachments: Partial<GPURenderPassColorAttachment>[]
    }    
    
    export type MaterialOptsType = { 
        materialUrl: string,
        textureDescriptor: Partial<GPUTextureDescriptor>, 
        viewDescriptor: GPUTextureViewDescriptor, 
        samplerDescriptor: GPUSamplerDescriptor, 
        bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor 
    }

    export type BufferPipelineType = {
        texturePipelineOpts?: MaterialOptsType,
        bindGroupLayoutOpts: GPUBindGroupLayoutEntry[],
        renderPipelineOpts: {
            shader: string,
            vertexBufferLayout: GPUVertexBufferLayoutDescriptor[]
        },
        device: GPUDevice, 
        cameraBuffer: GPUBuffer,
        bufferSize: number,
        bufferCb: (device: GPUDevice, buffer: GPUBuffer) => MaterialBufferType
    }
    
    
    export type CameraType = { 
        reset: () => void, 
        move: (key: string, isUpPress?: boolean) => void, 
        rotate: (e: MouseEvent) => void 
    }

    export type MaterialBufferType = { 
        verts: number,
        buffer: GPUBuffer,
        update: (createModel: CreateModelType) => void, 
        makeObjects: (objs: vec3[]) => void,
        updateMaterial?: (mesh: MaterialBufferType) => void,
        getCount: () => number 
    }

    export type BindGroupType = { 
        bindGroup: GPUBindGroup, 
        bindGroupLayout: GPUBindGroupLayout 
    }

    export type PipelineType = { 
        material: MaterialBufferType, 
        pipeline: GPURenderPipeline, 
        bindGroups: GPUBindGroup[] 
    }

    export type MakeEventsType = { event: string, cb: (e: Event) => void }[]

}