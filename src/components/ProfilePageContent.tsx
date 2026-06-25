import { Check, ClipboardPen, MapPin, Briefcase, Plus, Calendar, Mail } from 'lucide-react'
import { Navbar } from './Navbar'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'
import { MyListingCard, type MyListingSummary } from './MyListingCard'
import { ServiceCard, type ServiceCardProps } from './ServiceCard'

type ProfilePageContentProps = {
  userId: string
  isProvider: boolean
  isVerified: boolean
  isOwner: boolean
  userFirstName: string
  userLastName: string
  userDescription: string
  city: string
  pictureUrl?: string
  ownerListings: MyListingSummary[]
  publicServiceListings: ServiceCardProps[]
  onEditClick: () => void
  onEditListing: (listingId: string) => void
  onActiveTabChange: (tab: string) => void
}

export function ProfilePageContent({
  isProvider,
  isVerified,
  isOwner,
  userFirstName,
  userLastName,
  userDescription,
  city,
  pictureUrl,
  ownerListings,
  publicServiceListings,
  onEditClick,
  onEditListing,
  onActiveTabChange,
}: ProfilePageContentProps) {


  return (
    <>
      <Navbar />
      <main id="main-content">
        <section>
          <div className="bg-linear-to-r from-primary to-accent h-50 w-full" />
        </section>
        <section>
          <div className="container mx-auto max-w-6xl -mt-20 p-4 grid grid-cols-3 gap-5 items-start">
            {/* User Info - row 1, left 2/3 */}
            <div className="col-span-2">
              <div className="flex flex-row items-center gap-4">
                <div>
                  <AvatarIcon
                    size={200}
                    className="border border-cream border-4"
                    firstName={userFirstName}
                    lastName={userLastName}
                    picture={pictureUrl}
                  />
                </div>
                <div className="pt-15 mt-4 flex flex-col gap-2">
                  <div className="flex flex-row gap-4 items-center">
                    <h1 className="text-3xl font-semibold">
                      {userFirstName} {userLastName}
                    </h1>
                    {isProvider && isVerified ? (
                      <p className="text-sm font-bold text-primary flex items-center gap-1">
                        <Check /> Verifiziert
                      </p>
                    ) : (
                      <p className="text-sm font-bold"></p>
                    )}
                    {isOwner && (
                      <Button
                        size="md"
                        trailingIcon={<ClipboardPen />}
                        onClick={onEditClick}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  <div>
                    {isProvider ? (
                      <p className="text-xl font-bold text-primary">Provider</p>
                    ) : (
                      <p className="text-xl font-bold text-accent">Customer</p>
                    )}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-bold text-border">
                      <MapPin />
                      {city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Buttons - row 1-3, right 1/3 */}
            {isProvider && isOwner ? (
              <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                <p className="text-h1 font-bold">Menu</p>
                <div className="w-full mx-auto h-px bg-border m-5" />
                <div className="flex flex-col w-full gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    leadingIcon={<Briefcase />}
                    onClick={() => onActiveTabChange('account')}
                  >
                    <p className="font-bold">My Listings</p>
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    leadingIcon={<Plus />}
                    onClick={() => onActiveTabChange('listings')}
                  >
                    <p className="font-bold">Create Listing</p>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    leadingIcon={<Calendar />}
                    onClick={() => onActiveTabChange('listings')}
                  >
                    <p className="font-bold">Calender</p>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    leadingIcon={<Mail />}
                    onClick={() => onActiveTabChange('listings')}
                  >
                    <p className="font-bold">My Bookings</p>
                  </Button>
                </div>
                <div className="w-full mx-auto h-px bg-border m-5" />
                <div className="flex flex-col w-full">
                  <Button
                    variant="primary"
                    size="md"
                    leadingIcon={<Check />}
                    onClick={() => onActiveTabChange('account')}
                  >
                    <p className="font-bold">Verify</p>
                  </Button>
                </div>
              </div>
            ) : isProvider ? (
              <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                <p className="text-h1 font-bold">Menu</p>
                <div className="w-full mx-auto h-px bg-border m-5" />
                <div className="flex flex-col w-full gap-3">
                  <Button variant="primary" size="md">
                    <p className="font-bold">Contact</p>
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Profile Description - row 2, left 2/3 */}
            <div className="col-span-2 row-start-2 bg-linen border border-border rounded-2xl p-6">
              <h1>About me</h1>
              <article>{userDescription}</article>
            </div>

            {/* Listings - row 3, left 2/3 */}
            {isProvider && isOwner && (
              <div className="col-span-2 row-start-3 bg-linen border border-border rounded-2xl p-6">
                <h2 className="mb-4">My Listings</h2>
                <div className="flex flex-col gap-4">
                  {ownerListings.map((listing) => (
                    <MyListingCard key={listing.listingId} listing={listing} onEdit={onEditListing} />
                  ))}
                </div>
              </div>
            )}

            {isProvider && !isOwner && (
              <div className="col-span-2 row-span-1 row-start-3 bg-linen border border-border rounded-2xl p-6">
                <h2 className="mb-4">Listings</h2>
                <div className="flex flex-col gap-4 max-w-5xl">
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
