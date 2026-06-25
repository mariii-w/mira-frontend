import { Briefcase, Calendar, Check, ClipboardPen, Mail, MapPin, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'
import { MyListingCard, type MyListingSummary } from './MyListingCard'
import { cn } from '../lib/cn'

interface PrivateProfilePageProps {
  userFirstName: string
  userLastName: string
  userDescription: string
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
  userDescription,
  city,
  pictureUrl,
  isProvider,
  ownerListings,
  onEditClick,
  onEditListing,
}: PrivateProfilePageProps) {
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
                <div className="lg:pt-20 flex flex-col gap-1 items-center lg:items-start py-2">
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
                    Verify
                  </QuickActionLink>
                </div>
              </div>
            )}

            {/* About */}
            <div className="col-span-1 lg:col-span-2 lg:row-start-2 bg-linen border border-border rounded-2xl p-6">
              <h2 className="font-heading font-bold text-h2 mb-2">About me</h2>
              {userDescription
                ? <p>{userDescription}</p>
                : <p className="text-muted text-small">No description provided.</p>
              }
            </div>

            {/* Services */}
            {isProvider && (
              <div className="col-span-1 lg:col-span-2 lg:row-start-3 bg-linen border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-h2 mb-4">My Services</h2>
                {ownerListings.length > 0
                  ? (
                    <div className="flex flex-col gap-4">
                      {ownerListings.map((listing) => (
                        <MyListingCard key={listing.listingId} listing={listing} onEdit={onEditListing} />
                      ))}
                    </div>
                  )
                  : <p className="text-muted text-small">No active services yet.</p>
                }
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
