'use client'

import { useRef } from "react";
import type { CanvasRefType } from "./lib";
import useInit from "./lib";

function Canvas() {
    const canvasRef = useRef<CanvasRefType>(null);    
    useInit(canvasRef);        
    return <canvas ref={canvasRef} />
}

export default Canvas;