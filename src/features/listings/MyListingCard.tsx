import { SquarePen } from 'lucide-react'
import { Button } from '../../common/ui/Button'
import { mediaUrl } from '../../lib/mediaUrl'
import type {
  AccessibilityGenerationStatus,
  MyListingSummary,
  PublicationStatus,
} from '../../api/model'

export type { MyListingSummary, PublicationStatus } from '../../api/model'
export type VlmStatus = AccessibilityGenerationStatus

interface MyListingCardProps {
  listing: MyListingSummary
  onEdit: (listingId: string) => void
}

const STATUS_OVERLAY: Partial<Record<PublicationStatus, { label: string; bg: string }>> = {
  DRAFT:   { label: 'DRAFT',   bg: 'bg-charcoal/75' },
  PAUSED:  { label: 'PAUSED',  bg: 'bg-charcoal/75' },
  DELETED: { label: 'DELETED', bg: 'bg-charcoal/75' },
}

const STATUS_BADGE: Record<PublicationStatus, { label: string; className: string }> = {
  ACTIVE:  { label: 'Active',  className: 'bg-green-100 text-green-800' },
  DRAFT:   { label: 'Draft',   className: 'bg-gray-100 text-gray-500' },
  PAUSED:  { label: 'Paused',  className: 'bg-amber-100 text-amber-700' },
  DELETED: { label: 'Deleted', className: 'bg-red-100 text-red-700' },
}

export function MyListingCard({ listing, onEdit }: MyListingCardProps) {
  const overlay = STATUS_OVERLAY[listing.publicationStatus]
  const badge = STATUS_BADGE[listing.publicationStatus]
  const headingId = `listing-title-${listing.listingId}`

  return (
    <article
      aria-labelledby={headingId}
      className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border/20 flex flex-col sm:flex-row"
    >
      {/* Image — full-width banner on mobile, fixed sidebar on sm+ */}
      <div className="relative h-48 sm:h-auto sm:w-44 shrink-0 bg-linen">
        {listing.primaryMedia ? (
          <img
            src={mediaUrl(listing.primaryMedia.url)}
            alt={(listing.primaryMedia.altTextStatus == null || listing.primaryMedia.altTextStatus === 'COMPLETED') && listing.primaryMedia.altText ? listing.primaryMedia.altText : listing.title}
            className="w-full h-full object-cover"
          />
        ) : null}
        {overlay && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center ${overlay.bg}`}
          >
            <span className="font-heading font-bold text-label tracking-widest text-cream">
              {overlay.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 p-5 gap-3 min-h-[140px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              id={headingId}
              className="font-heading font-bold text-h2 text-foreground leading-snug"
            >
              {listing.title}
              {overlay && <span className="sr-only"> ({overlay.label})</span>}
            </h2>
            <span
              aria-hidden="true"
              className={`text-label font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
          <p className="text-small text-muted line-clamp-3">{listing.description}</p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            trailingIcon={<SquarePen />}
            aria-label={`Edit "${listing.title}"`}
            onClick={() => onEdit(listing.listingId)}
          >
            Edit
          </Button>
        </div>
      </div>
    </article>
  )
}
