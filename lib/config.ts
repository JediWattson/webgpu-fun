export const texturePipelineOpts = {
    materialUrl: 'floor.jpeg',
    viewDescriptor: {
        format: "bgra8unorm",
        dimension: "2d",
        aspect: "all",
        baseMipLevel: 0,
        mipLevelCount: 1,
        baseArrayLayer: 0,
        arrayLayerCount: 1
    },
    textureDescriptor: {     
        format: "bgra8unorm" as GPUTextureFormat,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    },
    samplerDescriptor: {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "nearest",
        mipmapFilter: "nearest",
        maxAnisotropy: 1
    },
    bindGroupLayoutDescriptor: {
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            }    
        ]
    }
}

export const bindGroupLayoutOpts: GPUBindGroupLayoutEntry[] = [
    {
        // perspective
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'uniform' }
    },
    {
        // object position
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage", hasDynamicOffset: false }
    }
]

export const runPipelineOpts: WebGPUApp.RunPipelineOptsType = {
    depthStencil: {
        view: { format: "depth32float" as GPUTextureFormat },
        texture: {
            size: {
                width: 300,
                height: 150,
                depthOrArrayLayers: 1
            },
            format: "depth32float" as GPUTextureFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }
    },
    depthStencilAttachment: {
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
    },
    colorAttachments: [
        {
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
        },
    ]
}


export const renderPipelineOpts = {
    depthStencil: {
        format: "depth32float",
        depthWriteEnabled: true,
        depthCompare: "less-equal"
    },
    vertex: { entryPoint: "vs_main" },
    fragment: {
        entryPoint: "fs_main",
        targets: [{ format: "bgra8unorm" }]
    },
    primitive : {
        topology : "triangle-list"
    },
}

export function makeRenderPipelineOpts(module: GPUShaderModule, buffers: GPUVertexBufferLayout[]) {
    return {
        ...renderPipelineOpts,
        fragment: { ...renderPipelineOpts.fragment, module },
        vertex: { ...renderPipelineOpts.vertex, module, buffers }
    } as Partial<GPURenderPipelineDescriptor>
}