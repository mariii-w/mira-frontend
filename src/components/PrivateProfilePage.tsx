import { Briefcase, Calendar, Check, ClipboardPen, Mail, MapPin, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'
import { MyListingCard, type MyListingSummary } from './MyListingCard'
import { cn } from '../lib/cn'

interface PrivateProfilePageProps {
  userFirstName: string
  userLastName: string
  selfSummary: string
  bio: string | null
  city: string
  pictureUrl?: string
  isProvider: boolean
  ownerListings: MyListingSummary[]
  onEditClick: () => void
  onEditListing: (listingId: string) => void
}

const QUICK_ACTION_VARIANT = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover',
  secondary: 'bg-transparent text-foreground border border-charcoal hover:bg-charcoal/5 active:bg-charcoal/10',
} as const

function QuickActionLink({ to, variant = 'primary', icon, children }: {
  to: string
  variant?: keyof typeof QUICK_ACTION_VARIANT
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'relative inline-flex items-center justify-center w-full gap-2 font-medium rounded-full transition-colors duration-150 h-11 px-5 text-body [&_svg]:size-[18px] no-underline',
        QUICK_ACTION_VARIANT[variant],
      )}
    >
      <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>
      {children}
    </Link>
  )
}

export function PrivateProfilePage({
  userFirstName,
  userLastName,
  selfSummary,
  bio,
  city,
  pictureUrl,
  isProvider,
  ownerListings,
  onEditClick,
  onEditListing,
}: PrivateProfilePageProps) {
  return (
    <>
      <main id="main-content">
        <div aria-hidden="true" className="bg-linear-to-r from-primary to-accent h-40 sm:h-50 w-full" />
        <section aria-label="Profile">
          <div className="container mx-auto max-w-6xl -mt-16 sm:-mt-20 px-4 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* User info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-4">
                <AvatarIcon
                  size={140}
                  className="border-4 border-cream shrink-0 animate-scale-in"
                  firstName={userFirstName}
                  lastName={userLastName}
                  picture={pictureUrl}
                />
                <div className="lg:pt-20 flex flex-col gap-1 items-center lg:items-start py-2 animate-fade-in-up [animation-delay:100ms]">
                  <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start mt-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold">
                      {userFirstName} {userLastName}
                    </h1>
                    <Button size="md" trailingIcon={<ClipboardPen />} onClick={onEditClick}>
                      Edit Profile
                    </Button>
                  </div>
                  <p className="text-xl font-bold text-primary">
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

            {/* Quick Actions — on mobile renders after user info, on desktop sticks to right column */}
            {isProvider && (
              <nav aria-label="Quick actions" className="lg:col-start-3 lg:row-start-2 lg:row-span-3 bg-linen border border-border rounded-2xl p-6 animate-fade-in-up [animation-delay:150ms]">
                <h2 className="text-h1 font-bold">Quick Actions</h2>
                <div className="w-full mx-auto h-px bg-border my-5" />
                <div className="flex flex-col w-full gap-3">
                  <QuickActionLink to="/my-listings" variant="primary" icon={<Briefcase />}>
                    My Services
                  </QuickActionLink>
                  <QuickActionLink to="/create-listing" variant="accent" icon={<Plus />}>
                    Create Service
                  </QuickActionLink>
                  <QuickActionLink to="/calendar" variant="secondary" icon={<Calendar />}>
                    Calendar
                  </QuickActionLink>
                  <QuickActionLink to="/my-bookings" variant="secondary" icon={<Mail />}>
                    My Bookings
                  </QuickActionLink>
                </div>
                <div className="w-full mx-auto h-px bg-border my-5" />
                <div className="flex flex-col w-full">
                  <QuickActionLink to="/my-credentials" variant="primary" icon={<Check />}>
                    Get Verified
                  </QuickActionLink>
                </div>
              </nav>
            )}

            {/* About */}
            <section aria-labelledby="private-about-heading" className="col-span-1 lg:col-span-2 lg:row-start-2 bg-linen border border-border rounded-2xl p-6 flex flex-col gap-3 animate-fade-in-up [animation-delay:250ms]">
              <h2 id="private-about-heading" className="font-heading font-bold text-h2">About me</h2>
              <div className="flex flex-col gap-3">
                {selfSummary && <p>{selfSummary}</p>}
                {bio && <p>{bio}</p>}
                {!selfSummary && !bio && (
                  <p className="text-muted text-small">No description provided.</p>
                )}
              </div>
            </section>

            {/* Services */}
            {isProvider && (
              <section aria-labelledby="my-services-heading" aria-describedby="my-services-count" className="col-span-1 lg:col-span-2 lg:row-start-3 bg-linen border border-border rounded-2xl p-6 animate-fade-in-up [animation-delay:350ms]">
                <h2 id="my-services-heading" className="font-heading font-bold text-h2 mb-4">My Services</h2>
                {ownerListings.length > 0
                  ? (
                    <>
                      <p id="my-services-count" className="sr-only">{ownerListings.length} active {ownerListings.length === 1 ? 'service' : 'services'}</p>
                      <div className="flex flex-col gap-4">
                        {ownerListings.map((listing) => (
                          <MyListingCard key={listing.listingId} listing={listing} onEdit={onEditListing} />
                        ))}
                      </div>
                    </>
                  )
                  : <p id="my-services-count" className="text-muted text-small">No active services yet.</p>
                }
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
