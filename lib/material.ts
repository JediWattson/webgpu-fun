
export type MaterialType = { 
    bindGroup: GPUBindGroup,
    bindGroupLayout: GPUBindGroupLayout,
    texture: GPUTexture 
}

export default async function makeMaterial(device: GPUDevice, url: string): Promise<MaterialType>  {
    const response: Response = await fetch(url);
    const blob: Blob = await response.blob();
    const imageData: ImageBitmap = await createImageBitmap(blob);

    const viewDescriptor: GPUTextureViewDescriptor = {
        format: "bgra8unorm",
        dimension: "2d",
        aspect: "all",
        baseMipLevel: 0,
        mipLevelCount: 1,
        baseArrayLayer: 0,
        arrayLayerCount: 1
    };

    const textureDescriptor: GPUTextureDescriptor = {
        size: {
            width: imageData.width,
            height: imageData.height
        },        
        format: "bgra8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    };

    const texture = device.createTexture(textureDescriptor);
    const view = texture.createView(viewDescriptor);

    device.queue.copyExternalImageToTexture(
        { source: imageData },
        { texture: texture },
        textureDescriptor.size
    );

    const samplerDescriptor: GPUSamplerDescriptor = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "nearest",
        mipmapFilter: "nearest",
        maxAnisotropy: 1
    }

    const sampler = device.createSampler(samplerDescriptor);    

    const bindGroupLayout = device.createBindGroupLayout({
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
    })

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: view
        },
        {
            binding: 1,
            resource: sampler
        }]
    })

    return {
        texture,
        bindGroup,
        bindGroupLayout
    }
}