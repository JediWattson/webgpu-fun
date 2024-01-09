import { makeAssetBuffer } from 'webgpu-fun'

// each point contains 3 position values, 3 color values
export const makeTriangle = makeAssetBuffer([
    0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
    0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
    0.0,  0.5, -0.5, 0.0, 0.0, 1.0
], 3)

// each point contains 3 position values, 2 texture pos values
export const makeQuad = makeAssetBuffer([
    -0.5,  0.5, 0.0, 1.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 1.0,
     0.5, -0.5, 0.0, 0.0, 1.0,

     0.5, -0.5, 0.0, 0.0, 1.0,
     0.5,  0.5, 0.0, 0.0, 0.0,
    -0.5,  0.5, 0.0, 1.0, 0.0,
], 6)
