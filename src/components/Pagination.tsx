import { ChevronLeft, ChevronRight } from 'lucide-react'

export type PaginationProps = {
  onPrevious: () => void
  onNext: () => void
  disablePrevious?: boolean
  disableNext?: boolean
  ariaLabel?: string
  className?: string
}

export function Pagination({
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
  ariaLabel = 'Pagination',
  className = '',
}: PaginationProps) {
  const btn =
    'inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-linen text-foreground font-bold cursor-pointer transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex items-center gap-4 list-none m-0 p-0">
        <li>
          <button type="button" onClick={onPrevious} disabled={disablePrevious} className={btn}>
            <ChevronLeft size={18} aria-hidden="true" />
            Previous
          </button>
        </li>
        <li>
          <button type="button" onClick={onNext} disabled={disableNext} className={btn}>
            Next
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
}