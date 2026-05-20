import { useState, useId, useCallback } from "react";

export interface SliderProps {
  
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFillPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function fmt(n: number): string {
  return n.toLocaleString("de-DE");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Slider({
  unit,
  min,
  max,
  step = 1,
  defaultValue,
  value: controlledValue,
  onChange,
  onChangeCommitted,
  hint,
  disabled = false,
}: SliderProps) {
  const inputId = useId();
  const hintId = useId();

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<number>(
    defaultValue ?? min
  );

  const value = isControlled ? controlledValue : internalValue;
  const fillPct = getFillPercent(value, min, max);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      onChangeCommitted?.(Number((e.target as HTMLInputElement).value));
    },
    [onChangeCommitted]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (keys.includes(e.key)) {
        onChangeCommitted?.(Number((e.target as HTMLInputElement).value));
      }
    },
    [onChangeCommitted]
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        
        <output
          htmlFor={inputId}
          aria-hidden="true"
          className={[
            "inline-flex items-center gap-0.5 rounded-lg  py-1",
            "bg-[--color-mint] text-[--color-forest] text-sm font-semibold",
            "tabular-nums tracking-tight leading-none transition-colors duration-150",
          ].join(" ")}
        >
          <span>{fmt(value)}</span>
          {unit && (
            <span className="text-[--color-sage] font-medium ml-0.5">
              {unit}
            </span>
          )}
        </output>
      </div>

      {/* ── Slider track + thumb ── */}
      <div className="relative flex items-center h-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 h-3 rounded-full overflow-hidden pointer-events-none border-border"
          style={
            {
              background: `linear-gradient(
                to right,
                var(--color-forest) 0%,
                var(--color-forest) ${fillPct}%,
                var(--color-linen) ${fillPct}%,
                var(--color-linen) 100%
              )`,
              boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, var(--color-border) 40%, transparent)`,
            } as React.CSSProperties
          }
        />

        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${fmt(value)}${unit ? ` ${unit}` : ""}`}
          aria-describedby={hint ? hintId : undefined}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onKeyUp={handleKeyUp}
          className={[
            // Reset native appearance
            "relative z-10 w-full appearance-none bg-transparent cursor-pointer",
            // Thumb — webkit
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-[--color-primary]",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[--color-primary]",
            "[&::-webkit-slider-thumb]:shadow-md",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100",
            "[&:hover::-webkit-slider-thumb]:scale-110",
            "[&:focus-visible::-webkit-slider-thumb]:scale-110",
            "[&:focus-visible::-webkit-slider-thumb]:ring-2",
            "[&:focus-visible::-webkit-slider-thumb]:ring-[--color-forest]",
            "[&:focus-visible::-webkit-slider-thumb]:ring-offset-2",
            // Thumb — moz
            "[&::-moz-range-thumb]:appearance-none",
            "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-[--color-primary]",
            "[&::-moz-range-thumb]:shadow-md",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[--color-primary]",
            // Remove moz inner track styling
            "[&::-moz-range-track]:bg-transparent",
          ].join(" ")}
        />
      </div>
      <div className="flex justify-between text-[--color-muted] text-sm tabular-nums select-none" aria-hidden="true">
        <span>
          {fmt(min)}
          {unit && <span className="ml-0.5">{unit}</span>}
        </span>
        <span>
          {fmt(max)}
          {unit && <span className="ml-0.5">{unit}</span>}
        </span>
      </div>
    </div>
  );
}