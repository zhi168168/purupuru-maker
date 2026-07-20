import { Download, ImagePlus, Paintbrush, Play } from "lucide-react";
import type { AppMode } from "../types";
import { getLocalizedCurrentPath, locales, type Locale } from "../i18n";

type EditorActionsProps = {
  mode: AppMode;
  hasImage: boolean;
  isExporting: boolean;
  locale: Locale;
  labels: {
    upload: string;
    replace: string;
    paint: string;
    preview: string;
    export: string;
  };
  onUploadClick: () => void;
  onSetMode: (mode: "paint" | "preview") => void;
  onExport: () => void;
};

export function EditorActions({
  mode,
  hasImage,
  isExporting,
  locale,
  labels,
  onUploadClick,
  onSetMode,
  onExport,
}: EditorActionsProps) {
  return (
    <section className="editor-actions" aria-label="Editor actions">
      <label className="language-select">
        <span className="visually-hidden">Language</span>
        <select
          value={locale}
          disabled={isExporting}
          onChange={(event) => {
            window.location.href = getLocalizedCurrentPath(event.target.value as Locale);
          }}
        >
          {locales.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="button" onClick={onUploadClick} disabled={isExporting}>
        <ImagePlus size={18} />
        {hasImage ? labels.replace : labels.upload}
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
          {labels.paint}
        </button>
        <button
          type="button"
          className={`preview-mode${mode === "preview" ? " active" : ""}`}
          disabled={!hasImage || isExporting}
          onClick={() => onSetMode("preview")}
          aria-pressed={mode === "preview"}
        >
          <Play size={17} />
          {labels.preview}
        </button>
      </div>

      <button
        type="button"
        className="button export-secondary"
        disabled={!hasImage || isExporting}
        onClick={onExport}
      >
        <Download size={18} />
        {labels.export}
      </button>
    </section>
  );
}
