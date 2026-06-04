import { SquarePen } from 'lucide-react'
import { Button } from './Button'

export type PublicationStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DELETED'
export type ModerationStatus = 'VISIBLE' | 'BLOCKED'

export interface MyListingSummary {
  listingId: string
  title: string
  description: string
  price: number
  publicationStatus: PublicationStatus
  moderationStatus: ModerationStatus
  author: { name: string; surname: string }
  publishedAt: string | null
  location: { city: string; postalCode: string; serviceRadiusKm: number }
  primaryMedia?: { mediaId: string; url: string; altText?: string }
  tags: Array<{ tagId: string; name: string; isBarrierefrei: boolean; isActive: boolean }>
}

interface MyListingCardProps {
  listing: MyListingSummary
  onEdit: (listingId: string) => void
}

const STATUS_OVERLAY: Partial<Record<PublicationStatus, { label: string; bg: string }>> = {
  DRAFT:   { label: 'DRAFT',   bg: 'bg-charcoal/75' },
  PAUSED:  { label: 'PAUSED',  bg: 'bg-charcoal/75' },
  DELETED: { label: 'DELETED', bg: 'bg-charcoal/75' },
}

export function MyListingCard({ listing, onEdit }: MyListingCardProps) {
  const overlay = STATUS_OVERLAY[listing.publicationStatus]

  return (
    <article className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border/20 flex flex-col sm:flex-row">
      {/* Image — full-width banner on mobile, fixed sidebar on sm+ */}
      <div className="relative h-48 sm:h-auto sm:w-44 shrink-0 bg-linen">
        {listing.primaryMedia ? (
          <img
            src={listing.primaryMedia.url}
            alt={listing.primaryMedia.altText ?? listing.title}
            className="w-full h-full object-cover"
          />
        ) : null}
        {overlay && (
          <div className={`absolute inset-0 flex items-center justify-center ${overlay.bg}`}>
            <span className="font-heading font-bold text-label tracking-widest text-cream">
              {overlay.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 p-5 gap-3 min-h-[140px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading font-bold text-h2 text-foreground leading-snug">
            {listing.title}
          </h2>
          <p className="text-small text-muted line-clamp-3">{listing.description}</p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            trailingIcon={<SquarePen />}
            onClick={() => onEdit(listing.listingId)}
          >
            Edit
          </Button>
        </div>
      </div>
    </article>
  )
}
