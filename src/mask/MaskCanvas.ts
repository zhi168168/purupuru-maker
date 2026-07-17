import type { MotionMask } from "../types";

export function createMotionMask(width: number, height: number): MotionMask {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable, so the mask could not be created.");
  ctx.clearRect(0, 0, width, height);
  return { width, height, canvas, ctx, version: 0 };
}

export function clearMotionMask(mask: MotionMask) {
  mask.ctx.clearRect(0, 0, mask.width, mask.height);
  mask.version += 1;
}
