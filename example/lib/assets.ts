'use client';

// each point contains 3 position values, 3 color values
const triangeVert = [
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0
]

// each point contains 3 position values, 2 texture pos values
const quadVert = [
    -0.5,  0.5, 0.0, 1.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 1.0,
     0.5, -0.5, 0.0, 0.0, 1.0,

     0.5, -0.5, 0.0, 0.0, 1.0,
     0.5,  0.5, 0.0, 0.0, 0.0,
    -0.5,  0.5, 0.0, 1.0, 0.0,
]

import { makeAssetBuffer } from 'webgpu-fun'

const makeTriangle = makeAssetBuffer(triangeVert, 3)
const makeQuad = makeAssetBuffer(quadVert, 6)
export { makeQuad, makeTriangle }