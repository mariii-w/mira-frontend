import * as Popover from './Popover'
import * as Switch from './Switch'
import { Accessibility, ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { useAccessibilityStore } from '../stores/accessibility'

export function AccessibilityPanel() {
  const easyRead = useAccessibilityStore((s) => s.easyRead)
  const reducedMotion = useAccessibilityStore((s) => s.reducedMotion)
  const setEasyRead = useAccessibilityStore((s) => s.setEasyRead)
  const setReducedMotion = useAccessibilityStore((s) => s.setReducedMotion)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          leadingIcon={<Accessibility />}
          trailingIcon={<ChevronDown />}
          className="border-cream/30 text-cream hover:bg-cream/10 data-[state=open]:bg-cream/10"
        >
          Accessibility
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg"
        >
          <Row
            id="a11y-easy-read"
            title="Leichte Sprache"
            description="Switch to easy-to-read German"
            checked={easyRead}
            onCheckedChange={setEasyRead}
          />
          <div className="my-1 h-px bg-border/30" />
          <Row
            id="a11y-reduce-motion"
            title="Reduce motion"
            description="Turn off page animations"
            checked={reducedMotion}
            onCheckedChange={setReducedMotion}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

interface RowProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

function Row({ id, title, description, checked, onCheckedChange }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-body font-bold text-foreground cursor-pointer">
          {title}
        </label>
        <span id={`${id}-desc`} className="text-small text-muted">{description}</span>
      </div>
      <Switch.Root
        id={id}
        aria-describedby={`${id}-desc`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-grey-olive/40 data-[state=checked]:bg-primary transition-colors duration-150"
      >
        <Switch.Thumb className="block h-5 w-5 rounded-full bg-surface shadow translate-x-0.5 data-[state=checked]:translate-x-[22px] transition-transform duration-150" />
      </Switch.Root>
    </div>
  )
}