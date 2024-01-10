import { mat4 } from "wgpu-matrix";

export function updateFloor(floorTexture) {
    floorTexture.update(pos => mat4.translation(pos))
}

let t = 0.0
export function updateTriangles(triangleMesh) {
    t += 0.01
    if (t > 2.0 * Math.PI) {
        t -= 2.0 * Math.PI;
    }

    triangleMesh.update(pos => {
        const model = mat4.create();
        mat4.translation(pos, model);        
        return mat4.rotateZ(model, t);
    });
}