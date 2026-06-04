import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronDown, Check, X } from 'lucide-react'

export interface SelectOption {
  id: string
  label: string
  badge?: string
  variant?: 'default' | 'accent'
}

interface MultiSelectProps {
  options: SelectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  loading?: boolean
  'aria-label'?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  loading = false,
  'aria-label': ariaLabel,
}: MultiSelectProps) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => {
            const opt = options.find((o) => o.id === id)
            if (!opt) return null
            return (
              <span
                key={id}
                className={[
                  'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-small font-medium',
                  opt.variant === 'accent' ? 'bg-blush text-accent' : 'bg-mint text-primary',
                ].join(' ')}
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`Remove ${opt.label}`}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Listbox */}
      <Listbox value={value} onChange={onChange} multiple>
        <div className="relative max-w-xs">
          <ListboxButton
            disabled={loading}
            aria-label={ariaLabel}
            className="flex items-center justify-between w-full h-10 px-3 rounded-lg border border-border bg-background text-small text-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed data-[open]:border-primary"
          >
            <span className="text-muted">{loading ? 'Loading…' : placeholder}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="text-muted shrink-0 transition-transform ui-open:rotate-180"
            />
          </ListboxButton>

          <ListboxOptions
            anchor="bottom start"
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
                    <Check size={14} aria-hidden="true" className="text-primary" />
                  )}
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  )
}
