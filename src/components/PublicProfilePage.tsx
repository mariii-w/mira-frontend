import { useId, useState } from 'react'
import { Check, MapPin } from 'lucide-react'
import { Navbar } from './Navbar'
import { AvatarIcon } from './AvatarIcon'
import type { ServiceCardProps } from './ServiceCard'
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
        role="img"
        aria-label={`Verified: ${credentials.map((c) => c.name).join(', ')}`}
        tabIndex={0}
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
        <div aria-hidden="true" className="bg-linear-to-r from-primary to-accent h-40 sm:h-50 w-full" />
        <section aria-label="Profile">
          <div className="container mx-auto max-w-6xl -mt-16 sm:-mt-20 px-4 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* User info */}
            <div className="col-span-1 lg:col-span-2 rounded-2xl">
              <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-4">
                <AvatarIcon
                  size={140}
                  className="border-4 border-cream shrink-0 animate-scale-in"
                  firstName={userFirstName}
                  lastName={userLastName}
                  picture={pictureUrl}
                />
                <div className="lg:pt-20 flex flex-col gap-3 items-center lg:items-start py-2 animate-fade-in-up [animation-delay:100ms]">
                  <div className="flex flex-row gap-3 items-center flex-wrap justify-center lg:justify-start mt-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold">
                      {userFirstName} {userLastName}
                    </h1>
                    {verified && credentials.length > 0 && (
                      <VerifiedBadge credentials={credentials} />
                    )}
                  </div>
                  <p className="text-sm text-muted">@{username}</p>
                  <p className={`text-xl font-bold ${isProvider ? 'text-primary' : 'text-accent'}`}>
                    {isProvider ? 'Provider' : 'Consumer'}
                  </p>
                  {city && (
                    <p className="flex items-center gap-1 text-sm font-bold text-border">
                      <MapPin size={16} aria-hidden="true" />
                      <span className="sr-only">Location: </span>
                      {city}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/* How it works */}
            <section aria-labelledby="how-it-works-heading" className="lg:col-start-3 lg:row-start-2 lg:row-span-3 bg-linen border border-border rounded-2xl p-6 flex flex-col gap-4 animate-fade-in-up [animation-delay:150ms]">
              <h2 id="how-it-works-heading" className="font-heading font-bold text-h2">
                {isProvider ? 'How to book' : 'How it works'}
              </h2>
              <div className="w-full h-px bg-border" />
              <ol id="how-it-works-steps" className="flex flex-col gap-4">
                {(isProvider
                  ? [
                      { title: 'Explore services', desc: 'Browse the services this provider offers below.' },
                      { title: 'Pick a session', desc: 'Choose a date and time that works for you.' },
                      { title: 'Book & confirm', desc: 'Send a booking request and wait for confirmation.' },
                      { title: 'Pay & enjoy', desc: 'Pay for the session and receive the service.' },
                    ]
                  : [
                      { title: 'Create your profile', desc: 'Sign up and tell providers a bit about yourself.' },
                      { title: 'Browse services', desc: 'Search for services that match your needs.' },
                      { title: 'Book a session', desc: 'Pick a provider and request a booking.' },
                      { title: 'Pay & enjoy', desc: 'Pay for the session and receive the service.' },
                    ]
                ).map((step, i) => (
                  <li key={i} className="flex gap-3 items-start rounded-lg p-1 -m-1">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-small font-bold ${isProvider ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-body">{step.title}</p>
                      <p className="text-small text-muted">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* About */}
            <section aria-labelledby="public-about-heading" className="col-span-1 lg:col-span-2 lg:row-start-2 bg-linen border border-border rounded-2xl p-6 flex flex-col gap-3 animate-fade-in-up [animation-delay:250ms]">
              <h2 id="public-about-heading" className="font-heading font-bold text-h2">About me</h2>
              <div id="public-about-content" className="flex flex-col gap-3">
                {!easyRead && selfSummary && <p>{selfSummary}</p>}
                {displayBio && <p>{displayBio}</p>}
                {!displayBio && !selfSummary && (
                  <p className="text-muted text-small">No description provided.</p>
                )}
              </div>
            </section>

            {/* Services */}
            {isProvider && publicServiceListings.length > 0 && (
              <section
                aria-labelledby="services-heading"
                className="col-span-1 lg:col-span-2 lg:row-start-3 bg-linen border border-border rounded-2xl p-6 animate-fade-in-up [animation-delay:350ms]"
              >
                <h2 id="services-heading" className="font-heading font-bold text-h2 mb-4">Services</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {publicServiceListings.map((listing) => (
                    <a
                      key={listing.link}
                      href={listing.link}
                      className="group flex flex-col gap-2 no-underline rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-border/20">
                        {listing.pictureLink && (
                          <img
                            src={listing.pictureLink}
                            alt={listing.pictureAltTextStatus === 'COMPLETED' && listing.pictureAltText ? listing.pictureAltText : ''}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <p className="text-small font-semibold text-foreground">{listing.label}</p>
                      <p className="text-small text-muted">From {listing.hourRate}€/h</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
