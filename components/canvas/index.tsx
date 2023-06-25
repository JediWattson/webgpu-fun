'use client'

import { useRef } from "react";
import useRender from "@/lib/hooks/useRender";
import { CanvasRefType } from "@/lib/utils";

function Canvas() {
    const canvasRef = useRef<CanvasRefType>(null);    
    const events = useRender(canvasRef);        

    return (
        <canvas 
            ref={canvasRef} 
            tabIndex={0}
            onKeyDown={events.handleKeyDown}
            onKeyUp={events.handleKeyUp}
            onClick={events.handleClick}  
            onMouseMove={events.handleMouseMove}
            onMouseOut={events.handleMouseOut}
        />
    )
}

export default Canvas;