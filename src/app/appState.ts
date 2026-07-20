import type {
  BrushSettings,
  ExportSettings,
  MotionSettings,
} from "../types";

export const defaultBrush: BrushSettings = {
  mode: "paint",
  size: 48,
  strength: 0.8,
  hardness: 0.65,
};

export const defaultMotion: MotionSettings = {
  strength: 18,
  speed: 1.2,
  spring: 34,
  damping: 16,
  randomness: 0.2,
  direction: "both",
  envelope: {
    mode: "loop",
    settleDuration: 2,
    settleCurve: "smooth",
    keyframes: [
      { id: "start", time: 0, value: 1 },
      { id: "peak", time: 0.35, value: 0.75 },
      { id: "rest", time: 2, value: 0 },
    ],
  },
};

export const defaultExportSettings: ExportSettings = {
  format: "mp4",
  durationSeconds: 5,
  fps: 30,
  width: 0,
  height: 0,
  bitrate: 2_000_000,
};
