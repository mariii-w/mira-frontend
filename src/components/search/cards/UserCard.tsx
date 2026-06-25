import { ArrowRight, Check, MapPin } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { AvatarIcon } from '../../AvatarIcon'
import { ProviderServicesSection } from './ProviderServicesSection'
import { mediaUrl } from '../../../lib/mediaUrl'
import type { ProviderServiceSummary } from '../../../lib/providerServiceSummary'
import type { PublicProfileResponse } from '../../../api/model'

interface UserCardProps {
  profile: PublicProfileResponse
  easyRead: boolean
  providerSummary?: ProviderServiceSummary
}

function getDisplayName(profile: PublicProfileResponse): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username
}

export function UserCard({ profile, easyRead, providerSummary }: UserCardProps) {
  const isProvider = profile.userType === 'PROVIDER'
  const displayName = getDisplayName(profile)
  const bio = (easyRead && profile.simplifiedBio) || profile.bio
  const verified = profile.verified
  const hasPrice = isProvider && providerSummary?.startingPrice != null
  const hasServices = isProvider && providerSummary != null

  const baseId = useId()
  const nameId = `${baseId}-name`
  const badgeId = `${baseId}-badge`
  const priceId = `${baseId}-price`
  const verifiedId = `${baseId}-verified`
  const cityId = `${baseId}-city`
  const bioId = `${baseId}-bio`
  const servicesId = `${baseId}-services`
  const describedBy = [
    badgeId,
    hasPrice ? priceId : null,
    verified ? verifiedId : null,
    profile.city ? cityId : null,
    bio ? bioId : null,
    hasServices ? servicesId : null,
  ].filter(Boolean).join(' ')

  const roleDotBg = isProvider ? 'bg-forest' : 'bg-accent'
  const badgeBg = isProvider ? 'bg-mint text-forest' : 'bg-blush text-accent'
  const actionBg = isProvider
    ? 'bg-forest text-cream hover:bg-forest/90 active:bg-forest/90 focus-visible:ring-forest'
    : 'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover focus-visible:ring-accent'

  return (
    <div className="bg-linen rounded-2xl flex flex-col p-3 gap-3 border border-border w-full h-full">
      <div
        role="group"
        tabIndex={0}
        aria-labelledby={nameId}
        aria-describedby={describedBy}
        className="flex gap-3 flex-1"
      >
        <div className="relative shrink-0 self-start">
          <AvatarIcon
            firstName={profile.firstName}
            lastName={profile.lastName}
            picture={profile.profileMedia ? mediaUrl(profile.profileMedia.url) : undefined}
            size={64}
            bgColorClassName={isProvider ? 'bg-forest' : 'bg-accent'}
          />
          {verified && (
            <span
              role="img"
              aria-label="Verified profile"
              className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-forest text-cream ring-2 ring-linen"
            >
              <Check aria-hidden="true" size={12} />
            </span>
          )}
          {verified && <span id={verifiedId} className="sr-only">Verified profile</span>}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex gap-4 items-start">
            <div className="min-w-0">
              <h2 id={nameId} className="text-h2">{displayName}</h2>
              <span id={badgeId} className={`inline-flex items-center gap-1.5 mt-1 text-label font-medium px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${roleDotBg}`} />
                {isProvider ? 'Provider' : 'Consumer'}
              </span>
            </div>
            {isProvider && providerSummary?.startingPrice != null && (
              <div id={priceId} className="shrink-0 ml-auto text-right">
                <p className="text-label text-muted uppercase tracking-wide">From</p>
                <p className="text-body font-bold text-foreground">{providerSummary.startingPrice}€/hr</p>
              </div>
            )}
          </div>

          {profile.city && (
            <div id={cityId} className="flex items-center gap-1 text-small text-muted">
              <MapPin aria-hidden="true" size={14} />
              <span>{profile.city}</span>
            </div>
          )}

          {bio && <p id={bioId} className="text-small text-foreground line-clamp-2">{bio}</p>}

          {isProvider && providerSummary && (
            <div id={servicesId}>
              <ProviderServicesSection serviceCount={providerSummary.serviceCount} topTags={providerSummary.topTags} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <Link
          to="/"
          aria-label={`View profile of ${displayName}`}
          className={`relative inline-flex w-full items-center justify-center gap-2 font-medium rounded-full cursor-pointer transition-colors duration-150 h-12 px-6 text-body no-underline [&_svg]:size-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${actionBg}`}
        >
          View Profile
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
