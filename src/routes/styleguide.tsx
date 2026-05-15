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
import { Logo, type LogoVariant } from '../components/Logo.tsx'
import { Button, type ButtonVariant, type ButtonSize } from '../components/Button.tsx'
import { Label } from '../components/Label.tsx';
import { Input } from '../components/Input.tsx';
import { Textarea } from '../components/Textarea.tsx';
import { AccessibilityPanel } from '../components/AccessibilityPanel.tsx';
import { CategoryCard } from '../components/CategoryCard.tsx';
import { ProviderCard } from '../components/ProviderCard';
import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { AvatarIcon } from '../components/AvatarIcon.tsx';
import { UserBadge } from '../components/UserBadge.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { Badge } from '../components/Badge.tsx';
import { Breadcrumb } from '../components/BreadCrumb.tsx';
import { FilterBar } from '../components/FilterBar.tsx';
import { ServiceCard } from '../components/ServiceCard.tsx';



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



export const Route = createFileRoute('/styleguide')({ component: Styleguide })

function Styleguide() {
  const [page, setPage] = useState(5);
  return (
    <div className="p-6 space-y-12 bg-background min-h-dvh">
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

     <section className="flex flex-col gap-6">
        <h2>ProviderCard</h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-small text-muted font-medium">Compact (Landing Page)</h3>
          <div className="w-64">
            <ProviderCard
              variant="compact"
              firstName="Patrick"
              lastName='Smith'
              distanceKm={1.2}
              bio="Helps with Windows, printers, Wi-Fi setup and phone issues. Patient and friendly with first-time users and seniors."
              pricePerHour={25}
              avatar={<AvatarIcon firstName="Patrick" lastName="Smith" picture=''/*picture can be added here*/ />}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-small text-muted font-medium">Full (Search Results)</h3>
          <div className="w-96">
            <ProviderCard
              variant="full"
              firstName="Lena"
              lastName='Kross'
              distanceKm={2.1}
              bio="Software engineer by day, helper by evening. I diagnose slow PCs, clean out junk, set up email and cloud backup."
              pricePerHour={18}
              services={[
                { name: 'Windows Help', price: 32 },
                { name: 'Email Setup', price: 18 },
                { name: 'Cloud Backup', price: 28 },
              ]}
              avatar={<AvatarIcon firstName="Lena" lastName="Kross" picture=''/*picture can be added here*//>}
            />
          </div>
        </div>
      </section>

    <section className="flex flex-col gap-3">
      <h2>Pagination</h2>
      <div className="p-6 bg-surface border border-border rounded-lg">
        <Pagination page={page} totalPages={12} onPageChange={setPage} />
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <h2>Account Icon</h2>
      
      <div className="p-6 bg-surface border border-border rounded-lg">
        <AvatarIcon size={40} firstName='Lena' lastName='Kross'></AvatarIcon>
        <UserBadge firstName='Lena' lastName='Kross'/>
        <UserBadge firstName='Klaus' lastName='Merger' isProvider={true}/>
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
        <FilterBar tagList={[
          {name:"PC & Laptop", checked: false},
          {name:"Phone & Tablet", checked: false},
          {name:"Smart Home", checked: false},
          {name:"Printers", checked: false},
          {name:"Software Help", checked: false},
          {name:"Email & Web", checked: false},
          {name:"Linux", checked: false},
        ]}/>
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
            badges={[{text: 'Wi-Fi'}, {text: 'Windows'}, {text: 'Printers'}, {text: 'Barrierefrei', variant: 'accent'}]} 
            hourRate={20} 
            distance={10}
            />
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

