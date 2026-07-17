import { Download, ImagePlus, Paintbrush, Play } from "lucide-react";
import type { AppMode } from "../types";

type EditorActionsProps = {
  mode: AppMode;
  hasImage: boolean;
  isExporting: boolean;
  onUploadClick: () => void;
  onSetMode: (mode: "paint" | "preview") => void;
  onExport: () => void;
};

export function EditorActions({
  mode,
  hasImage,
  isExporting,
  onUploadClick,
  onSetMode,
  onExport,
}: EditorActionsProps) {
  return (
    <section className="editor-actions" aria-label="Editor actions">
      <button type="button" className="button" onClick={onUploadClick} disabled={isExporting}>
        <ImagePlus size={18} />
        {hasImage ? "Replace" : "Upload"}
      </button>

      <div className="segmented" aria-label="Mode">
        <button
          type="button"
          className={mode === "paint" ? "active" : ""}
          disabled={!hasImage || isExporting}
          onClick={() => onSetMode("paint")}
          aria-pressed={mode === "paint"}
        >
          <Paintbrush size={17} />
          Paint
        </button>
        <button
          type="button"
          className={mode === "preview" ? "active" : ""}
          disabled={!hasImage || isExporting}
          onClick={() => onSetMode("preview")}
          aria-pressed={mode === "preview"}
        >
          <Play size={17} />
          Preview
        </button>
      </div>

      <button
        type="button"
        className="button primary"
        disabled={!hasImage || isExporting}
        onClick={onExport}
      >
        <Download size={18} />
        Export
      </button>
    </section>
  );
}
