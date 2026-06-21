import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Check, ClipboardPen, MapPin, Briefcase, Plus, Calendar, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { AvatarIcon } from '../components/AvatarIcon'
import { ServiceCardEdit, type ServiceCardEditProps } from '../components/ServiceCardEdit'
import { ServiceCard, type ServiceCardProps } from '../components/ServiceCard'
import { useAuthStore } from '../stores/auth'
import { fetchPublicUser, fetchUser } from '../lib/fetchUser'
import {useQuery} from '@tanstack/react-query'
import { fetchUserPrivateListings, fetchUserPublicListings } from '../lib/fetchListings'

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
        queryFn: () => {
            if(isOwner) return fetchUser(userId)
            else return fetchPublicUser(userId)
        },
        enabled: !!currentUser?.userId,
    })

    const isProviderType = user?.userType === 'PROVIDER' 
    isProvider = isProviderType
    
    const { data: listingsResponse, isLoading: listingsLoading, error: listingsError } = useQuery({
        queryKey: ['listings', userId],
        queryFn: () => {
                if(isOwner && isProviderType) return fetchUserPrivateListings(userId)
                if(isProviderType) return fetchUserPublicListings(userId)
            },
        enabled: isProviderType,
    })

    if (isLoading) return <p>Loading…</p>
    if (error) return <p>Failed to load profile.</p>
    
    console.log(isProvider, isOwner)
    const userDescription = user?.selfSummary ?? 'Keine Beschreibung hinterlegt.'
    const userFirstName = user?.firstName ?? ''
    const userLastName = user?.lastName ?? ''

    const adress = user?.privateAddress
    const city = adress?.city ?? ''

    const serviceListings: ServiceCardEditProps[] = listingsResponse?.items?.map((listing) => ({
        link: `/service/${listing.listingId}`,
        pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
        label: listing.title,
        description: listing.description,
        status: listing.publicationStatus === 'DRAFT' ? 'draft' : 'active'
    })) ?? []

    const publicServiceListings: ServiceCardProps[] = listingsResponse?.items?.map((listing) => ({
        link: `/service/${listing.listingId}`,
        pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
        location: `${listing.location.city}${listing.location.postalCode ? ', ' + listing.location.postalCode : ''}`,
        providerFirstName: listing.author.name,
        providerLastName: listing.author.surname,
        varified: false,
        label: listing.title,
        description: listing.description,
        badges: listing.tags.map(tag => ({ text: tag.name, variant: 'primary' as const })),
        hourRate: listing.price,
        distance: listing.location.serviceRadiusKm
    })) ?? []

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
                                    style='border border-cream border-4'
                                    firstName={userFirstName}
                                    lastName={userLastName}
                                    picture={user?.profileMedia?.url ?? undefined}
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
                                            Bearbeiten
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    {isProvider? <p className="text-xl font-bold text-primary">Dienstleiter</p> : <p className="text-xl font-bold text-accent">Kunde</p>}
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
                        <p className="text-h1 font-bold">Menü</p>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col w-full gap-3">
                            <Button variant="primary" size="md" leadingIcon={<Briefcase />} onClick={() => setActiveTab('account')}>
                                <p className='font-bold'>Meine Anzeigen</p>
                            </Button>
                            <Button variant="accent" size="md" leadingIcon={<Plus />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>Anzeige erstellen</p>
                            </Button>
                            <Button variant="secondary" size="md" leadingIcon={<Calendar />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>Kalender</p>
                            </Button>
                            <Button variant="secondary" size="md" leadingIcon={<Mail />} onClick={() => setActiveTab('listings')}>
                                <p className='font-bold'>Meine Buchungen</p>
                            </Button>
                        </div>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col w-full">
                            <Button variant="primary" size="md" leadingIcon={<Check />} onClick={() => setActiveTab('account')}>
                                <p className='font-bold'>Verifizieren</p>
                            </Button>
                        </div>
                    </div>
                    ) : isProvider ? (
                    <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                        <p className="text-h1 font-bold">Menü</p>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col w-full gap-3">
                            <Button variant="primary" size="md">
                                <p className='font-bold'>Kontakieren</p>
                            </Button>
                        </div>
                    </div>
                    ) : null}

                    {/* Profile Description - row 2, left 2/3 */}
                    <div className="col-span-2 row-start-2 bg-linen border border-border rounded-2xl p-6">
                        <h1>Über mich</h1>
                        <article>
                            {userDescription}
                        </article>
                    </div>

                    {/* Listings - row 3, left 2/3 */}
                    {isProvider && isOwner && (
                    <div className="col-span-2 row-start-3 bg-linen border border-border rounded-2xl p-6">
                        <h2 className="mb-4">Meine Anzeigen</h2>
                        <div className="flex flex-col gap-4">
                            {serviceListings.map((listing) => (
                                <ServiceCardEdit key={listing.link} {...listing} />
                            ))}
                        </div>
                    </div>
                    )}

                    {isProvider && !isOwner && (
                    <div className="col-span-2 row-span-1 row-start-3 bg-linen border border-border rounded-2xl p-6">
                        <h2 className="mb-4">Anzeigen</h2>
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