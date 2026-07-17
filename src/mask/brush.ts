import type { BrushSettings, MotionMask } from "../types";

export function drawBrushDab(
  mask: MotionMask,
  x: number,
  y: number,
  brush: BrushSettings,
) {
  const radius = brush.size / 2;
  const innerRadius = radius * brush.hardness;
  const gradient = mask.ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${brush.strength})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  mask.ctx.save();
  mask.ctx.globalCompositeOperation =
    brush.mode === "paint" ? "source-over" : "destination-out";
  mask.ctx.fillStyle = gradient;
  mask.ctx.beginPath();
  mask.ctx.arc(x, y, radius, 0, Math.PI * 2);
  mask.ctx.fill();
  mask.ctx.restore();
}

export function drawBrushStroke(
  mask: MotionMask,
  from: { x: number; y: number } | null,
  to: { x: number; y: number },
  brush: BrushSettings,
) {
  if (!from) {
    drawBrushDab(mask, to.x, to.y, brush);
    mask.version += 1;
    return;
  }

  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const step = Math.max(2, brush.size / 5);
  const count = Math.max(1, Math.ceil(distance / step));

  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    drawBrushDab(
      mask,
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
      brush,
    );
  }

  mask.version += 1;
}
