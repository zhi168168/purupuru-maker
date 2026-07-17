export type AppMode = "empty" | "paint" | "preview" | "exporting";

export type LoadedImage = {
  id: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  bitmap: ImageBitmap | HTMLImageElement;
  objectUrl?: string;
};

export type MotionMask = {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  version: number;
};

export type BrushSettings = {
  mode: "paint" | "erase";
  size: number;
  strength: number;
  hardness: number;
};

export type MeshVertex = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  u: number;
  v: number;
  weight: number;
  phase: number;
  velocityX: number;
  velocityY: number;
  offsetX: number;
  offsetY: number;
};

export type DeformMesh = {
  cols: number;
  rows: number;
  vertices: MeshVertex[];
  indices: number[];
};

export type MotionSettings = {
  strength: number;
  speed: number;
  spring: number;
  damping: number;
  randomness: number;
  direction: "both" | "x" | "y";
};

export type ExportSettings = {
  format: "mp4" | "gif";
  durationSeconds: number;
  fps: number;
  width: number;
  height: number;
  bitrate: number;
};

export type ExportProgress = {
  progress: number;
  label: string;
};
