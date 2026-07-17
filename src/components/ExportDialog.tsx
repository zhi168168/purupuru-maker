import { Download, Square } from "lucide-react";
import type { ExportProgress, ExportSettings } from "../types";

type ExportDialogProps = {
  open: boolean;
  settings: ExportSettings;
  progress: ExportProgress | null;
  canExport: boolean;
  supportMessage?: string;
  onChange: (settings: ExportSettings) => void;
  onClose: () => void;
  onStart: () => void;
  onCancel: () => void;
};

export function ExportDialog({
  open,
  settings,
  progress,
  canExport,
  supportMessage,
  onChange,
  onClose,
  onStart,
  onCancel,
}: ExportDialogProps) {
  if (!open) return null;
  const exporting = progress !== null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <h2 id="export-title">Export Animation</h2>

        <label className="field">
          <span>Format</span>
          <select
            value={settings.format}
            disabled={exporting}
            onChange={(event) =>
              onChange({ ...settings, format: event.target.value as ExportSettings["format"] })
            }
          >
            <option value="mp4">MP4</option>
            <option value="gif">GIF</option>
          </select>
        </label>

        <label className="field">
          <span>Duration</span>
          <select
            value={settings.durationSeconds}
            disabled={exporting}
            onChange={(event) =>
              onChange({ ...settings, durationSeconds: Number(event.target.value) })
            }
          >
            <option value={5}>5 seconds</option>
            <option value={6}>6 seconds</option>
            <option value={7}>7 seconds</option>
            <option value={8}>8 seconds</option>
            <option value={9}>9 seconds</option>
            <option value={10}>10 seconds</option>
          </select>
        </label>

        {supportMessage && !exporting && (
          <p className="field-hint">{supportMessage}</p>
        )}

        {progress && (
          <div className="export-progress">
            <span>{progress.label}</span>
            <progress value={progress.progress} max={1} />
          </div>
        )}

        <div className="dialog-actions">
          <button type="button" className="button" disabled={exporting} onClick={onClose}>
            Close
          </button>
          {exporting ? (
            <button type="button" className="button danger" onClick={onCancel}>
              <Square size={16} />
              Cancel
            </button>
          ) : (
            <button type="button" className="button primary" disabled={!canExport} onClick={onStart}>
              <Download size={16} />
              Download
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
