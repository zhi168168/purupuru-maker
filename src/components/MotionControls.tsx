import { Plus, RotateCw, SlidersHorizontal, Trash2, Waves } from "lucide-react";
import type { MotionEnvelope, MotionKeyframe, MotionSettings } from "../types";

type MotionControlsProps = {
  motion: MotionSettings;
  disabled: boolean;
  exportDurationSeconds: number;
  onChange: (motion: MotionSettings) => void;
};

export function MotionControls({
  motion,
  disabled,
  exportDurationSeconds,
  onChange,
}: MotionControlsProps) {
  const maxKeyframeTime = Math.max(0.1, exportDurationSeconds);
  const sortedKeyframes = [...motion.envelope.keyframes].sort((a, b) => a.time - b.time);
  const hasDuplicateKeyframeTime = hasDuplicateTimes(sortedKeyframes);

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

      <div className="motion-envelope" aria-label="Motion over time">
        <div className="control-heading">
          <span>Motion over time</span>
          <strong>{getEnvelopeLabel(motion.envelope)}</strong>
        </div>
        <div className="motion-mode-toggle">
          <button
            type="button"
            className={motion.envelope.mode === "loop" ? "active" : ""}
            disabled={disabled}
            onClick={() =>
              onChange({
                ...motion,
                envelope: { ...motion.envelope, mode: "loop" },
              })
            }
            aria-pressed={motion.envelope.mode === "loop"}
          >
            <RotateCw size={15} />
            Loop
          </button>
          <button
            type="button"
            className={motion.envelope.mode === "settle" ? "active" : ""}
            disabled={disabled}
            onClick={() =>
              onChange({
                ...motion,
                envelope: { ...motion.envelope, mode: "settle" },
              })
            }
            aria-pressed={motion.envelope.mode === "settle"}
          >
            <Waves size={15} />
            Settle
          </button>
          <button
            type="button"
            className={motion.envelope.mode === "custom" ? "active" : ""}
            disabled={disabled}
            onClick={() =>
              onChange({
                ...motion,
                envelope: { ...motion.envelope, mode: "custom" },
              })
            }
            aria-pressed={motion.envelope.mode === "custom"}
          >
            <SlidersHorizontal size={15} />
            Custom
          </button>
        </div>

        <EnvelopePreview
          envelope={motion.envelope}
          exportDurationSeconds={maxKeyframeTime}
        />

        {motion.envelope.mode === "settle" && (
          <div className="envelope-options">
            <Slider
              label="Settle duration"
              value={motion.envelope.settleDuration}
              min={0.4}
              max={6}
              step={0.1}
              unit="s"
              disabled={disabled}
              onChange={(settleDuration) =>
                onChange({
                  ...motion,
                  envelope: { ...motion.envelope, settleDuration },
                })
              }
            />
            <label className="field">
              <span>Decay curve</span>
              <select
                value={motion.envelope.settleCurve}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...motion,
                    envelope: {
                      ...motion.envelope,
                      settleCurve: event.target.value as MotionEnvelope["settleCurve"],
                    },
                  })
                }
              >
                <option value="smooth">Smooth</option>
                <option value="bouncy">Bouncy</option>
                <option value="fast">Fast drop</option>
                <option value="linear">Linear</option>
              </select>
            </label>
          </div>
        )}

        {motion.envelope.mode === "custom" && (
          <div className="keyframe-list">
            <p className="field-note">
              Set wobble strength at specific seconds.
            </p>
            {sortedKeyframes.map((keyframe, index) => (
              <KeyframeRow
                key={keyframe.id}
                index={index}
                keyframe={keyframe}
                disabled={disabled}
                maxTime={maxKeyframeTime}
                canDelete={sortedKeyframes.length > 2}
                onChange={(nextKeyframe) =>
                  onChange({
                    ...motion,
                    envelope: {
                      ...motion.envelope,
                      keyframes: motion.envelope.keyframes.map((item) =>
                        item.id === keyframe.id
                          ? normalizeKeyframeTime(nextKeyframe, motion.envelope.keyframes, maxKeyframeTime)
                          : item,
                      ),
                    },
                  })
                }
                onDelete={() =>
                  onChange({
                    ...motion,
                    envelope: {
                      ...motion.envelope,
                      keyframes: motion.envelope.keyframes.filter(
                        (item) => item.id !== keyframe.id,
                      ),
                    },
                  })
                }
              />
              ))}
            <button
              type="button"
              className="button keyframe-add"
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...motion,
                  envelope: {
                    ...motion.envelope,
                    keyframes: [
                      ...motion.envelope.keyframes,
                      createInsertedKeyframe(motion.envelope.keyframes, maxKeyframeTime),
                    ],
                  },
                })
              }
            >
              <Plus size={15} />
              Add keyframe
            </button>
            <p className="field-note">
              Time is capped at export duration: {maxKeyframeTime.toFixed(0)}s.
            </p>
            {hasDuplicateKeyframeTime && (
              <p className="field-warning">
                Two keyframes share the same second. Adjust one time for a cleaner curve.
              </p>
            )}
          </div>
        )}
      </div>

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

function getEnvelopeLabel(envelope: MotionEnvelope) {
  if (envelope.mode === "loop") return "constant";
  if (envelope.mode === "settle") return `${envelope.settleDuration.toFixed(1)}s fade`;
  return "keyframed";
}

function EnvelopePreview({
  envelope,
  exportDurationSeconds,
}: {
  envelope: MotionEnvelope;
  exportDurationSeconds: number;
}) {
  const samples = Array.from({ length: 48 }, (_, index) => {
    const x = index / 47;
    const value = sampleEnvelopePreview(envelope, x, exportDurationSeconds);
    return `${8 + x * 184},${60 - value * 44}`;
  }).join(" ");

  return (
    <div className="envelope-preview" aria-hidden="true">
      <svg viewBox="0 0 200 68" role="img">
        <line x1="8" y1="60" x2="192" y2="60" />
        <line x1="8" y1="16" x2="8" y2="60" />
        <polyline points={samples} />
      </svg>
      <div className="envelope-caption">
        <span>0s / strong</span>
        <span>{exportDurationSeconds.toFixed(0)}s / still</span>
      </div>
    </div>
  );
}

function sampleEnvelopePreview(
  envelope: MotionEnvelope,
  progress: number,
  exportDurationSeconds: number,
) {
  if (envelope.mode === "loop") return 1;
  if (envelope.mode === "custom") {
    const duration = Math.max(0.1, exportDurationSeconds);
    const time = progress * duration;
    const keyframes = [...envelope.keyframes].sort((a, b) => a.time - b.time);
    if (time <= keyframes[0].time) return keyframes[0].value;
    for (let index = 1; index < keyframes.length; index += 1) {
      const previous = keyframes[index - 1];
      const next = keyframes[index];
      if (time <= next.time) {
        const span = Math.max(0.001, next.time - previous.time);
        const amount = (time - previous.time) / span;
        return previous.value + (next.value - previous.value) * amount;
      }
    }
    return keyframes[keyframes.length - 1].value;
  }
  if (envelope.settleCurve === "linear") return 1 - progress;
  if (envelope.settleCurve === "fast") return Math.pow(1 - progress, 2.35);
  if (envelope.settleCurve === "bouncy") {
    return Math.min(
      1,
      Math.pow(1 - progress, 2.1) +
        Math.abs(Math.sin(progress * Math.PI * 4.5)) * 0.22 * (1 - progress),
    );
  }
  return 1 - progress * progress * (3 - 2 * progress);
}

function KeyframeRow({
  index,
  keyframe,
  disabled,
  maxTime,
  canDelete,
  onChange,
  onDelete,
}: {
  index: number;
  keyframe: MotionKeyframe;
  disabled?: boolean;
  maxTime: number;
  canDelete: boolean;
  onChange: (keyframe: MotionKeyframe) => void;
  onDelete: () => void;
}) {
  return (
    <div className="keyframe-row">
      <span>K{index + 1}</span>
      <label>
        At second
        <input
          type="number"
          min={0}
          max={maxTime}
          step={0.05}
          value={keyframe.time}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...keyframe,
              time: clampNumber(Number(event.target.value), 0, maxTime),
            })
          }
        />
      </label>
      <label>
        Wobble %
        <input
          type="number"
          min={0}
          max={150}
          step={5}
          value={Math.round(keyframe.value * 100)}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...keyframe, value: Number(event.target.value) / 100 })
          }
        />
      </label>
      <button
        type="button"
        className="keyframe-delete"
        disabled={disabled || !canDelete}
        onClick={onDelete}
        aria-label={`Delete K${index + 1}`}
        title={canDelete ? `Delete K${index + 1}` : "Keep at least two keyframes"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function createInsertedKeyframe(keyframes: MotionKeyframe[], maxTime: number): MotionKeyframe {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const anchors = [
    { id: "timeline-start", time: 0, value: sorted[0]?.value ?? 1 },
    ...sorted,
    { id: "timeline-end", time: maxTime, value: sorted[sorted.length - 1]?.value ?? 0 },
  ];
  let insertAfter = anchors[0];
  let insertBefore = anchors[anchors.length - 1];
  let widestGap = -1;

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const next = anchors[index];
    const gap = next.time - previous.time;
    if (gap > widestGap) {
      widestGap = gap;
      insertAfter = previous;
      insertBefore = next;
    }
  }

  const midpoint = insertAfter.time + Math.max(0.05, widestGap / 2);
  const nextTime = avoidUsedTime(midpoint, sorted, maxTime);
  const progress =
    insertBefore.time === insertAfter.time
      ? 0
      : (nextTime - insertAfter.time) / (insertBefore.time - insertAfter.time);
  const previousValue =
    insertAfter.value + (insertBefore.value - insertAfter.value) * clampNumber(progress, 0, 1);

  return {
    id: `keyframe-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    time: Number(nextTime.toFixed(2)),
    value: previousValue,
  };
}

function normalizeKeyframeTime(
  keyframe: MotionKeyframe,
  keyframes: MotionKeyframe[],
  maxTime: number,
) {
  const otherKeyframes = keyframes.filter((item) => item.id !== keyframe.id);
  return {
    ...keyframe,
    time: Number(avoidUsedTime(keyframe.time, otherKeyframes, maxTime).toFixed(2)),
  };
}

function avoidUsedTime(time: number, keyframes: MotionKeyframe[], maxTime: number) {
  const used = new Set(keyframes.map((keyframe) => keyframe.time.toFixed(2)));
  let candidate = clampNumber(time, 0, maxTime);
  if (!used.has(candidate.toFixed(2))) return candidate;

  for (let step = 1; step <= 20; step += 1) {
    const forward = clampNumber(candidate + step * 0.05, 0, maxTime);
    if (!used.has(forward.toFixed(2))) return forward;
    const backward = clampNumber(candidate - step * 0.05, 0, maxTime);
    if (!used.has(backward.toFixed(2))) return backward;
  }

  return candidate;
}

function hasDuplicateTimes(keyframes: MotionKeyframe[]) {
  const seen = new Set<string>();
  for (const keyframe of keyframes) {
    const time = keyframe.time.toFixed(2);
    if (seen.has(time)) return true;
    seen.add(time);
  }
  return false;
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
