import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

interface PopoverCtx {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentId: string
}

const Ctx = createContext<PopoverCtx | null>(null)

function usePopover() {
  const c = useContext(Ctx)
  if (!c) throw new Error('Popover must be used inside <Popover.Root>')
  return c
}

export function Root({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentId = useId()
  return (
    <Ctx.Provider value={{ open, setOpen, triggerRef, contentId }}>
      {children}
    </Ctx.Provider>
  )
}

interface TriggerChildProps {
  onClick?: (event: React.MouseEvent) => void
}

export function Trigger({
  children,
}: {
  asChild?: boolean
  children: ReactElement<TriggerChildProps>
}) {
  const { open, setOpen, triggerRef, contentId } = usePopover()
  const original = children.props.onClick

  return cloneElement(children, {
    ref: triggerRef,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    'data-state': open ? 'open' : 'closed',
    onClick: (event: React.MouseEvent) => {
      original?.(event)
      if (!event.defaultPrevented) setOpen(!open)
    },
  } as Partial<TriggerChildProps> & Record<string, unknown>)
}

export function Portal({ children }: { children: ReactNode }) {
  return typeof document === 'undefined' ? null : createPortal(children, document.body)
}

interface ContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

export function Content({
  children,
  align = 'center',
  sideOffset = 0,
  className,
}: ContentProps) {
  const { open, setOpen, triggerRef, contentId } = usePopover()
  const contentRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return
    const t = triggerRef.current.getBoundingClientRect()
    const c = contentRef.current.getBoundingClientRect()
    const left =
      align === 'start' ? t.left
      : align === 'end' ? t.right - c.width
      : t.left + t.width / 2 - c.width / 2
    setPos({
      top: t.bottom + sideOffset + window.scrollY,
      left: left + window.scrollX,
    })
  }, [open, align, sideOffset, triggerRef])

  useEffect(() => {
    if (!open) return

    function onMouse(e: MouseEvent) {
      const target = e.target as Node
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && contentRef.current) {
        const items = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      data-state="open"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
      className={className}
    >
      {children}
    </div>
  )
}