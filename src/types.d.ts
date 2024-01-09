import { Mat4, Vec3 } from "wgpu-matrix"

declare global {
    export namespace WebGPUFun {
        export type CreateModelType = (pos: Vec3) => Mat4
        export type MaterialType = { 
            texture: GPUTexture 
        }
    
        export type MakeMaterialType = Promise<MaterialType & BindGroupType>
    
        export type RunPipelineOptsType = {
            depthStencil: { view: GPUTextureViewDescriptor, texture: GPUTextureDescriptor },
            depthStencilAttachment: Partial<GPURenderPassDepthStencilAttachment>,
            colorAttachments: Partial<GPURenderPassColorAttachment>[]
        }    
        
        export type TextureOptsType = { 
            materialUrl: string,
            textureDescriptor: Partial<GPUTextureDescriptor>, 
            viewDescriptor: GPUTextureViewDescriptor, 
            samplerDescriptor: GPUSamplerDescriptor, 
            bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor 
        }
    
        export type BufferPipelineType = {
            isTexture?: boolean,
            texturePipelineOpts?: TextureOptsType,
            bindGroupLayoutOpts: GPUBindGroupLayoutEntry[],
            renderPipelineOpts: {
                shader: string,
                vertexBufferLayout: GPUVertexBufferLayout[]
            },
            device: GPUDevice, 
            cameraBuffer: GPUBuffer,
            bufferSize: number,
            bufferCb: (device: GPUDevice, buffer: GPUBuffer) => AssetBufferType
        }
        
        
        export type CameraType = { 
            reset: () => void, 
            move: (key: string, isUpPress?: boolean) => void, 
            rotate: (e: MouseEvent) => void 
        }
    
        export type AssetBufferType = { 
            verts: number,
            buffer: GPUBuffer,
            update: (createModel: CreateModelType) => void, 
            makeObjects: (objs: Vec3[]) => void,
            updateMaterial?: (mesh: AssetBufferType) => void,
            getCount: () => number 
        }
    
        export type BindGroupType = { 
            bindGroup: GPUBindGroup, 
            bindGroupLayout: GPUBindGroupLayout 
        }
    
        export type PipelineType = { 
            material: AssetBufferType, 
            pipeline: GPURenderPipeline, 
            bindGroups: GPUBindGroup[] 
        }
    
        export type MakeEventsType = { event: string, cb: (e: Event) => void }[]
    }
}