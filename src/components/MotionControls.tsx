import type { MotionSettings } from "../types";

type MotionControlsProps = {
  motion: MotionSettings;
  disabled: boolean;
  onChange: (motion: MotionSettings) => void;
};

export function MotionControls({ motion, disabled, onChange }: MotionControlsProps) {
  return (
    <section className="controls-panel" aria-label="Motion controls">
      <h2>Motion</h2>

      <Slider
        label="Strength"
        value={motion.strength}
        min={0}
        max={160}
        step={1}
        unit="px"
        disabled={disabled}
        onChange={(strength) => onChange({ ...motion, strength })}
      />
      <Slider
        label="Speed"
        value={motion.speed}
        min={0.1}
        max={5}
        step={0.1}
        disabled={disabled}
        onChange={(speed) => onChange({ ...motion, speed })}
      />
      <Slider
        label="Spring"
        value={motion.spring}
        min={5}
        max={160}
        step={1}
        disabled={disabled}
        onChange={(spring) => onChange({ ...motion, spring })}
      />
      <Slider
        label="Damping"
        value={motion.damping}
        min={1}
        max={40}
        step={1}
        disabled={disabled}
        onChange={(damping) => onChange({ ...motion, damping })}
      />
      <Slider
        label="Randomness"
        value={motion.randomness}
        min={0}
        max={1}
        step={0.05}
        disabled={disabled}
        onChange={(randomness) => onChange({ ...motion, randomness })}
      />

      <label className="field">
        <span>Direction</span>
        <select
          value={motion.direction}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...motion,
              direction: event.target.value as MotionSettings["direction"],
            })
          }
        >
          <option value="both">Both axes</option>
          <option value="x">Horizontal</option>
          <option value="y">Vertical</option>
        </select>
      </label>
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
  const id = `motion-${label.toLowerCase()}`;
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
