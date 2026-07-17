import type { DeformMesh, MotionMask } from "../types";
import { sampleMaskArea } from "../mask/maskSampling";
import { clamp } from "../utils/clamp";

export function sampleWeights(mesh: DeformMesh, mask: MotionMask) {
  const radius = Math.max(mask.width / mesh.cols, mask.height / mesh.rows) * 0.5;

  for (const vertex of mesh.vertices) {
    const maskWeight = sampleMaskArea(mask, vertex.baseX, vertex.baseY, radius);
    const edgeDistance = Math.min(
      vertex.baseX,
      vertex.baseY,
      mask.width - vertex.baseX,
      mask.height - vertex.baseY,
    );
    const edgeFade = clamp(edgeDistance / 40, 0, 1);
    vertex.weight = maskWeight * edgeFade;
  }

  smoothWeights(mesh, 3);
}

function smoothWeights(mesh: DeformMesh, passes: number) {
  for (let pass = 0; pass < passes; pass += 1) {
    const next = mesh.vertices.map((vertex) => vertex.weight);

    for (let row = 1; row < mesh.rows; row += 1) {
      for (let col = 1; col < mesh.cols; col += 1) {
        const index = row * (mesh.cols + 1) + col;
        const center = mesh.vertices[index].weight;
        const left = mesh.vertices[index - 1].weight;
        const right = mesh.vertices[index + 1].weight;
        const up = mesh.vertices[index - mesh.cols - 1].weight;
        const down = mesh.vertices[index + mesh.cols + 1].weight;
        next[index] = center * 0.45 + (left + right + up + down) * 0.1375;
      }
    }

    mesh.vertices.forEach((vertex, index) => {
      vertex.weight = next[index];
    });
  }
}
