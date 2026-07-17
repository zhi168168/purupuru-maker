import type { ExportSettings } from "../types";
import { getSupportedMp4MimeType } from "../utils/browserSupport";

export type ExportController = {
  cancel: () => void;
  done: Promise<Blob>;
};

export function exportMp4MediaRecorder(
  canvas: HTMLCanvasElement,
  settings: ExportSettings,
  onProgress: (progress: number) => void,
): ExportController {
  const mimeType = getSupportedMp4MimeType();
  if (!mimeType) {
    throw new Error("MP4 export is not supported in this browser. Choose GIF or try latest Chrome, Edge, or Safari.");
  }

  const stream = canvas.captureStream(settings.fps);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: settings.bitrate,
  });
  let cancelled = false;
  let timer = 0;

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => reject(new Error("Export failed while recording the canvas."));
    recorder.onstop = () => {
      window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      if (cancelled) {
        reject(new Error("Export cancelled."));
        return;
      }
      resolve(new Blob(chunks, { type: mimeType }));
    };

    const start = performance.now();
    timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      onProgress(Math.min(0.98, elapsed / settings.durationSeconds));
      if (elapsed >= settings.durationSeconds && recorder.state === "recording") {
        recorder.stop();
      }
    }, 200);

    recorder.start(250);
  });

  return {
    cancel: () => {
      cancelled = true;
      if (recorder.state === "recording") recorder.stop();
    },
    done,
  };
}
