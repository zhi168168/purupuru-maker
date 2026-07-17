import type { MotionMask } from "../types";
import { clamp } from "../utils/clamp";

export function sampleMaskArea(
  mask: MotionMask,
  x: number,
  y: number,
  radius: number,
) {
  const left = clamp(Math.floor(x - radius), 0, mask.width - 1);
  const top = clamp(Math.floor(y - radius), 0, mask.height - 1);
  const right = clamp(Math.ceil(x + radius), 0, mask.width - 1);
  const bottom = clamp(Math.ceil(y + radius), 0, mask.height - 1);
  const width = Math.max(1, right - left + 1);
  const height = Math.max(1, bottom - top + 1);
  const data = mask.ctx.getImageData(left, top, width, height).data;

  let alpha = 0;
  for (let index = 3; index < data.length; index += 4) {
    alpha += data[index];
  }

  return alpha / (width * height * 255);
}
