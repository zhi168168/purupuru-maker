import { GIFEncoder, applyPalette, quantize } from "gifenc";
import type { ExportSettings } from "../types";
import type { ExportController } from "./exportMediaRecorder";

export function exportGif(
  canvas: HTMLCanvasElement,
  settings: ExportSettings,
  onProgress: (progress: number) => void,
): ExportController {
  let cancelled = false;

  const done = encodeGif(canvas, settings, () => cancelled, onProgress);

  return {
    cancel: () => {
      cancelled = true;
    },
    done,
  };
}

async function encodeGif(
  sourceCanvas: HTMLCanvasElement,
  settings: ExportSettings,
  isCancelled: () => boolean,
  onProgress: (progress: number) => void,
) {
  const captureCanvas = document.createElement("canvas");
  captureCanvas.width = sourceCanvas.width;
  captureCanvas.height = sourceCanvas.height;
  const ctx = captureCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable, so GIF export cannot start.");

  const gif = GIFEncoder();
  const fps = Math.max(1, settings.fps);
  const frameCount = Math.max(1, Math.round(settings.durationSeconds * fps));
  const delayMs = Math.round(1000 / fps);

  for (let frame = 0; frame < frameCount; frame += 1) {
    if (isCancelled()) throw new Error("Export cancelled.");

    await waitForNextFrame(delayMs);
    ctx.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
    ctx.drawImage(sourceCanvas, 0, 0, captureCanvas.width, captureCanvas.height);

    const image = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
    const palette = quantize(image.data, 256);
    const index = applyPalette(image.data, palette);
    gif.writeFrame(index, captureCanvas.width, captureCanvas.height, {
      palette,
      delay: delayMs,
      repeat: 0,
    });
    onProgress(Math.min(0.98, (frame + 1) / frameCount));
  }

  gif.finish();
  onProgress(1);
  const output = gif.bytes();
  const blobBytes = new Uint8Array(output.byteLength);
  blobBytes.set(output);
  return new Blob([blobBytes.buffer], { type: "image/gif" });
}

function waitForNextFrame(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => requestAnimationFrame(() => resolve()), delayMs);
  });
}
