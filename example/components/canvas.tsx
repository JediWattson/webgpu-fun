'use client'

import { useRef } from "react";
import { useRender } from "webgpu-fun";
import example from "../lib/example";

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useRender(canvasRef, example)
    return <canvas ref={canvasRef} tabIndex={0} />
}

export default Canvas;