import { createFileRoute } from '@tanstack/react-router'
import { Search, Check, ArrowRight, ChevronRight, ChevronLeft, ClipboardPen, MapPin  } from 'lucide-react'
import { useState, useRef } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { CategoryCard } from '../components/CategoryCard'
import { ProviderCard } from '../components/ProviderCard'
import { Logo } from '../components/Logo'
import { AvatarIcon } from '../components/AvatarIcon'
import { ServiceCard, type ServiceCardProps } from '../components/ServiceCard'

/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/profile')({ component: Profile })

function Profile() {
  const [activeTab, setActiveTab] = useState('account')
  const contentRef = useRef<HTMLDivElement>(null)

  const isProvider = true
  const isVerified = true
  const adress = "Berlin, Germany"

  const userDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

  const serviceListings: ServiceCardProps[] = [
    {
      link: '/service/1',
      pictureLink: 'https://images.ctfassets.net/5i1m3im8l2b5/5yLgQr5c29UlkwTN7nDyUY/6f5d6a7d6b8e14129d75c72ecb1413a7/What_is_tech_support.jpg?w=1200&h=630&fl=progressive&q=50&fm=jpg',
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
      pictureLink: 'https://images.ctfassets.net/5i1m3im8l2b5/5yLgQr5c29UlkwTN7nDyUY/6f5d6a7d6b8e14129d75c72ecb1413a7/What_is_tech_support.jpg?w=1200&h=630&fl=progressive&q=50&fm=jpg',
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
      pictureLink: 'https://images.ctfassets.net/5i1m3im8l2b5/5yLgQr5c29UlkwTN7nDyUY/6f5d6a7d6b8e14129d75c72ecb1413a7/What_is_tech_support.jpg?w=1200&h=630&fl=progressive&q=50&fm=jpg',
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
            <div className="container mx-auto -mt-20 p-4 grid grid-cols-3 gap-5 items-start w-286">

                {/* User Info - row 1, left 2/3 */}
                <div className="col-span-2">
                    <div className='flex flex-row items-center gap-4'>
                        <div>
                            <AvatarIcon size={150} />
                        </div>
                        <div className='pt-15 mt-4 flex flex-col gap-2'>
                            <div className='flex flex-row gap-4 items-center'>
                                <h1 className="text-3xl font-semibold">John Doe</h1>
                                {isVerified? <p className="text-sm font-bold text-primary flex items-center gap-1"> <Check /> Verifiziert</p> : <p className="text-sm font-bold"></p>}
                                <Button size="md" trailingIcon={<ClipboardPen />}>Edit Profile</Button>
                            </div>
                            <div>
                                {isProvider? <p className="text-xl font-bold text-primary">Dienstleiter</p> : <p className="text-sm text-accent">Kunde</p>}
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-sm font-bold text-border"> <MapPin/> {adress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Buttons - row 1-3, right 1/3 */}
                <div className="col-start-3 row-start-2 row-span-3 bg-linen border border-border rounded-2xl p-6">
                    <div className="flex flex-col mx-auto">
                        <Button variant="primary" size="lg" onClick={() => setActiveTab('account')}>
                            Meine Anzeigen
                        </Button>
                        <Button variant="accent" size="lg" onClick={() => setActiveTab('listings')} className="mt-4">
                            Anzeige erstellen
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => setActiveTab('listings')} className="mt-4">
                            Kalender
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => setActiveTab('listings')} className="mt-4">
                            Meine Buchungen
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => setActiveTab('listings')} className="mt-4">
                            Verlauf
                        </Button>
                    </div>
                </div>

                {/* Profile Description - row 2, left 2/3 */}
                <div className="col-span-2 row-start-2 bg-linen border border-border rounded-2xl p-6">
                    <h1>Über mich</h1>
                    <article>
                        {userDescription}
                    </article>
                </div>

                {/* Listings - row 3, left 2/3 */}
                <div className="col-span-2 row-start-3 bg-linen border border-border rounded-2xl p-6">
                    <h2 className="mb-4">Meine Anzeigen</h2>
                    <div className="flex flex-col gap-4">
                        {serviceListings.map((listing) => (
                            <ServiceCard key={listing.link} {...listing} />
                        ))}
                    </div>
                </div>

            </div>
        </section>
     </main>
    </>     
  )
}