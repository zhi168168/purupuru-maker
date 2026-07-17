import type { LoadedImage } from "../types";
import { downscaleImage } from "./downscaleImage";

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

async function decodeWithImageElement(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return {
      bitmap: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      objectUrl,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export async function loadImage(file: File): Promise<LoadedImage> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Please choose a PNG, JPEG, or WebP image.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("This file is larger than 30 MB. Please choose a smaller image.");
  }

  try {
    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return downscaleImage(
        bitmap,
        file.name,
        file.type,
        bitmap.width,
        bitmap.height,
      );
    }

    const decoded = await decodeWithImageElement(file);
    const loaded = await downscaleImage(
      decoded.bitmap,
      file.name,
      file.type,
      decoded.width,
      decoded.height,
    );
    loaded.objectUrl = decoded.objectUrl;
    return loaded;
  } catch {
    throw new Error("The image could not be decoded. Please try another still image.");
  }
}
