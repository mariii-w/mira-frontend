import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { useState } from 'react'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'AWAITING_CONFIRMATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUSED'

export type LocationType = 'AT_CONSUMER' | 'AT_PROVIDER'

export interface BookingParticipant {
  userId: string
  name: string
  surname: string
}

export interface BookingServiceAddress {
  street: string
  houseNumber: string
  city: string
  postalCode: string
}

export interface BookingListingPreview {
  title: string
}

export interface BookingSummary {
  bookingId: string
  listingId: string
  listing: BookingListingPreview
  counterparty: BookingParticipant
  status: BookingStatus
  serviceAddress: BookingServiceAddress | null
  totalPrice: number
  bookedStart: string
  bookedEnd: string
  createdAt: string
}

export interface BookingCollection {
  items: BookingSummary[]
  cursor: { next: string | null } | null
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING:               'Pending',
  CONFIRMED:             'To pay',
  PAID:                  'Upcoming',
  AWAITING_CONFIRMATION: 'Confirm done',
  COMPLETED:             'Completed',
  CANCELLED:             'Cancelled',
  EXPIRED:               'Expired',
  REFUSED:               'Refused',
}

const STATUS_CLASS: Record<BookingStatus, string> = {
  PENDING:               'bg-amber-100 text-amber-800',
  CONFIRMED:             'bg-violet-100 text-violet-800',
  PAID:                  'bg-teal-100 text-teal-800',
  AWAITING_CONFIRMATION: 'bg-teal-100 text-teal-800',
  COMPLETED:             'bg-green-100 text-green-800',
  CANCELLED:             'bg-red-100 text-red-700',
  EXPIRED:               'bg-gray-100 text-gray-500',
  REFUSED:               'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      aria-label={`Booking status: ${STATUS_LABEL[status]}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
    day:   String(d.getDate()),
    time:  d.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

function durationHours(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3_600_000)
}

function formatAddress(addr: BookingServiceAddress | null): string | null {
  if (!addr) return null
  return `${addr.street} ${addr.houseNumber}, ${addr.city}`
}

export interface BookingCardProps {
  booking: BookingSummary
  renderExpanded?: (bookingId: string) => React.ReactNode
}

export function BookingCard({ booking, renderExpanded }: BookingCardProps) {
  const [expanded, setExpanded] = useState(false)

  const { month, day, time } = formatDate(booking.bookedStart)
  const hours     = durationHours(booking.bookedStart, booking.bookedEnd)
  const address   = formatAddress(booking.serviceAddress)
  const headingId = `booking-${booking.bookingId}-title`
  const detailsId = `booking-${booking.bookingId}-details`

  return (
    <article
      aria-labelledby={headingId}
      className="bg-surface rounded-2xl border border-border/20 shadow-sm overflow-hidden"
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div
          aria-label={`${month} ${day} at ${time}`}
          className="flex flex-col items-center justify-center min-w-[3rem] text-center select-none"
        >
          <span aria-hidden="true" className="text-xs font-semibold text-muted uppercase tracking-wide leading-none">
            {month}
          </span>
          <span aria-hidden="true" className="text-h2 font-bold text-foreground leading-tight">
            {day}
          </span>
          <span aria-hidden="true" className="text-xs text-muted leading-none mt-0.5">
            {time}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 id={headingId} className="font-heading text-body font-semibold text-foreground truncate">
            {booking.listing.title}
          </h3>
          <p className="text-small text-muted mt-0.5">
            {booking.counterparty.name} {booking.counterparty.surname}
          </p>
          {address && (
            <p className="flex items-center gap-1 text-small text-muted mt-1">
              <MapPin aria-hidden="true" size={12} className="shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          )}
          <p className="text-small text-muted mt-1">
            {hours}h · {booking.totalPrice}€
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={booking.status} />
          {renderExpanded && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={expanded ? 'Collapse booking details' : 'Expand booking details'}
              onClick={() => setExpanded((v) => !v)}
              className="text-muted hover:text-foreground transition-colors"
            >
              {expanded
                ? <ChevronUp  aria-hidden="true" size={18} />
                : <ChevronDown aria-hidden="true" size={18} />}
            </button>
          )}
        </div>
      </div>

      {renderExpanded && expanded && (
        <div id={detailsId} className="border-t border-border/20 px-4 pb-4 pt-3 sm:px-5">
          {renderExpanded(booking.bookingId)}
        </div>
      )}
    </article>
  )
}
