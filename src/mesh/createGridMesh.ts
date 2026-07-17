import type { DeformMesh, MeshVertex } from "../types";

function stablePhase(row: number, col: number) {
  const value = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
  return (value - Math.floor(value)) * Math.PI * 2;
}

export function createGridMesh(
  imageWidth: number,
  imageHeight: number,
  cols = window.innerWidth < 720 ? 44 : 64,
  rows = window.innerWidth < 720 ? 44 : 64,
): DeformMesh {
  const vertices: MeshVertex[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const v = row / rows;
      const x = u * imageWidth;
      const y = v * imageHeight;
      vertices.push({
        baseX: x,
        baseY: y,
        x,
        y,
        u,
        v,
        weight: 0,
        phase: stablePhase(row, col),
        velocityX: 0,
        velocityY: 0,
        offsetX: 0,
        offsetY: 0,
      });
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const a = row * (cols + 1) + col;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  return { cols, rows, vertices, indices };
}
