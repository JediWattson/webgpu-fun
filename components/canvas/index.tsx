'use client'

import { useRef } from "react";
import type { CanvasRefType } from "./lib";
import useInit from "./lib";

function Canvas() {
    const canvasRef = useRef<CanvasRefType>(null);    
    const events = useInit(canvasRef);        

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