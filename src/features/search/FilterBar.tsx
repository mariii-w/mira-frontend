import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Input } from '../../common/ui/Input'
import { Button } from '../../common/ui/Button'
import { Slider } from '../../common/ui/Slider'

export interface ServiceTagOption {
  tagId: string
  name: string
}

interface FilterBarProps {
  tags: ServiceTagOption[]
  selectedTagIds: string[]
  onTagToggle: (tagId: string) => void
  distanceKm: number
  onDistanceChange: (v: number) => void
  maxPrice: number
  onMaxPriceChange: (v: number) => void
  onApply: () => void
  resultCount?: number
  activeCount?: number
}

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-1 group"
        aria-expanded={open}
      >
        <p className="text-h2 font-medium">{title}</p>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            'text-muted transition-transform duration-200 shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-3 pb-1 flex flex-col gap-2 px-2 py-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FilterBar({
  tags = [],
  selectedTagIds,
  onTagToggle,
  distanceKm,
  onDistanceChange,
  maxPrice,
  onMaxPriceChange,
  onApply,
  resultCount,
  activeCount = 0,
}: FilterBarProps) {
  const [search, setSearch] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <article className="bg-linen rounded-2xl flex flex-col p-5 gap-4 border border-border w-full max-w-xs">
      <div className="flex items-center justify-between">
        <p className="text-h1 font-bold">Filter</p>
        {activeCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-cream">
            {activeCount} active
          </span>
        )}
      </div>
      <div className="w-full h-px bg-border" />

      <div className="flex flex-col gap-3 divide-y divide-border">
        <FilterSection title="Tags">
          <Input
            placeholder="Search tags"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto">
            {filteredTags.map((tag) => (
              <TagLine
                key={tag.tagId}
                tagId={tag.tagId}
                name={tag.name}
                checked={selectedTagIds.includes(tag.tagId)}
                onToggle={onTagToggle}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Distance">
          <Slider
            label="Distance"
            min={1}
            max={50}
            unit="km"
            value={distanceKm}
            onChange={onDistanceChange}
          />
        </FilterSection>

        <FilterSection title="Price per hour">
          <Slider
            label="Maximum price"
            min={5}
            max={100}
            unit="€"
            value={maxPrice}
            onChange={onMaxPriceChange}
          />
        </FilterSection>
      </div>

      <div className="w-full h-px bg-border" />
      <div className="mx-auto">
        <Button onClick={onApply}>
          {resultCount !== undefined
            ? `Show ${resultCount} results`
            : 'Show results'}
        </Button>
      </div>
    </article>
  )
}

export function TagLine({
  tagId,
  name,
  checked,
  onToggle,
}: {
  tagId: string
  name: string
  checked: boolean
  onToggle: (tagId: string) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-1 rounded transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(tagId)}
        className="w-4 h-4 rounded border-gray-300 accent-primary"
      />
      <span className="text-sm">{name}</span>
    </label>
  )
}
