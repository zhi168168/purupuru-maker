import type { DeformMesh, MeshVertex, MotionSettings } from "../types";
import { clamp } from "../utils/clamp";

export function resetMeshMotion(mesh: DeformMesh) {
  for (const vertex of mesh.vertices) {
    vertex.x = vertex.baseX;
    vertex.y = vertex.baseY;
    vertex.offsetX = 0;
    vertex.offsetY = 0;
    vertex.velocityX = 0;
    vertex.velocityY = 0;
  }
}

export function updateMeshPhysics(
  mesh: DeformMesh,
  time: number,
  dt: number,
  settings: MotionSettings,
) {
  const stableDt = Math.min(dt, 1 / 30);
  let width = 0;
  let height = 0;
  for (const vertex of mesh.vertices) {
    width = Math.max(width, vertex.baseX);
    height = Math.max(height, vertex.baseY);
  }
  const cellSize = Math.min(width / mesh.cols, height / mesh.rows);
  const effectiveStrength = Math.min(settings.strength * 0.42, cellSize * 0.9);
  const maxOffset = Math.max(1, Math.min(settings.strength * 0.55, cellSize * 1.15));

  for (const vertex of mesh.vertices) {
    updateVertex(vertex, time, stableDt, settings, {
      width,
      height,
      effectiveStrength,
      maxOffset,
    });
  }
}

type MotionFrame = {
  width: number;
  height: number;
  effectiveStrength: number;
  maxOffset: number;
};

function updateVertex(
  vertex: MeshVertex,
  time: number,
  dt: number,
  settings: MotionSettings,
  frame: MotionFrame,
) {
  const w = vertex.weight;
  if (w <= 0.001 || frame.effectiveStrength <= 0) {
    vertex.offsetX = 0;
    vertex.offsetY = 0;
    vertex.velocityX = 0;
    vertex.velocityY = 0;
    vertex.x = vertex.baseX;
    vertex.y = vertex.baseY;
    return;
  }

  const nx = frame.width > 0 ? vertex.baseX / frame.width : 0;
  const ny = frame.height > 0 ? vertex.baseY / frame.height : 0;
  const spatialPhase =
    settings.randomness *
    (Math.sin(nx * Math.PI * 2.1 + ny * Math.PI * 0.7) +
      Math.cos(ny * Math.PI * 1.8 - nx * Math.PI * 0.4));
  const t = time * settings.speed + spatialPhase;
  const autoX =
    (Math.sin(t * 1.9 + nx * Math.PI * 0.8) +
      Math.sin(t * 1.15 + ny * Math.PI * 1.2) * 0.35) *
    frame.effectiveStrength;
  const autoY =
    (Math.cos(t * 1.55 + ny * Math.PI * 0.75) +
      Math.cos(t * 1.05 + nx * Math.PI * 1.1) * 0.35) *
    frame.effectiveStrength;
  const targetX = settings.direction === "y" ? 0 : autoX * w;
  const targetY = settings.direction === "x" ? 0 : autoY * w;
  const forceX = (targetX - vertex.offsetX) * settings.spring;
  const forceY = (targetY - vertex.offsetY) * settings.spring;

  vertex.velocityX += forceX * dt;
  vertex.velocityY += forceY * dt;
  vertex.velocityX *= Math.exp(-settings.damping * dt);
  vertex.velocityY *= Math.exp(-settings.damping * dt);
  vertex.offsetX += vertex.velocityX * dt;
  vertex.offsetY += vertex.velocityY * dt;

  vertex.offsetX = clamp(vertex.offsetX, -frame.maxOffset, frame.maxOffset);
  vertex.offsetY = clamp(vertex.offsetY, -frame.maxOffset, frame.maxOffset);
  vertex.x = vertex.baseX + vertex.offsetX * w;
  vertex.y = vertex.baseY + vertex.offsetY * w;
}
