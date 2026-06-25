import { Briefcase, Calendar, Check, ClipboardPen, Mail, MapPin, Plus } from 'lucide-react'
import { Navbar } from './Navbar'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'
import { MyListingCard, type MyListingSummary } from './MyListingCard'

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
  onActiveTabChange: (tab: string) => void
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
  onActiveTabChange,
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
                  <Button variant="primary" size="md" leadingIcon={<Briefcase />} onClick={() => onActiveTabChange('account')}>
                    My Services
                  </Button>
                  <Button variant="accent" size="md" leadingIcon={<Plus />} onClick={() => onActiveTabChange('listings')}>
                    Create Service
                  </Button>
                  <Button variant="secondary" size="md" leadingIcon={<Calendar />} onClick={() => onActiveTabChange('listings')}>
                    Calendar
                  </Button>
                  <Button variant="secondary" size="md" leadingIcon={<Mail />} onClick={() => onActiveTabChange('listings')}>
                    My Bookings
                  </Button>
                </div>
                <div className="w-full mx-auto h-px bg-border my-5" />
                <div className="flex flex-col w-full">
                  <Button variant="primary" size="md" leadingIcon={<Check />} onClick={() => onActiveTabChange('account')}>
                    Verify
                  </Button>
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
