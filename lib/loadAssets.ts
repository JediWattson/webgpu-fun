import initCamera from "./camera";
import { makePipeline, runPipeline } from "./pipline";
import { runPipelineOpts } from "./config";

export default async function loadAssets(contextRef: GPUCanvasContext, assets: Partial<WebGPUApp.BufferPipelineType>[]){
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return;

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    contextRef.configure({ device, format, alphaMode: 'opaque' });

    const { uniBuffer: cameraBuffer, camera } = initCamera(device)
    const pipelines: WebGPUApp.PipelineType[] = await Promise.all(assets.map((opts) => 
        makePipeline({ ...opts, cameraBuffer, device } as WebGPUApp.BufferPipelineType)
    ))

    const cleanup = runPipeline(
        device, 
        contextRef, 
        pipelines,
        runPipelineOpts
    );
    
    return { camera, cleanup }
}