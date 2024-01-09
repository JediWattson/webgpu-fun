export default async function makeTexture(
    device: GPUDevice, 
    opts: WebGPUFun.TextureOptsType
): Promise<WebGPUFun.MakeMaterialType> {
    const { textureDescriptor, viewDescriptor, samplerDescriptor, bindGroupLayoutDescriptor, materialUrl } = opts
    const response: Response = await fetch(materialUrl);
    const blob: Blob = await response.blob();
    const imageData: ImageBitmap = await createImageBitmap(blob);

    textureDescriptor.size = {
        width: imageData.width,
        height: imageData.height
    }
    const texture = device.createTexture(textureDescriptor as GPUTextureDescriptor);;

    device.queue.copyExternalImageToTexture(
        { source: imageData },
        { texture: texture },
        textureDescriptor.size
    );

    const sampler = device.createSampler(samplerDescriptor);    
    const bindGroupLayout = device.createBindGroupLayout(bindGroupLayoutDescriptor)

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: texture.createView(viewDescriptor)
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