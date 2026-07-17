import type { ExportProgress, LoadedImage } from "../types";

type StatusBarProps = {
  image: LoadedImage | null;
  error: string | null;
  progress: ExportProgress | null;
};

export function StatusBar({ image, error, progress }: StatusBarProps) {
  return (
    <footer className="statusbar" aria-live="polite">
      <span>
        {image
          ? `${image.fileName} · ${image.width} x ${image.height}px`
          : "Images stay on this device."}
      </span>
      <span className={error ? "status-error" : ""}>
        {error ?? progress?.label ?? "Ready"}
      </span>
    </footer>
  );
}
