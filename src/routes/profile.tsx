import { createFileRoute } from '@tanstack/react-router'
import { Check, ClipboardPen, MapPin, Briefcase, Plus, Calendar, Mail, History, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { AvatarIcon } from '../components/AvatarIcon'
import { ServiceCardEdit, type ServiceCardEditProps } from '../components/ServiceCardEdit'
import { ServiceCard, type ServiceCardProps } from '../components/ServiceCard'
import { useAuthStore } from '../stores/auth'
import { fetchUser } from '../lib/fetchUser'

/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/profile')({ 
  component: () => <Profile isOwner={false} isProvider={true} isVerified={true} userId={"1b4e7cce-bb07-49b9-a28b-d22136fb905e"} /> 
})

type ProfileProps = {
  isProvider: boolean
  isOwner: boolean
  isVerified?: boolean
  userId:  string
}

async function Profile({ isProvider, isOwner, isVerified = false, userId }: ProfileProps) {
  const [, setActiveTab] = useState('account')
  const currentUser = useAuthStore((s) => s.user)
  
  const user = fetchUser(userId )
  isOwner = currentUser?.userId === userId
    // console.log("Profile page rendered with userId:", currentUser?.userId) // Debug log to check userId

  const adress = (await user)?.privateAddress ?? "Keine Adresse angegeben"
  const userDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

  const serviceListings: ServiceCardEditProps[] = [
    {
      link: '/service/1',
      pictureLink: './pic/ServiceExample1.png' ,
      label: 'Web Development',
      description: 'Professional web development services',
      status: 'active'
    },
    {
      link: '/service/2',
      pictureLink: 'https://images.ctfassets.net/5i1m3im8l2b5/5yLgQr5c29UlkwTN7nDyUY/6f5d6a7d6b8e14129d75c72ecb1413a7/What_is_tech_support.jpg?w=1200&h=630&fl=progressive&q=50&fm=jpg',
      label: 'UI Design',
      description: 'Modern UI/UX design consultation lorem',
      status: 'active'
    },
    {
      link: '/service/3',
      pictureLink: 'https://images.ctfassets.net/5i1m3im8l2b5/5yLgQr5c29UlkwTN7nDyUY/6f5d6a7d6b8e14129d75c72ecb1413a7/What_is_tech_support.jpg?w=1200&h=630&fl=progressive&q=50&fm=jpg',
      label: 'UI Design',
      description: 'Modern UI/UX design consultation',
      status: 'draft'
    }
  ]

  const publicServiceListings: ServiceCardProps[] = [
    {
      link: '/service/1',
      pictureLink: './pic/ServiceExample1.png',
      location: 'Berlin, Germany',
      providerFirstName: 'John',
      providerLastName: 'Doe',
      varified: true,
      label: 'Web Development',
      description: 'Professional web development services',
      badges: [{ text: 'React', variant: 'primary' }, { text: 'TypeScript', variant: 'primary' }],
      hourRate: 50,
      distance: 0
    },
    {
      link: '/service/2',
      pictureLink: './pic/ServiceExample1.png',
      location: 'Berlin, Germany',
      providerFirstName: 'John',
      providerLastName: 'Doe',
      varified: true,
      label: 'UI Design',
      description: 'Modern UI/UX design consultation',
      badges: [{ text: 'Figma', variant: 'primary' }, { text: 'Design', variant: 'primary' }],
      hourRate: 45,
      distance: 0
    },
    {
      link: '/service/2',
      pictureLink: './pic/ServiceExample1.png',
      location: 'Berlin, Germany',
      providerFirstName: 'John',
      providerLastName: 'Doe',
      varified: true,
      label: 'UI Design',
      description: 'Modern UI/UX design consultation',
      badges: [{ text: 'Figma', variant: 'primary' }, { text: 'Design', variant: 'primary' }],
      hourRate: 45,
      distance: 0
    }
  ]

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
                                <h1 className="text-3xl font-semibold">John Doe</h1>
                                {isProvider && isVerified? <p className="text-sm font-bold text-primary flex items-center gap-1"> <Check /> Verifiziert</p> : <p className="text-sm font-bold"></p>}
                                {isOwner && <Button size="md" trailingIcon={<ClipboardPen />}>Bearbeiten</Button>}
                            </div>
                            <div>
                                {isProvider? <p className="text-xl font-bold text-primary">Dienstleiter</p> : <p className="text-xl font-bold text-accent">Kunde</p>}
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-sm font-bold text-border"> <MapPin/> </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Buttons - row 1-3, right 1/3 */}
                {isOwner ? (
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