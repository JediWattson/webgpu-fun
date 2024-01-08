'use client'

import { useState } from "react";
import useRender from "@/lib/hooks/useRender";

function Canvas() {
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>()
    useRender(canvasRef)

    return <canvas ref={ref => ref && setCanvasRef(ref)} tabIndex={0} />
}

export default Canvas;