import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'
import { Input } from './Input'
import { Button } from './Button'
import { Slider } from './Slider'

export interface tagList {
  name: string
  checked: boolean
}

interface FilterBarProps {
  tagList: tagList[]
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

export function FilterBar({ tagList = [] }: FilterBarProps) {
    
  const [search, setSearch] = useState('')

  const filteredTags = tagList?.filter(tag => 
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <article className="bg-linen rounded-2xl flex flex-col p-5 gap-4 border border-border w-full max-w-xs">
      <p className="text-h1 font-bold">Filter</p>
      <div className="w-full h-px bg-border" />
      
      <div className="flex flex-col gap-3 divide-y divide-border">
        <FilterSection title="Tags">
          <Input 
            placeholder="Tags suchen" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto">
            {filteredTags.map((tag, index) => (
              <TagLine key={`${tag.name}-${index}`} name={tag.name} checked={tag.checked} />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Entfernung">
          <Slider label={''} min={10} max={50} unit='km'/>
        </FilterSection>

        <FilterSection title="Preis">
          <Slider label={''} min={5} max={100} unit='€'/>
        </FilterSection>
      </div>

      <div className="w-full h-px bg-border" />
      <div className='mx-auto'>
        <Button className="">Zeige Ergebnisse</Button>
      </div>
    </article>
  )
}

export function TagLine({ name, checked }: { name: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-1 rounded transition-colors">
      <input 
        type="checkbox" 
        defaultChecked={checked}
        className="w-4 h-4 rounded border-gray-300 accent-primary" 
      />
      <span className="text-sm">{name}</span>
    </label>
  )
}