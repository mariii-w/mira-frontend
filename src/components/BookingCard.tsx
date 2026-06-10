import { Check, CheckCheck, ChevronDown, ChevronUp, CreditCard, MapPin, ThumbsUp, X } from 'lucide-react'
import React, { useState } from 'react'
import { authFetch } from '../lib/queryClient'
import { Button } from './Button'

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

export interface AllowedAction {
  rel: string
  href: string
  method: string
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

export interface BookingDetails {
  bookingId: string
  listingId: string
  listing: BookingListingPreview
  consumer: BookingParticipant
  provider: BookingParticipant
  status: BookingStatus
  locationType: LocationType
  serviceAddress: BookingServiceAddress | null
  description: string
  totalPrice: number
  bookedStart: string
  bookedEnd: string
  createdAt: string
  confirmedAt: string | null
  paidAt: string | null
  providerCompletedAt: string | null
  consumerConfirmedAt: string | null
  consumerConfirmationType: string | null
  autoConfirmAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  expiresAt: string | null
  allowedActions: AllowedAction[]
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
  PENDING:               'bg-accent/15 text-accent',
  CONFIRMED:             'bg-accent/15 text-accent',
  PAID:                  'bg-primary/15 text-primary',
  AWAITING_CONFIRMATION: 'bg-primary/15 text-primary',
  COMPLETED:             'bg-foreground/10 text-muted',
  CANCELLED:             'bg-foreground/10 text-muted',
  EXPIRED:               'bg-foreground/10 text-muted',
  REFUSED:               'bg-foreground/10 text-muted',
}

const CARD_BORDER: Record<BookingStatus, string> = {
  PENDING:               'border-accent',
  CONFIRMED:             'border-accent',
  PAID:                  'border-primary',
  AWAITING_CONFIRMATION: 'border-primary',
  COMPLETED:             'border-border',
  CANCELLED:             'border-border',
  EXPIRED:               'border-border',
  REFUSED:               'border-border',
}

const TOGGLE_COLOR: Record<BookingStatus, string> = {
  PENDING:               'text-accent',
  CONFIRMED:             'text-accent',
  PAID:                  'text-primary',
  AWAITING_CONFIRMATION: 'text-primary',
  COMPLETED:             'text-foreground',
  CANCELLED:             'text-foreground',
  EXPIRED:               'text-foreground',
  REFUSED:               'text-foreground',
}

const ACTION_LABEL: Record<string, string> = {
  'cancel':               'Cancel',
  'accept':               'Accept Booking',
  'refuse':               'Refuse',
  'pay':                  'Pay',
  'mark-delivered':       'Mark as done',
  'acknowledge-delivery': 'Confirm service done',
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  'cancel':               <X size={13} />,
  'accept':               <Check size={13} />,
  'refuse':               <X size={13} />,
  'pay':                  <CreditCard size={13} />,
  'mark-delivered':       <CheckCheck size={13} />,
  'acknowledge-delivery': <ThumbsUp size={13} />,
}

const ACTION_VARIANT: Record<string, 'primary' | 'secondary'> = {
  'cancel':               'secondary',
  'refuse':               'secondary',
  'accept':               'primary',
  'pay':                  'primary',
  'mark-delivered':       'primary',
  'acknowledge-delivery': 'primary',
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
  onActionComplete: () => void
  mockDetail?: BookingDetails
}

export function BookingCard({ booking, onActionComplete, mockDetail }: BookingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<BookingDetails | null>(mockDetail ?? null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { month, day, time } = formatDate(booking.bookedStart)
  const hours     = durationHours(booking.bookedStart, booking.bookedEnd)
  const address   = formatAddress(booking.serviceAddress)
  const headingId = `booking-${booking.bookingId}-title`
  const detailsId = `booking-${booking.bookingId}-details`

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !detail && !mockDetail) {
      setLoadingDetail(true)
      try {
        const res = await authFetch(`/v1/bookings/${booking.bookingId}`)
        if (res.ok) setDetail(await res.json() as BookingDetails)
      } finally {
        setLoadingDetail(false)
      }
    }
  }

  async function handleAction(action: AllowedAction) {
    setLoadingAction(action.rel)
    setActionError(null)
    try {
      const res = await authFetch(action.href, { method: action.method })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setActionError(body?.detail ?? 'Something went wrong. Please try again.')
        return
      }
      onActionComplete()
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <article
      aria-labelledby={headingId}
      className={`bg-surface rounded-2xl border shadow-sm overflow-hidden ${CARD_BORDER[booking.status]}`}
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div
          aria-label={`${month} ${day} at ${time}`}
          className="flex flex-col items-center justify-center min-w-[3rem] text-center select-none self-center"
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
          <p className="text-small text-foreground font-semibold mt-1">
            {hours}h · {booking.totalPrice}€
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={booking.status} />
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={expanded ? 'Collapse booking details' : 'Expand booking details'}
            onClick={handleToggle}
            className={`transition-colors ${expanded ? TOGGLE_COLOR[booking.status] : 'text-muted hover:text-foreground'}`}
          >
            {expanded
              ? <ChevronUp  aria-hidden="true" size={18} />
              : <ChevronDown aria-hidden="true" size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div id={detailsId} className="bg-cream border-t border-border/20 px-4 pb-4 pt-3 sm:px-5">
          {loadingDetail && (
            <p role="status" aria-live="polite" className="text-small text-muted">Loading…</p>
          )}
          {detail && (
            <>
              {detail.description && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Description</p>
                  <p className="text-small text-foreground">{detail.description}</p>
                </div>
              )}
              {detail.autoConfirmAt && booking.status === 'AWAITING_CONFIRMATION' && (
                <p className="text-xs text-amber-700 mb-3">⚠ Auto-confirm if you don't respond</p>
              )}
              {actionError && (
                <p role="alert" className="text-small text-red-600 mb-3">{actionError}</p>
              )}
              {detail.allowedActions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.allowedActions.map((action) => (
                    <Button
                      key={action.rel}
                      variant={ACTION_VARIANT[action.rel] ?? 'secondary'}
                      size="sm"
                      leadingIcon={ACTION_ICON[action.rel]}
                      loading={loadingAction === action.rel}
                      disabled={loadingAction !== null}
                      onClick={() => handleAction(action)}
                      className="text-xs"
                    >
                      {ACTION_LABEL[action.rel] ?? action.rel}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
