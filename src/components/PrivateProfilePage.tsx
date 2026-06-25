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
          <div className="bg-linear-to-r from-primary to-accent h-50 w-full" />
        </section>
        <section>
          <div className="container mx-auto max-w-6xl -mt-20 p-4 grid grid-cols-3 gap-5 items-start">

            {/* User info */}
            <div className="col-span-2">
              <div className="flex flex-row items-center gap-4">
                <AvatarIcon
                  size={200}
                  className="border border-cream border-4"
                  firstName={userFirstName}
                  lastName={userLastName}
                  picture={pictureUrl}
                />
                <div className="pt-15 mt-4 flex flex-col gap-2">
                  <div className="flex flex-row gap-4 items-center flex-wrap">
                    <h1 className="text-3xl font-semibold">
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

            {/* Menu panel */}
            {isProvider && (
              <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                <p className="text-h1 font-bold">Quick Actions</p>
                <div className="w-full mx-auto h-px bg-border m-5" />
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
                <div className="w-full mx-auto h-px bg-border m-5" />
                <div className="flex flex-col w-full">
                  <Button variant="primary" size="md" leadingIcon={<Check />} onClick={() => onActiveTabChange('account')}>
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {/* About */}
            <div className="col-span-2 row-start-2 bg-linen border border-border rounded-2xl p-6">
              <h2 className="font-heading font-bold text-h2 mb-2">About me</h2>
              {userDescription
                ? <p>{userDescription}</p>
                : <p className="text-muted text-small">No description provided.</p>
              }
            </div>

            {/* Listings */}
            {isProvider && (
              <div className="col-span-2 row-start-3 bg-linen border border-border rounded-2xl p-6">
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
