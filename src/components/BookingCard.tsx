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
