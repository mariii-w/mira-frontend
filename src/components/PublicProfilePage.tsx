import { useId, useState } from 'react'
import { Check, MapPin, MessageCircle } from 'lucide-react'
import { Navbar } from './Navbar'
import { AvatarIcon } from './AvatarIcon'
import { ServiceCard, type ServiceCardProps } from './ServiceCard'
import { useAccessibilityStore } from '../stores/accessibility'
import type { VerifiedCredentialResponse } from '../api/model'

interface PublicProfilePageProps {
  userFirstName: string
  userLastName: string
  username: string
  selfSummary: string
  bio: string | null
  simplifiedBio: string | null
  city: string
  pictureUrl?: string
  isProvider: boolean
  verified: boolean
  credentials: VerifiedCredentialResponse[]
  publicServiceListings: ServiceCardProps[]
}

function VerifiedBadge({ credentials }: { credentials: VerifiedCredentialResponse[] }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipId = useId()

  return (
    <span className="relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={showTooltip ? tooltipId : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-small font-medium bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
      >
        <Check size={14} aria-hidden="true" />
        Verified
      </span>
      {showTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-background px-3 py-2 text-left text-small text-foreground shadow-lg ring-1 ring-border"
        >
          <span className="block font-semibold">Verified credentials</span>
          <span className="mt-1 block">
            {credentials.map((c) => c.name).join(', ')}
          </span>
        </span>
      )}
    </span>
  )
}

export function PublicProfilePage({
  userFirstName,
  userLastName,
  username,
  selfSummary,
  bio,
  simplifiedBio,
  city,
  pictureUrl,
  isProvider,
  verified,
  credentials,
  publicServiceListings,
}: PublicProfilePageProps) {
  const easyRead = useAccessibilityStore((s) => s.easyRead)
  const displayBio = (easyRead && simplifiedBio) || bio

  return (
    <>
      <Navbar />
      <main id="main-content">
        <section>
          <div className="bg-linear-to-r from-primary to-accent h-40 sm:h-50 w-full" />
        </section>
        <section>
          <div className="container mx-auto max-w-6xl -mt-16 sm:-mt-20 px-4 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* User info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-4">
                <AvatarIcon
                  size={140}
                  className="border-4 border-cream shrink-0"
                  firstName={userFirstName}
                  lastName={userLastName}
                  picture={pictureUrl}
                />
                <div className="lg:pt-20 flex flex-col gap-3 items-center lg:items-start py-2">
                  <div className="flex flex-row gap-3 items-center flex-wrap justify-center lg:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-semibold">
                      {userFirstName} {userLastName}
                    </h1>
                    {verified && credentials.length > 0 && (
                      <VerifiedBadge credentials={credentials} />
                    )}
                  </div>
                  <p className="text-sm text-muted">@{username}</p>
                  <p className="text-xl font-bold text-primary">
                    {isProvider ? 'Provider' : 'Customer'}
                  </p>
                  {city && (
                    <p className="flex items-center gap-1 text-sm font-bold text-border">
                      <MapPin size={16} />
                      {city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions — on mobile renders after user info, on desktop sticks to right column */}
            {isProvider && (
              <div className="lg:col-start-3 lg:row-start-2 lg:row-span-3 bg-linen border border-border rounded-2xl p-6">
                <p className="text-h1 font-bold">Quick Actions</p>
                <div className="w-full mx-auto h-px bg-border my-5" />
                <div className="flex flex-col w-full gap-3">
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center gap-2 font-medium rounded-full cursor-pointer transition-colors duration-150 h-11 w-full px-4 text-body border border-border bg-cream text-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 [&_svg]:size-[18px]"
                  >
                    <MessageCircle aria-hidden="true" />
                    Message me
                  </button>
                </div>
              </div>
            )}

            {/* About */}
            <div className="col-span-1 lg:col-span-2 lg:row-start-2 bg-linen border border-border rounded-2xl p-6 flex flex-col gap-3">
              <h2 className="font-heading font-bold text-h2">About me</h2>
              {!easyRead && selfSummary && <p>{selfSummary}</p>}
              {displayBio && <p>{displayBio}</p>}
              {!displayBio && !selfSummary && (
                <p className="text-muted text-small">No description provided.</p>
              )}
            </div>

            {/* Services */}
            {isProvider && publicServiceListings.length > 0 && (
              <div className="col-span-1 lg:col-span-2 lg:row-start-3 bg-linen border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-h2 mb-4">Services</h2>
                <div className="flex flex-col gap-4">
                  {publicServiceListings.map((listing) => (
                    <ServiceCard key={listing.link} {...listing} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
