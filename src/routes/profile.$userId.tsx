import { createFileRoute } from '@tanstack/react-router'
import { Check, ClipboardPen, MapPin, Briefcase, Plus, Calendar, Mail, History } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { AvatarIcon } from '../components/AvatarIcon'
import { ServiceCardEdit, type ServiceCardEditProps } from '../components/ServiceCardEdit'
import { ServiceCard, type ServiceCardProps } from '../components/ServiceCard'
import { useAuthStore } from '../stores/auth'
import { fetchUser } from '../lib/fetchUser'
import {useQuery} from '@tanstack/react-query'
import { fetchUserListings } from '../lib/fetchListings'

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
    const currentUser = useAuthStore((s) => s.user)
    const isOwner = currentUser?.userId === userId
    
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
    })

    

    if (isLoading) return <p>Loading…</p>
    if (error) return <p>Failed to load profile.</p>
    isProvider = user?.userType === 'PROVIDER'
    const userDescription = user?.selfSummary ?? 'Keine Beschreibung hinterlegt.'
    const userFirstName = user?.firstName ?? ''
    const userLastName = user?.lastName ?? ''

    const adress = user?.privateAddress
    const city = adress?.city ?? ''

    const { data: listingsResponse, isLoading: listingsLoading, error: listingsError } = useQuery({
        queryKey: ['listings', userId],
        queryFn: () => fetchUserListings(userId),
        enabled: isProvider,
    })

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
                <div className="container mx-auto -mt-20 p-4 grid grid-cols-3 gap-5 items-start">
                    {/* User Info - row 1, left 2/3 */}
                    <div className="col-span-2">
                        <div className='flex flex-row items-center gap-4'>
                            <div>
                                <AvatarIcon size={200} style='border border-cream border-4' />
                            </div>
                            <div className='pt-15 mt-4 flex flex-col gap-2'>
                                <div className='flex flex-row gap-4 items-center'>
                                    <h1 className="text-3xl font-semibold">{userFirstName} {userLastName}</h1>
                                    {isProvider && isVerified? <p className="text-sm font-bold text-primary flex items-center gap-1"> <Check /> Verifiziert</p> : <p className="text-sm font-bold"></p>}
                                    {isOwner && <Button size="md" trailingIcon={<ClipboardPen />}>Bearbeiten</Button>}
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
                        <div className="flex flex-col mx-auto w-70">
                            <Button variant="primary" size="lg" leadingIcon={<Briefcase />} onClick={() => setActiveTab('account')}>
                                <p className='text-lg font-bold'>Meine Anzeigen</p>
                            </Button>
                            <Button variant="accent" size="lg" leadingIcon={<Plus />} onClick={() => setActiveTab('listings')} className="mt-4">
                                <p className='text-lg font-bold'>Anzeige erstellen</p>
                            </Button>
                            <Button variant="secondary" size="lg" leadingIcon={<Calendar />} onClick={() => setActiveTab('listings')} className="mt-4">
                                <p className='text-lg font-bold'>Kalender</p>
                            </Button>
                            <Button variant="secondary" size="lg" leadingIcon={<Mail />} onClick={() => setActiveTab('listings')} className="mt-4">
                                <p className='text-lg font-bold'>Meine Buchungen</p>
                            </Button>
                            <Button variant="secondary" size="lg" leadingIcon={<History />} onClick={() => setActiveTab('listings')} className="mt-4">
                                <p className='text-lg font-bold'>Verlauf</p>
                            </Button>
                        </div>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col mx-auto w-60">
                            <Button variant="primary" size="lg" leadingIcon={<Check />} onClick={() => setActiveTab('account')}>
                                <p className='text-lg font-bold'>Verifizieren</p>
                            </Button>
                        </div>
                    </div>
                    ) : isProvider ? (
                    <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                        <p className="text-h1 font-bold">Menü</p>
                        <div className="w-full mx-auto h-px bg-border m-5" />
                        <div className="flex flex-col mx-auto w-70 gap-4">
                            <Button variant="primary" size="lg">
                                <p className='text-lg font-bold'>Kontakieren</p>
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
        </>     
    )
}