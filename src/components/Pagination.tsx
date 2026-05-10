import { ChevronLeft, ChevronRight } from 'lucide-react'

export type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  ariaLabel?: string
  className?: string
}

type PageItem = number | 'ellipsis'

function getPageItems(current: number, total: number, siblings: number): PageItem[] {
  const pages = new Set<number>([0, total - 1, current])
  for (let i = 1; i <= siblings; i++) {
    if (current - i >= 0) pages.add(current - i)
    if (current + i < total) pages.add(current + i)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: PageItem[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('ellipsis')
    out.push(p)
  })
  return out
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  ariaLabel = 'Pagination',
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages, siblingCount)
  const base =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border text-small font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40'
  const inactive = `${base} bg-surface border-border text-foreground hover:bg-linen`
  const active = `${base} bg-primary border-primary text-cream cursor-default`

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex items-center gap-2 list-none m-0 p-0">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            aria-label="Go to previous page"
            className={inactive}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </li>

        {items.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <li key={`e-${idx}`}>
                <span
                  className="inline-flex h-10 w-10 items-center justify-center text-muted select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              </li>
            )
          }
          const isCurrent = item === page
          const n = item + 1
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => !isCurrent && onPageChange(item)}
                aria-label={isCurrent ? `Page ${n}, current page` : `Go to page ${n}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={isCurrent ? active : inactive}
              >
                {n}
              </button>
            </li>
          )
        })}

        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Go to next page"
            className={inactive}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
}