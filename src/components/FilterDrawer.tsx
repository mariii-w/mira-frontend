import { useState, type ComponentProps } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from './Button'
import { FilterBar } from './FilterBar'

export function FilterDrawer(props: ComponentProps<typeof FilterBar>) {
  const [open, setOpen] = useState(false)

  function handleApply() {
    props.onApply()
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" leadingIcon={<SlidersHorizontal />}>
          Filters
          {props.activeCount != null && props.activeCount > 0 && (
            <span className="ml-1 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-cream">
              {props.activeCount}
            </span>
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-xl overflow-y-auto p-4 flex flex-col gap-2"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Filters</Dialog.Title>
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <Button variant="icon" aria-label="Close filters">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <FilterBar {...props} onApply={handleApply} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
