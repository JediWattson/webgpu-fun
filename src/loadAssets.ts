import initCamera from "./camera";
import { makePipeline, runPipeline } from "./pipline";
import { bindGroupLayoutOpts, runPipelineOpts, makeTextureOpts } from "./config";

export default async function loadAssets(contextRef: GPUCanvasContext, assets: Partial<WebGPUFun.BufferPipelineType>[]){
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return;

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    contextRef.configure({ device, format, alphaMode: 'opaque' });

    const { uniBuffer: cameraBuffer, camera } = initCamera(device)
    const pipelines: WebGPUFun.PipelineType[] = await Promise.all(assets.map((opts) => {
        const assetOpts = { ...opts, cameraBuffer, device, bindGroupLayoutOpts } as WebGPUFun.BufferPipelineType
        if (opts.texturePipelineOpts) {
            assetOpts.texturePipelineOpts = makeTextureOpts(opts.texturePipelineOpts)
        }
        return makePipeline(assetOpts)
    }))

    const cleanup = runPipeline(
        device, 
        contextRef, 
        pipelines,
        runPipelineOpts
    );
    
    return { camera, cleanup }
}