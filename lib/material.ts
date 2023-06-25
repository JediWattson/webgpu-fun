

export default async function makeMaterial(device: GPUDevice, url: string)  {
    const response: Response = await fetch(url);
    const blob: Blob = await response.blob();
    const imageData: ImageBitmap = await createImageBitmap(blob);

    const textureDescriptor: GPUTextureDescriptor = {
        size: {
            width: imageData.width,
            height: imageData.height
        },
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    };

    const texture = device.createTexture(textureDescriptor);
    device.queue.copyExternalImageToTexture(
        { source: imageData },
        { texture },
        textureDescriptor.size
    );

    const viewDescriptor: GPUTextureViewDescriptor = {
        dimension: "2d",
        aspect: "all",
        baseMipLevel: 0,
        mipLevelCount: 1,
        baseArrayLayer: 0,
        arrayLayerCount: 1
    };

    const view = texture.createView(viewDescriptor);

    const samplerDescriptor: GPUSamplerDescriptor = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "nearest",
        mipmapFilter: "nearest",
        maxAnisotropy: 1
    }

    const sampler = device.createSampler(samplerDescriptor);
    
    return {
        texture,
        sampler,
        view
    }
}