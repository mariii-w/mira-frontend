/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Search,
  MessageCircle,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Logo, type LogoVariant } from '../../components/common/ui/Logo.tsx'
import { Button, type ButtonVariant, type ButtonSize } from '../../components/common/ui/Button.tsx'
import { Label } from '../../components/common/ui/Label.tsx';
import { Input } from '../../components/common/ui/Input.tsx';
import { Textarea } from '../../components/common/ui/Textarea.tsx';
import { AccessibilityPanel } from '../../components/common/layout/AccessibilityPanel.tsx';
import { CategoryCard } from '../../components/features/home/CategoryCard.tsx';
import { useState } from 'react';
import { Pagination } from '../../components/common/layout/Pagination';
import { AvatarIcon } from '../../components/common/ui/AvatarIcon.tsx';
import { UserMenu } from '../../components/common/layout/UserMenu.tsx';
import { SearchBar } from '../../components/features/search/SearchBar.tsx';
import { Badge } from '../../components/common/ui/Badge.tsx';
import { Breadcrumb } from '../../components/common/layout/BreadCrumb.tsx';
import { FilterBar } from '../../components/features/search/FilterBar.tsx';
import { ServiceCard } from '../../components/features/listings/ServiceCard.tsx';
import { BookingCard, type BookingSummary, type BookingDetails } from '../../components/features/bookings/BookingCard.tsx';
import { CalendarGrid } from '../../components/features/bookings/CalendarGrid.tsx';
import { ServiceUserToggle } from '../../components/features/search/ServiceUserToggle.tsx';



interface LogoSample { variant: LogoVariant; label: string; onDark?: boolean }
interface ColorSample { name: string; hex: string; role: string; dark?: boolean }

const LOGO_SAMPLES: LogoSample[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'stacked', label: 'Stacked' },
  { variant: 'submark', label: 'Submark' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'black', label: 'Black' },
  { variant: 'white', label: 'White', onDark: true },
]

const COLOR_SAMPLES: ColorSample[] = [
  { name: 'Forest',     hex: '#47745B', role: 'Primary action',     dark: true },
  { name: 'Sage',       hex: '#6E9D82', role: 'Secondary green' },
  { name: 'Mint',       hex: '#EBF4EF', role: 'Soft surface' },
  { name: 'Plum',       hex: '#7C4E80', role: 'Accent',             dark: true },
  { name: 'Lilac',      hex: '#B281B6', role: 'Decorative only' },
  { name: 'Blush',      hex: '#F5EDF6', role: 'Soft surface' },
  { name: 'Charcoal',   hex: '#2E2E26', role: 'Body text',          dark: true },
  { name: 'Grey Olive', hex: '#96928D', role: 'Borders, muted text' },
  { name: 'Linen',      hex: '#F2EBE1', role: 'Alt surface' },
  { name: 'Cream',      hex: '#F9F5F0', role: 'Page background' },
]

const TEXT_VARIANTS: { variant: ButtonVariant; label: string }[] = [
  { variant: 'primary',   label: 'Primary' },
  { variant: 'accent',    label: 'Accent' },
  { variant: 'secondary', label: 'Secondary' },
  { variant: 'ghost',     label: 'Ghost' },
]

const SIZES: ButtonSize[] = ['sm', 'md', 'lg']

const MOCK_PARTICIPANT = { userId: 'demo', name: 'Demo', surname: 'User' }

function makeMockDetail(
  bookingId: string,
  description: string,
  autoConfirmAt: string | null,
  allowedActions: BookingDetails['allowedActions'],
): BookingDetails {
  return {
    bookingId,
    listingId: 'l-demo',
    listing: { title: '' },
    consumer: MOCK_PARTICIPANT,
    provider: MOCK_PARTICIPANT,
    status: 'PENDING',
    locationType: 'AT_CONSUMER',
    serviceAddress: null,
    description,
    totalPrice: 0,
    bookedStart: new Date().toISOString(),
    bookedEnd:   new Date().toISOString(),
    createdAt:   new Date().toISOString(),
    confirmedAt: null, paidAt: null, providerCompletedAt: null,
    consumerConfirmedAt: null, consumerConfirmationType: null,
    autoConfirmAt,
    completedAt: null, cancelledAt: null, expiresAt: null,
    allowedActions,
  }
}

const BOOKING_SAMPLES: { summary: BookingSummary; detail: BookingDetails }[] = [
  {
    summary: {
      bookingId: '1',
      listingId: 'l1',
      listing: { title: 'PC Support & Laptop Help' },
      counterparty: { userId: 'u1', name: 'Klaus', surname: 'Müller' },
      status: 'PENDING',
      serviceAddress: { street: 'Hauptstraße', houseNumber: '24', city: 'Berlin', postalCode: '10115' },
      totalPrice: 22,
      bookedStart: new Date(Date.now() + 86400000 * 3).toISOString(),
      bookedEnd:   new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
      createdAt:   new Date().toISOString(),
    },
    detail: makeMockDetail('1', 'My Windows laptop is running very slowly and fans are loud. Please scan and clean it up.', null, [
      { rel: 'accept', href: '#', method: 'POST' },
      { rel: 'refuse', href: '#', method: 'POST' },
    ]),
  },
  {
    summary: {
      bookingId: '2',
      listingId: 'l2',
      listing: { title: 'Wi-Fi & Router Setup' },
      counterparty: { userId: 'u2', name: 'Anna', surname: 'Weiß' },
      status: 'AWAITING_CONFIRMATION',
      serviceAddress: { street: 'Torstraße', houseNumber: '12', city: 'Berlin', postalCode: '10119' },
      totalPrice: 25,
      bookedStart: new Date(Date.now() - 86400000).toISOString(),
      bookedEnd:   new Date(Date.now() - 86400000 + 3600000).toISOString(),
      createdAt:   new Date().toISOString(),
    },
    detail: makeMockDetail('2', 'New Fritzbox, please configure.', new Date(Date.now() + 86400000 * 7).toISOString(), [
      { rel: 'acknowledge-delivery', href: '#', method: 'POST' },
    ]),
  },
  {
    summary: {
      bookingId: '3',
      listingId: 'l3',
      listing: { title: 'Smart Home Setup' },
      counterparty: { userId: 'u3', name: 'Lena', surname: 'Kraus' },
      status: 'COMPLETED',
      serviceAddress: { street: 'Ludwigstraße', houseNumber: '11', city: 'Berlin', postalCode: '10115' },
      totalPrice: 50,
      bookedStart: new Date(Date.now() - 86400000 * 5).toISOString(),
      bookedEnd:   new Date(Date.now() - 86400000 * 5 + 7200000).toISOString(),
      createdAt:   new Date().toISOString(),
    },
    detail: makeMockDetail('3', 'Set up Philips Hue lights and Google Home in the living room.', null, []),
  },
]


interface CalDayProps {
  date: Date
  calToday: Date
  selectedDay: Date | null
  onSelect: (d: Date) => void
}

function CalDay({ date, calToday, selectedDay, onSelect }: CalDayProps) {
  const todayMidnight = new Date(calToday.getFullYear(), calToday.getMonth(), calToday.getDate())
  const dateMidnight  = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const isPast     = todayMidnight.getTime() > dateMidnight.getTime()
  const isSelected = selectedDay?.toDateString() === date.toDateString()
  const isToday    = date.toDateString() === calToday.toDateString()
  return (
    <button
      type="button"
      disabled={isPast}
      onClick={() => onSelect(date)}
      aria-label={date.toDateString()}
      aria-pressed={isSelected}
      className={[
        'w-full aspect-square rounded-lg text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        isPast     ? 'text-muted/40 cursor-not-allowed' : 'cursor-pointer hover:bg-mint',
        isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : '',
        isToday && !isSelected ? 'ring-1 ring-primary text-primary' : '',
        !isSelected && !isToday && !isPast ? 'text-foreground' : '',
      ].join(' ')}
    >
      {date.getDate()}
    </button>
  )
}

export const Route = createFileRoute('/_app/styleguide')({ component: Styleguide })

function Styleguide() {
  const [checked, setChecked] = useState(false)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const calToday = new Date()
  return (
    <div className="p-6 space-y-12 bg-white min-h-dvh">
      <section>
        <Logo variant="primary" height={56} title="Mira home" />
      </section>

        <section className="flex justify-end">
          <AccessibilityPanel />
        </section>

      <section className="flex flex-col gap-3">
        <h2>Logos</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {LOGO_SAMPLES.map(({ variant, label, onDark }) => (
            <figure key={variant} className="m-0 flex flex-col gap-2">
              <div className={`flex items-center justify-center h-30 p-4 rounded-lg border ${onDark ? 'bg-charcoal border-charcoal' : 'bg-surface border-border'}`}>
                <Logo variant={variant} height={48} />
              </div>
              <figcaption className="text-small text-muted">{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Colors</h2>
        <ul className="list-none m-0 p-0 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {COLOR_SAMPLES.map(({ name, hex, role, dark }) => (
            <li key={hex} className={`flex flex-col gap-1 min-h-30 p-4 rounded-lg border ${dark ? 'text-cream border-transparent' : 'text-foreground border-border'}`} style={{ background: hex }}>
              <strong className="font-heading font-bold">{name}</strong>
              <code className="bg-transparent p-0 text-small opacity-85">{hex}</code>
              <small className="mt-auto text-label opacity-85">{role}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Typography</h2>
        <div className="flex flex-col gap-4 p-6 bg-surface border border-border rounded-lg">
          <h1>H1 — Find help near you</h1>
          <h2>H2 — Available providers near Munich</h2>
          <p>Body — Helps with Windows, printers, Wi-Fi setup, and phone issues. Patient and friendly with first-time users and seniors.</p>
          <p className="text-small text-muted">Small — Brussels, Belgium · From €20/hr</p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2>Buttons</h2>

        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 items-center p-6 bg-surface border border-border rounded-lg">
          <div />
          <div className="flex gap-3 text-label text-muted">
            <span className="w-20">sm</span>
            <span className="w-24">md</span>
            <span className="w-24">lg</span>
          </div>

          {TEXT_VARIANTS.map(({ variant, label }) => (
            <ShowcaseRow key={variant} label={label}>
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>{label}</Button>
              ))}
            </ShowcaseRow>
          ))}

          <ShowcaseRow label="Icon">
            {SIZES.map((size) => (
              <Button key={size} variant="icon" size={size} aria-label="Previous">
                <ChevronLeft />
              </Button>
            ))}
          </ShowcaseRow>
        </div>

        <div className="flex flex-wrap gap-3 items-center p-6 bg-surface border border-border rounded-lg">
          <Button variant="primary">Default</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Saving</Button>
          <Button variant="accent" disabled>Accent disabled</Button>
          <Button variant="accent" loading>Accent loading</Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center p-6 bg-surface border border-border rounded-lg">
          <Button variant="primary" leadingIcon={<Search />}>Search</Button>
          <Button variant="primary" trailingIcon={<ArrowRight />}>Log in</Button>
          <Button variant="accent" trailingIcon={<ArrowRight />} size="lg">Get started</Button>
          <Button variant="secondary" leadingIcon={<MessageCircle />}>Message</Button>
          <Button variant="primary" leadingIcon={<Calendar />}>Book a time</Button>
          <Button variant="accent" leadingIcon={<Plus />}>Add exception</Button>
          <Button variant="ghost" trailingIcon={<ArrowRight />}>View all helpers</Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center p-6 bg-surface border border-border rounded-lg">
          <Button variant="icon" aria-label="Previous"><ChevronLeft /></Button>
          <Button variant="icon" aria-label="Next"><ChevronRight /></Button>
          <Button variant="icon" aria-label="Add"><Plus /></Button>
          <Button variant="icon" aria-label="Close"><X /></Button>
        </div>

        <div className="flex flex-col gap-3 p-6 bg-surface border border-border rounded-lg max-w-sm">
          <Button variant="primary" fullWidth trailingIcon={<ArrowRight />} size="lg">Send booking request</Button>
          <Button variant="secondary" fullWidth>Cancel</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Label</h2>
        <div className="flex flex-col gap-3 p-6 bg-surface border border-border rounded-lg">
          <Label>Benutzername</Label>
          <Label required>Titel</Label>
          <Label required className="text-muted">Muted label</Label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Input</h2>
        <div className="flex flex-col gap-4 p-6 bg-surface border border-border rounded-lg max-w-sm">

          <div className="flex flex-col gap-1.5">
            <Label>Benutzername</Label>
            <ValidatedInput
              placeholder="Geben Sie Ihren Benutzernamen ein"
              validate={(v) => !v ? 'Erforderlich.' : v.length < 3 ? 'Min. 3 Zeichen.' : !/^[a-z0-9_]+$/.test(v) ? 'Nur a–z, 0–9, _.' : null}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Titel</Label>
            <ValidatedInput
              placeholder="z.B. PC Support & Laptop Hilfe"
              validate={(v) => !v ? 'Erforderlich.' : v.length < 3 ? 'Min. 3 Zeichen.' : v.length > 120 ? 'Max. 120 Zeichen.' : null}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Passwort</Label>
            <Input type="password" placeholder="Geben Sie Ihr Passwort ein" />
          </div>

          <Input placeholder="Disabled" disabled />

          <div className="flex flex-col gap-1.5">
            <Label required>Benutzername (Fehler)</Label>
            <Input value="Anna!" readOnly error="Nur Kleinbuchstaben, Ziffern und Unterstriche." />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Textarea</h2>
        <div className="flex flex-col gap-1.5 p-6 bg-surface border border-border rounded-lg max-w-sm">
          <Label required>Beschreibung</Label>
          <Textarea placeholder="Beschreiben Sie Ihren Service..." />
        </div>
      </section>

  
      <section className="flex flex-col gap-3">
        <h2>Category cards</h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex gap-4 w-max pb-2">
            {[
              { name: 'Assembly',     seed: 'assembly' },
              { name: 'PC Support',   seed: 'pc' },
              { name: 'Art Lessons',  seed: 'art' },
              { name: 'Music Lessons', seed: 'music' },
              { name: 'Elder Help',   seed: 'elder' },
              { name: 'Tutoring',     seed: 'tutor' },
              { name: 'Cleaning',     seed: 'clean' },
              { name: 'Gardening',    seed: 'garden' },
              { name: 'Pet Care',     seed: 'pets' },
              { name: 'Moving Help',  seed: 'moving' },
            ].map(({ name, seed }) => (
              <div key={seed} className="w-48 shrink-0">
                <CategoryCard name={name} imageSrc={`https://picsum.photos/seed/${seed}/400`} />
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="flex flex-col gap-3">
        <h2>Pagination</h2>
        <div className="flex flex-col gap-4 p-6 bg-surface border border-border rounded-lg">
          <Pagination onPrevious={() => {}} onNext={() => {}} />
          <Pagination onPrevious={() => {}} onNext={() => {}} disablePrevious />
          <Pagination onPrevious={() => {}} onNext={() => {}} disableNext />
        </div>
      </section>

    <section className="flex flex-col gap-3">
      <h2>Account Icon</h2>
      
      <div className="p-6 bg-surface border border-border rounded-lg">
        <AvatarIcon size={40} firstName='Lena' lastName='Kross'></AvatarIcon>
        <UserMenu firstName='Lena' lastName='Kross'/>
        <UserMenu firstName='Klaus' lastName='Merger' isProvider={true}/>
      </div>
    </section>

      <section className="flex flex-col gap-3">
        <h2>Search Bar</h2>
        <SearchBar placeholder='Suche...' />
      </section>

    <section className="flex flex-col gap-3">
      <h2>Badge</h2>

      <div className="p-6 bg-surface border border-border rounded-lg">
        <Badge text={'WI-FI'}/>
        <Badge variant='accent' text ={'Barrierefrei'}/>
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <h2>Breadcrumb</h2>

      <div className="p-6 bg-surface border border-border rounded-lg">
        <Breadcrumb links={[
          { name: 'Home',     href: '/'              },
          { name: 'Styleguide', href: '/styleguide'      },
          ]}
        />
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <h2>Filter Leiste</h2>
      <div className='w-96'>
        <FilterBar
          tags={[
            { tagId: '1', name: 'PC & Laptop' },
            { tagId: '2', name: 'Phone & Tablet' },
            { tagId: '3', name: 'Smart Home' },
            { tagId: '4', name: 'Printers' },
            { tagId: '5', name: 'Software Help' },
            { tagId: '6', name: 'Email & Web' },
            { tagId: '7', name: 'Linux' },
          ]}
          selectedTagIds={['1', '2']}
          onTagToggle={() => {}}
          distanceKm={10}
          onDistanceChange={() => {}}
          maxPrice={40}
          onMaxPriceChange={() => {}}
          onApply={() => {}}
          activeCount={2}
        />
      </div>
    </section>

      <section className="flex flex-col gap-3">
        <h2>Service Card</h2>
        <div className='w-5xl'>
          <ServiceCard
              link='#'
              pictureLink='./pic/ServiceExample1.png'
              location={'München'}
              providerFirstName={'Patrick'}
              providerLastName={'Stock'}
              varified={true}
              label={'Laptop & Wi-Fi setup'}
              description={'I help with Windows, macOS, printers, Wi-Fi, smart TVs and phone-to-laptop setups. Friendly with first-time users and seniors.'}
              tags={[
                { tagId: '1', name: 'Wi-Fi',       isBarrierefrei: false, isActive: true },
                { tagId: '2', name: 'Windows',      isBarrierefrei: false, isActive: true },
                { tagId: '3', name: 'Printers',     isBarrierefrei: false, isActive: true },
                { tagId: '4', name: 'Barrierefrei', isBarrierefrei: true,  isActive: true },
              ]}
              hourRate={20}
          />
        </div>

        <h3 className="text-body font-bold">Service Card (compact)</h3>
        <div className='w-64'>
          <ServiceCard
              variant='compact'
              link='#'
              pictureLink='./pic/ServiceExample1.png'
              location={'München'}
              providerFirstName={'Patrick'}
              providerLastName={'Stock'}
              varified={true}
              label={'Laptop & Wi-Fi setup'}
              description={'I help with Windows, macOS, printers, Wi-Fi, smart TVs and phone-to-laptop setups. Friendly with first-time users and seniors.'}
              tags={[
                { tagId: '1', name: 'Wi-Fi',       isBarrierefrei: false, isActive: true },
                { tagId: '2', name: 'Windows',      isBarrierefrei: false, isActive: true },
                { tagId: '3', name: 'Printers',     isBarrierefrei: false, isActive: true },
                { tagId: '4', name: 'Barrierefrei', isBarrierefrei: true,  isActive: true },
              ]}
              hourRate={25}
          />
        </div>
      </section>

      <h2>Service User Toggle</h2>
      <section>
        <div className='w-96 bg-charcoal p-6 rounded-lg'>
          <ServiceUserToggle
              id="service-toggle"
              labelLeft="Services"
              labelRight="Users"
              checked={checked}
              onCheckedChange={setChecked}
          />
        </div>
      </section>

    <section className="flex flex-col gap-3">
      <h2>Booking Card</h2>
      <div className="flex flex-col gap-4 max-w-2xl">
        {BOOKING_SAMPLES.map(({ summary, detail }) => (
          <BookingCard
            key={summary.bookingId}
            booking={summary}
            mockDetail={detail}
            onActionComplete={() => {}}
            loadBookingDetails={async () => detail}
            performBookingAction={async () => null}
          />
        ))}
      </div>
    </section>


    <section className="flex flex-col gap-3">
      <h2>Calendar Grid</h2>
      <div className="p-6 bg-surface border border-border rounded-lg max-w-sm">
        <CalendarGrid
          year={calYear}
          month={calMonth}
          onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m) }}
          minDate={calToday}
          renderDay={(date) => (
            <CalDay
              date={date}
              calToday={calToday}
              selectedDay={selectedDay}
              onSelect={setSelectedDay}
            />
          )}
        />
        {selectedDay && (
          <p className="mt-3 text-small text-muted text-center">
            Selected: {selectedDay.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'long' })}
          </p>
        )}
      </div>
    </section>

    </div>
  )
}

function ShowcaseRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-small text-muted font-medium">{label}</span>
      <div className="flex gap-3 items-center flex-wrap">{children}</div>
    </>
  )
}

function ValidatedInput({
  validate,
  placeholder,
}: {
  validate: (v: string) => string | null
  placeholder: string
}) {
  const [v, setV] = useState('')
  const [touched, setTouched] = useState(false)
  return (
    <Input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => setTouched(true)}
      error={touched ? validate(v) : null}
      placeholder={placeholder}
    />
  )
}
