import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDown, Check, X } from "lucide-react";
import { useRef, useEffect } from "react";

export interface SelectOption {
  id: string;
  label: string;
  badge?: string;
  variant?: "default" | "accent";
}

export interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  loading = false,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-required": ariaRequired,
}: MultiSelectProps) {
  function toggle(optId: string) {
    onChange(
      value.includes(optId)
        ? value.filter((v) => v !== optId)
        : [...value, optId],
    );
  }

  const buttonAriaLabel = ariaLabel
    ? value.length > 0
      ? `${ariaLabel}, ${value.length} selected`
      : ariaLabel
    : undefined;

  // Headless UI overrides aria-describedby via its internal description context,
  // so we set it imperatively to ensure the user-provided value is preserved.
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!buttonRef.current) return;
    if (ariaDescribedby) {
      buttonRef.current.setAttribute("aria-describedby", ariaDescribedby);
    } else {
      buttonRef.current.removeAttribute("aria-describedby");
    }
  }, [ariaDescribedby]);

  return (
    <div className="flex flex-col gap-2">
      {/* Selected chips */}
      {value.length > 0 && (
        <div
          role="list"
          aria-label="Selected tags"
          className="flex flex-wrap gap-2"
        >
          {value.map((optId) => {
            const opt = options.find((o) => o.id === optId);
            if (!opt) return null;
            return (
              <span
                key={optId}
                role="listitem"
                className={[
                  "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-small font-medium",
                  opt.variant === "accent"
                    ? "bg-blush text-accent"
                    : "bg-mint text-primary",
                ].join(" ")}
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => toggle(optId)}
                  aria-label={`Remove ${opt.label}`}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Listbox */}
      <Listbox value={value} onChange={onChange} multiple>
        <div className="relative max-w-xs">
          <ListboxButton
            ref={buttonRef}
            id={id}
            disabled={loading}
            aria-label={buttonAriaLabel}
            aria-required={ariaRequired}
            className="flex items-center justify-between w-full h-10 px-3 rounded-lg border border-border bg-background text-small text-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed data-[open]:border-primary"
          >
            <span className="text-muted">
              {loading ? "Loading…" : placeholder}
            </span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="text-muted shrink-0 transition-transform ui-open:rotate-180"
            />
          </ListboxButton>

          <ListboxOptions
            anchor="bottom start"
            aria-label={ariaLabel}
            className="z-10 w-[var(--button-width)] max-h-56 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg py-1 [--anchor-gap:4px] focus:outline-none"
          >
            {options.map((opt) => (
              <ListboxOption
                key={opt.id}
                value={opt.id}
                className="flex items-center justify-between px-4 py-2.5 text-small text-foreground cursor-pointer transition-colors select-none data-[focus]:bg-primary/10"
              >
                {opt.label}
                <span className="flex items-center gap-2 shrink-0 ml-2">
                  {opt.badge && (
                    <span className="text-[10px] font-medium text-accent bg-blush px-1.5 py-0.5 rounded-full">
                      {opt.badge}
                    </span>
                  )}
                  {value.includes(opt.id) && (
                    <Check
                      size={14}
                      aria-hidden="true"
                      className="text-primary"
                    />
                  )}
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}
