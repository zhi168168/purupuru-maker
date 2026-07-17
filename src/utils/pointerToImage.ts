import { clamp } from "./clamp";

export type ImagePlacement = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
};

export function getContainPlacement(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): ImagePlacement {
  const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
    width,
    height,
    scale,
  };
}

export function pointerToImage(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  placement: ImagePlacement,
  imageWidth: number,
  imageHeight: number,
) {
  const rect = container.getBoundingClientRect();
  const x = (clientX - rect.left - placement.left) / placement.scale;
  const y = (clientY - rect.top - placement.top) / placement.scale;
  return {
    x: clamp(x, 0, imageWidth),
    y: clamp(y, 0, imageHeight),
    inside: x >= 0 && y >= 0 && x <= imageWidth && y <= imageHeight,
  };
}
