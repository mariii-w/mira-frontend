import { useState, useRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'
import { Input } from './Input'
import { Button } from './Button'
import { Slider } from './Slider'

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
  const contentId = useId()

  return (
    <fieldset className="border-0 p-0 m-0 flex flex-col">
      <legend className="w-full p-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full py-1 group"
          aria-expanded={open}
          aria-controls={contentId}
        >
          <span className="text-h2 font-medium">{title}</span>
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
      </legend>
      <div
        id={contentId}
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
    </fieldset>
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
  const [prevSearch, setPrevSearch] = useState('')
  const [activeTagIndex, setActiveTagIndex] = useState(0)
  const tagRefs = useRef<(HTMLInputElement | null)[]>([])

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  if (prevSearch !== search) {
    setPrevSearch(search)
    setActiveTagIndex(0)
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    const count = filteredTags.length
    if (count === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (activeTagIndex + 1) % count
      setActiveTagIndex(next)
      tagRefs.current[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (activeTagIndex - 1 + count) % count
      setActiveTagIndex(prev)
      tagRefs.current[prev]?.focus()
    }
  }

  return (
    <form
      aria-label="Filter services"
      onSubmit={e => { e.preventDefault(); onApply() }}
      className="bg-linen rounded-2xl flex flex-col p-5 gap-4 border border-border w-full max-w-xs"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-h1 font-bold">Filter</h2>
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
          <ul
            role="list"
            aria-label="Available tags"
            className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto list-none p-0 m-0"
            onKeyDown={handleTagKeyDown}
          >
            {filteredTags.map((tag, index) => (
              <li key={tag.tagId}>
                <TagLine
                  tagId={tag.tagId}
                  name={tag.name}
                  checked={selectedTagIds.includes(tag.tagId)}
                  onToggle={onTagToggle}
                  tabIndex={index === activeTagIndex ? 0 : -1}
                  inputRef={el => { tagRefs.current[index] = el }}
                />
              </li>
            ))}
          </ul>
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
        <Button type="submit">
          {resultCount !== undefined
            ? `Show ${resultCount} results`
            : 'Show results'}
        </Button>
      </div>
    </form>
  )
}

export function TagLine({
  tagId,
  name,
  checked,
  onToggle,
  tabIndex = 0,
  inputRef,
}: {
  tagId: string
  name: string
  checked: boolean
  onToggle: (tagId: string) => void
  tabIndex?: number
  inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-1 rounded transition-colors">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        tabIndex={tabIndex}
        onChange={() => onToggle(tagId)}
        className="w-4 h-4 rounded border-gray-300 accent-primary"
      />
      <span className="text-sm">{name}</span>
    </label>
  )
}
