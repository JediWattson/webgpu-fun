'use client'

import { useRef } from "react";
import useRender, { CanvasRefType } from "@/lib/hooks/useRender";

function Canvas() {
    const canvasRef = useRef<CanvasRefType>(null);    
    const events = useRender(canvasRef);        

    return (
        <canvas 
            ref={canvasRef}   
            onClick={events.handleClick}  
            onMouseMove={events.handleMouseMove}
            onMouseOut={events.handleMouseOut}
        />
    )
}

export default Canvas;