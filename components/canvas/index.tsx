'use client'

import { useRef } from "react";
import useRender from "@/lib/hooks/useRender";
import example from "@/lib/example";

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useRender(canvasRef, example as Partial<WebGPUApp.BufferPipelineType>[])
    return <canvas ref={canvasRef} tabIndex={0} />
}

export default Canvas;