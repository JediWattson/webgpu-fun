import initCamera from "./camera";
import { makePipeline, runPipeline } from "./pipline";
import { makeBindGroupLayoutOpts, makeRunPipelineOpts, makeTextureOpts } from "./config";
import type { WebGPUFun } from "./types";

export default async function loadAssets(contextRef: GPUCanvasContext, assets: Partial<WebGPUFun.BufferPipelineType>[]){
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return;

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    contextRef.configure({ device, format, alphaMode: 'opaque' });

    const { uniBuffer: cameraBuffer, camera } = initCamera(device)
    const pipelines: WebGPUFun.PipelineType[] = await Promise.all(assets.map((opts) => {
        const bindGroupLayoutOpts = makeBindGroupLayoutOpts()
        const assetOpts = { ...opts, cameraBuffer, device, bindGroupLayoutOpts } as WebGPUFun.BufferPipelineType
        if (opts.texturePipelineOpts) {
            assetOpts.texturePipelineOpts = makeTextureOpts(opts.texturePipelineOpts)
        }
        return makePipeline(assetOpts)
    }))

    const renderOpts = makeRunPipelineOpts()
    const cleanupScene = runPipeline(
        device, 
        contextRef, 
        pipelines,
        renderOpts
    );
    
    return { camera, cleanupScene }
}