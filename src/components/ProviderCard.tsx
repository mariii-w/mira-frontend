import { MapPin, ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './Button'
import type { ReactNode } from 'react'

export type ProviderCardVariant = 'compact' | 'full'

export interface ProviderService {
  name: string
  price: number
}

export interface ProviderCardProps {
  variant?: ProviderCardVariant
  firstName: string
  lastName: string
  avatar?: ReactNode
  distanceKm: number
  bio: string
  pricePerHour: number
  services?: ProviderService[]
  badges?: ReactNode
  onViewProfile?: () => void
  onMessage?: () => void
  className?: string
}

export function ProviderCard({
  variant = 'compact',
  firstName,
  lastName,
  avatar = null,
  distanceKm,
  bio,
  pricePerHour,
  services = [],
  badges = null,
  onViewProfile,
  onMessage,
  className,
}: ProviderCardProps) {
  const isFull = variant === 'full'
  const name = firstName  + " " + lastName[0] + "."
  return (
    <article
      className={cn(
        'bg-surface rounded-2xl flex flex-col',
        isFull ? 'p-5 gap-4 border border-border' : 'p-4 gap-3',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar stub — to be added by Andi */}
        {avatar}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={cn('font-heading font-bold text-foreground truncate', isFull ? 'text-body' : 'text-small')}>
            {name}
          </span>
          <span className="inline-flex items-center gap-1 text-muted text-small">
            <MapPin size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            {distanceKm} km away
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className={cn('text-foreground/80 leading-relaxed', isFull ? 'text-body' : 'text-small')}>
        {bio}
      </p>

      {/* Services — full variant only */}
      {isFull && services.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-label font-bold text-muted tracking-wide uppercase text-[10px]">
            Offers {services.length} service{services.length !== 1 ? 's' : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s.name}
                className="px-3 py-1 rounded-full border border-border text-small text-foreground bg-linen"
              >
                {s.name} · €{s.price}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges stub — to be added by Andi*/}
      {badges}

      {/* Divider + price */}
      <div className="mt-auto flex flex-col gap-3">
        <div
          className="border-t pt-3 flex items-center justify-end"
          style={{ borderColor: 'var(--color-grey-olive)' }}
        >
          <span
            className={cn('font-medium', isFull ? 'text-lg font-heading font-bold' : 'text-small')}
            style={{ color: 'var(--color-plum)' }}
          >
            from €{pricePerHour}/hr
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isFull && (
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<MessageCircle />}
              onClick={onMessage}
              className="flex-1"
            >
              Message
            </Button>
          )}
          <Button
            variant="primary"
            size={isFull ? 'md' : 'sm'}
            trailingIcon={<ArrowRight />}
            onClick={onViewProfile}
            className={isFull ? 'flex-1' : 'w-full'}
            aria-label={`View profile of ${firstName} ${lastName}`}
          >
            View Profile
          </Button>
        </div>
      </div>
    </article>
  )
}