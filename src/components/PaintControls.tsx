import { Brush, Eraser, Trash2 } from "lucide-react";
import type { BrushSettings } from "../types";

type PaintControlsProps = {
  brush: BrushSettings;
  disabled: boolean;
  onChange: (brush: BrushSettings) => void;
  onClear: () => void;
};

export function PaintControls({
  brush,
  disabled,
  onChange,
  onClear,
}: PaintControlsProps) {
  return (
    <section className="controls-panel" aria-label="Paint controls">
      <h2>Brush</h2>

      <div className="tool-toggle">
        <button
          type="button"
          className={brush.mode === "paint" ? "active" : ""}
          disabled={disabled}
          onClick={() => onChange({ ...brush, mode: "paint" })}
        >
          <Brush size={17} />
          Paint
        </button>
        <button
          type="button"
          className={brush.mode === "erase" ? "active" : ""}
          disabled={disabled}
          onClick={() => onChange({ ...brush, mode: "erase" })}
        >
          <Eraser size={17} />
          Erase
        </button>
      </div>

      <Slider
        label="Size"
        value={brush.size}
        min={4}
        max={240}
        step={1}
        unit="px"
        disabled={disabled}
        onChange={(size) => onChange({ ...brush, size })}
      />
      <Slider
        label="Strength"
        value={brush.strength}
        min={0.05}
        max={1}
        step={0.05}
        disabled={disabled}
        onChange={(strength) => onChange({ ...brush, strength })}
      />
      <Slider
        label="Hardness"
        value={brush.hardness}
        min={0}
        max={1}
        step={0.05}
        disabled={disabled}
        onChange={(hardness) => onChange({ ...brush, hardness })}
      />

      <button type="button" className="button danger" disabled={disabled} onClick={onClear}>
        <Trash2 size={17} />
        Clear mask
      </button>
    </section>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, unit = "", disabled, onChange }: SliderProps) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  const displayValue = Number.isInteger(step) ? value.toFixed(0) : value.toFixed(2);
  return (
    <label className="slider" htmlFor={id}>
      <span>
        {label}
        <strong>
          {displayValue}
          {unit}
        </strong>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
