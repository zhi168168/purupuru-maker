import type { LoadedImage } from "../types";

const MAX_WORKING_LONGEST_SIDE = 1600;

export async function downscaleImage(
  bitmap: ImageBitmap | HTMLImageElement,
  fileName: string,
  mimeType: string,
  originalWidth: number,
  originalHeight: number,
): Promise<LoadedImage> {
  const longest = Math.max(originalWidth, originalHeight);
  const scale = longest > MAX_WORKING_LONGEST_SIDE ? MAX_WORKING_LONGEST_SIDE / longest : 1;
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);

  if (scale === 1) {
    return {
      id: crypto.randomUUID(),
      fileName,
      mimeType,
      width: originalWidth,
      height: originalHeight,
      originalWidth,
      originalHeight,
      bitmap,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable, so the image could not be resized.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  const scaled = await createImageBitmap(canvas);

  if ("close" in bitmap) {
    bitmap.close();
  }

  return {
    id: crypto.randomUUID(),
    fileName,
    mimeType,
    width,
    height,
    originalWidth,
    originalHeight,
    bitmap: scaled,
  };
}
