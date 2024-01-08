declare module '*.wgsl' {
    const shader: string;
    export default shader;
}

namespace WebGPUApp {
    export type CreateModelType = (pos: vec3, i: number) => mat4
    export type MakeMaterialType = Promise<MaterialType & BindGroupType>
    export type MaterialType = { 
        texture: GPUTexture 
    }
    
    export type CameraType = { 
        reset: () => void, 
        move: (key: string, isUpPress?: boolean) => void, 
        rotate: (e: MouseEvent) => void 
    }

    export type MaterialBufferType = { 
        type: string,
        buffer: GPUBuffer,
        update: (createModel: CreateModelType) => void, 
        makeObjects: (count: number, isFloor?: boolean) => void,
        getCount: () => number 
    }

    export type BindGroupType = { 
        bindGroup: GPUBindGroup, 
        bindGroupLayout: GPUBindGroupLayout 
    }

    export type PipelineType = { 
        materials: MaterialBufferType[], 
        pipeline: GPURenderPipeline, 
        bindGroups: GPUBindGroup[] 
    }

    export type MakeEventsType = { event: string, cb: (e: Event) => void }[]

}