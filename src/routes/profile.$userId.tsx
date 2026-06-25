import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Check, ClipboardPen, MapPin, Briefcase, Plus, Calendar, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { AvatarIcon } from '../components/AvatarIcon'
import { ServiceCardEdit, type ServiceCardEditProps } from '../components/ServiceCardEdit.tsx'
import { ServiceCard, type ServiceCardProps } from '../components/ServiceCard'
import { useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import { mediaUrl } from "../lib/mediaUrl";

import {
  getPrivateUserProfile,
  getPublicProfile,
  getAuthorListings,
  getPublicProfileListings,
} from "../api/mira";


/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/profile/$userId')({
  component: ProfilePage
})

type ProfileProps = {
  isProvider?: boolean
  isVerified?: boolean
  userId: string
}

function ProfilePage()  {
  const { userId } = Route.useParams()
  return <Profile userId={userId} />
}

function Profile({ isProvider, isVerified = false, userId }: ProfileProps) {
    const [, setActiveTab] = useState('account')
    const navigate = useNavigate()
    const currentUser = useAuthStore((s) => s.user)
    const isOwner = currentUser?.userId === userId
    console.log(currentUser?.userId, isOwner)
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (isOwner) {
                const response = await getPrivateUserProfile(userId)
                if (response.status !== 200) throw response.data
                return response.data
            }

            const response = await getPublicProfile(userId)
            if (response.status !== 200) throw response.data
            return response.data
        },
        enabled: !!currentUser?.userId,
    })
    const pictureUrl = user?.profileMedia ? mediaUrl(user.profileMedia.url) : user?.profileMedia ? mediaUrl(user.profileMedia.url) : undefined;
    const isProviderType = user?.userType === 'PROVIDER'
    isProvider = isProviderType

    const { data: listingsResponse } = useQuery({
        queryKey: ['listings', userId, isOwner],
        queryFn: async () => {
            if (isOwner && isProviderType) {
                const response = await getAuthorListings(userId)
                if (response.status !== 200) throw response.data
                return response.data
            }

            if (isProviderType) {
                const response = await getPublicProfileListings(userId)
                if (response.status !== 200) throw response.data
                return response.data
            }

            return { items: [], cursor: { limit: 0, next: null } }
        },
        enabled: isProviderType,
    })

    if (isLoading) return <p>Loading…</p>
    if (error) return <p>Failed to load profile.</p>
    
    console.log(isProvider, isOwner)
    const userDescription = user?.selfSummary ?? 'Keine Beschreibung hinterlegt.'
    const userFirstName = user?.firstName ?? ''
    const userLastName = user?.lastName ?? ''

    const city = user
      ? 'privateAddress' in user
        ? user.privateAddress?.city ?? ''
        : user.city ?? ''
      : ''

    const serviceListings: ServiceCardEditProps[] = isOwner && isProviderType
      ? (listingsResponse?.items ?? []).map((listing: any) => ({
          link: `/service/${listing.listingId}`,
          pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
          label: listing.title,
          description: listing.description,
          status: listing.publicationStatus === 'DRAFT' ? 'draft' : 'active'
        }))
      : []

    const publicServiceListings: ServiceCardProps[] = !isOwner && isProviderType
      ? (listingsResponse?.items ?? []).map((listing: any) => ({
          link: `/service/${listing.listingId}`,
          pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
          location: `${listing.location.city}${listing.location.postalCode ? ', ' + listing.location.postalCode : ''}`,
          providerFirstName: listing.author.name,
          providerLastName: listing.author.surname,
          varified: false,
          label: listing.title,
          description: listing.description,
          badges: listing.tags.map((tag: any) => ({ text: tag.name, variant: 'primary' as const })),
          tags: listing.tags,
          hourRate: listing.price,
          distance: listing.location.serviceRadiusKm,
        }))
      : []

    return(
        <>
        <Navbar />
        <main id="main-content">
            <section>
                <div className="bg-linear-to-r from-primary to-accent h-50 w-full"/>
            </section>
            <section>
                <div className="container mx-auto max-w-6xl -mt-20 p-4 grid grid-cols-3 gap-5 items-start">
                    {/* User Info - row 1, left 2/3 */}
                    <div className="col-span-2">
                        <div className='flex flex-row items-center gap-4'>
                            <div>
                                <AvatarIcon
                                    size={200}
                                    className='border border-cream border-4'
                                    firstName={userFirstName}
                                    lastName={userLastName}
                                    picture={pictureUrl}
                                />
                            </div>
                            <div className='pt-15 mt-4 flex flex-col gap-2'>
                                <div className='flex flex-row gap-4 items-center'>
                                    <h1 className="text-3xl font-semibold">{userFirstName} {userLastName}</h1>
                                    {isProvider && isVerified? <p className="text-sm font-bold text-primary flex items-center gap-1"> <Check /> Verifiziert</p> : <p className="text-sm font-bold"></p>}
                                    {isOwner && (
                                        <Button
                                            size="md"
                                            trailingIcon={<ClipboardPen />}
                                            onClick={() => navigate({ to: '/profile/$userId/edit', params: { userId } })}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    {isProvider? <p className="text-xl font-bold text-primary">Provider</p> : <p className="text-xl font-bold text-accent">Customer</p>}
                                </div>
                                <div>
                                    <p className="flex items-center gap-1 text-sm font-bold text-border"> <MapPin/>{city} </p>
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
                            <Button variant="primary" size="md" leadingIcon={<Briefcase />} onClick={() => setActiveTab('account')}>
                                <p className='font-bold'>My Listings</p>
                            </Button>
                            <Button variant="accent" size="md" leadingIcon={<Plus />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>Create Listing</p>
                            </Button>
                            <Button variant="secondary" size="md" leadingIcon={<Calendar />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>Calender</p>
                            </Button>
                            <Button variant="secondary" size="md" leadingIcon={<Mail />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>My Bookings</p>
                            </Button>
                        </div>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col w-full">
                            <Button variant="primary" size="md" leadingIcon={<Check />} onClick={() => setActiveTab('account')}>
                                <p className='font-bold'>Verify</p>
                            </Button>
                        </div>
                    </div>
                    ) : isProvider ? (
                    <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                        <p className="text-h1 font-bold">Menu</p>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col w-full gap-3">
                            <Button variant="primary" size="md">
                                <p className='font-bold'>Contact</p>
                            </Button>
                        </div>
                    </div>
                    ) : null}

                    {/* Profile Description - row 2, left 2/3 */}
                    <div className="col-span-2 row-start-2 bg-linen border border-border rounded-2xl p-6">
                        <h1>About me</h1>
                        <article>
                            {userDescription}
                        </article>
                    </div>

                    {/* Listings - row 3, left 2/3 */}
                    {isProvider && isOwner && (
                    <div className="col-span-2 row-start-3 bg-linen border border-border rounded-2xl p-6">
                        <h2 className="mb-4">My Listings</h2>
                        <div className="flex flex-col gap-4">
                            {serviceListings.map((listing) => (
                                <ServiceCardEdit key={listing.link} {...listing} />
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
        <Outlet />
        </>
    )
}