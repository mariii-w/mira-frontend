import { createFileRoute } from '@tanstack/react-router'
import { Search, Check, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useRef } from 'react'
import { usePageTitle } from '../lib/usePageTitle'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { CategoryCard } from '../components/CategoryCard'
import { ProviderCard } from '../components/ProviderCard'
import { Logo } from '../components/Logo'
import { AvatarIcon } from '../components/AvatarIcon'

/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/')({ component: Home })

const NEED_HELP_BULLETS = [
  'Browse by category, location & price',
  'Direct chat with providers',
  'Secure payments via Stripe',
]

const CAN_HELP_BULLETS = [
  'Free to list — consumers pay you',
  'Your schedule, your rates',
  'Manage availability with a calendar',
]

const NEED_HELP_STEPS = [
  { n: 1, title: 'Search & Filter', desc: 'Type what you need, filter by location radius, category, price or rating.' },
  { n: 2, title: 'Chat with the helper', desc: 'Message directly to agree on details, timing or any special requests.' },
  { n: 3, title: 'Book', desc: 'Pick a time slot and send your booking request. The provider confirms availability.' },
  { n: 4, title: 'Pay', desc: 'Pay via Stripe once your booking is confirmed. Your payment is held until the job is done.' },
]

const CAN_HELP_STEPS = [
  { n: 1, title: 'Register as a provider', desc: 'Verify your identity and complete your profile.' },
  { n: 2, title: 'Create your listings', desc: 'Add title, description, images, price and location for each service.' },
  { n: 3, title: 'Accept & deliver', desc: 'Receive booking requests, chat with the customer, confirm timing and show up.' },
  { n: 4, title: 'Get paid', desc: 'Payment is released to you once the service is marked complete. Simple.' },
]

const CATEGORIES = [
  { name: 'Assembly',      seed: 'assembly' },
  { name: 'PC Support',    seed: 'pc' },
  { name: 'Art Lessons',   seed: 'art' },
  { name: 'Music Lessons', seed: 'music' },
  { name: 'Elder Help',    seed: 'elder' },
  { name: 'Tutoring',      seed: 'tutor' },
  { name: 'Cleaning',      seed: 'clean' },
  { name: 'Moving',        seed: 'moving' },
]

const PROVIDERS = [
  { firstName: 'Patrick ',lastName:'Smith', distanceKm: 1.2, bio: 'Helps with Windows, printers, Wi-Fi setup and phone issues. Patient and friendly with first-time users and seniors.', pricePerHour: 25 },
  { firstName: 'Mira L.',lastName:'Long',    distanceKm: 3.4, bio: 'Math tutor for high-school and first-year uni students. Exam preparation, homework help, flexible evening slots.', pricePerHour: 20 },
  { firstName: 'Thomas R.',lastName:'Richard',  distanceKm: 0.8, bio: 'Fast and reliable furniture assembly, IKEA & other brands. Also mounts TVs, shelves and blinds.', pricePerHour: 28 },
  { firstName: 'Anna W.',lastName:'Washington',    distanceKm: 2.2, bio: 'Professional cleaner with 5 years experience. Deep cleans, regular visits, and move-out cleaning available.', pricePerHour: 22 },
]

const FOOTER_LINKS = ['About', 'Contact Us', 'Accessibility', 'Terms of Use', 'Privacy Policy']

function Home() {
  usePageTitle('')
  const [query, setQuery] = useState('')
  const categoryRef = useRef<HTMLUListElement>(null)
  const providerRef = useRef<HTMLUListElement>(null)

  function scroll(ref: React.RefObject<HTMLUListElement | null>, dir: 'left' | 'right') {
    ref.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <main id="main-content">

        {/* ── Hero ── */}
        <section className="bg-background px-6 py-20 text-center" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="font-heading text-5xl font-bold leading-tight">
            <span className="text-primary">Give help.</span>{' '}
            <span className="text-accent">Get help.</span>
          </h1>
          <p className="mt-4 text-muted text-body max-w-md mx-auto">
            On Mira, anyone can offer services or find them.<br />
            Pick your path!
          </p>

          <div className="mt-12 mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* I need help */}
            <article
              className="rounded-2xl border border-primary/30 bg-mint p-6 text-left flex flex-col gap-4"
              aria-labelledby="need-help-heading"
            >
              <span className="inline-flex self-start rounded-full bg-primary px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I need help
              </span>
              <h2 id="need-help-heading" className="text-primary text-xl font-heading font-bold">
                Find trusted helpers near you
              </h2>
              <p className="text-small text-foreground/70">
                Search thousands of verified services in your neighbourhood. Book in minutes, pay securely, leave a review.
              </p>
              <form role="search" className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="hero-search" className="sr-only">Search for a service</label>
                <input
                  id="hero-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. PC support, tutoring…"
                  className="flex-1 h-11 px-4 text-small text-foreground bg-surface border border-border rounded-full placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors duration-150"
                />
                <Button variant="primary" trailingIcon={<Search />} size="md" type="submit">Search</Button>
              </form>
              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {NEED_HELP_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-small text-foreground/70">
                    <Check size={14} className="text-primary shrink-0" aria-hidden="true" />{b}
                  </li>
                ))}
              </ul>
            </article>

            {/* I can help */}
            <article
              className="rounded-2xl border border-accent/30 bg-blush p-6 text-left flex flex-col gap-4"
              aria-labelledby="can-help-heading"
            >
              <span className="inline-flex self-start rounded-full bg-accent px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I can help
              </span>
              <h2 id="can-help-heading" className="text-accent text-xl font-heading font-bold">
                Turn your skills into income
              </h2>
              <p className="text-small text-foreground/70">
                List the services you offer, set your prices and availability. We handle bookings and payments — keep your time.
              </p>
              <Button variant="accent" size="lg" trailingIcon={<ArrowRight />} fullWidth>Get started</Button>
              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {CAN_HELP_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-small text-foreground/70">
                    <Check size={14} className="text-accent shrink-0" aria-hidden="true" />{b}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* ── How Mira Works ── */}
        <section id="how-it-works" className="bg-linen px-6 py-20" aria-labelledby="how-it-works-heading">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-label font-bold text-accent uppercase tracking-widest mb-2">How Mira Works</p>
            <h2 id="how-it-works-heading" className="text-center font-heading text-4xl font-bold text-foreground mb-2">
              Simple for both sides
            </h2>
            <p className="text-center text-muted text-body mb-12">No sign-up to browse. No hidden fees. No stress.</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <article
                className="rounded-2xl border border-primary/30 bg-surface p-6 flex flex-col gap-4"
                aria-labelledby="need-help-steps-heading"
              >
                <h3 id="need-help-steps-heading" className="font-heading font-bold text-xl text-primary">
                  If you need help
                </h3>
                <p className="text-small text-muted">Go from idea to booked in under 5 minutes.</p>
                <ol className="flex flex-col divide-y divide-border/30 list-none m-0 p-0">
                  {NEED_HELP_STEPS.map((step) => (
                    <li key={step.n} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full bg-mint border border-primary/30 flex items-center justify-center text-label font-bold text-primary mt-0.5"
                        aria-hidden="true"
                      >
                        {step.n}
                      </span>
                      <div>
                        <p className="font-bold text-small text-foreground">
                          <span className="sr-only">Step {step.n}: </span>{step.title}
                        </p>
                        <p className="text-small text-foreground/70 mt-0.5">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              <article
                className="rounded-2xl border border-accent/30 bg-surface p-6 flex flex-col gap-4"
                aria-labelledby="can-help-steps-heading"
              >
                <h3 id="can-help-steps-heading" className="font-heading font-bold text-xl text-accent">
                  If you offer help
                </h3>
                <p className="text-small text-muted">Your schedule, your rates, your reputation.</p>
                <ol className="flex flex-col divide-y divide-border/30 list-none m-0 p-0">
                  {CAN_HELP_STEPS.map((step) => (
                    <li key={step.n} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full bg-blush border border-accent/30 flex items-center justify-center text-label font-bold text-accent mt-0.5"
                        aria-hidden="true"
                      >
                        {step.n}
                      </span>
                      <div>
                        <p className="font-bold text-small text-foreground">
                          <span className="sr-only">Step {step.n}: </span>{step.title}
                        </p>
                        <p className="text-small text-foreground/70 mt-0.5">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </section>

        {/* ── Popular Categories ── */}
        <section className="bg-background py-20" aria-labelledby="categories-heading">
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-label font-bold text-accent uppercase tracking-widest mb-2">Popular Categories</p>
            <div className="flex items-end justify-between mb-6">
              <h2 id="categories-heading" className="font-heading text-4xl font-bold text-foreground">
                What are people booking today?
              </h2>
              <div className="flex gap-2 shrink-0 ml-4" role="group" aria-label="Scroll categories">
                <button
                  type="button"
                  onClick={() => scroll(categoryRef, 'left')}
                  aria-label="Scroll categories left"
                  aria-controls="categories-list"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(categoryRef, 'right')}
                  aria-label="Scroll categories right"
                  aria-controls="categories-list"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            <ul
              id="categories-list"
              ref={categoryRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth list-none m-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              style={{ scrollbarWidth: 'none' }}
              tabIndex={0}
              aria-label="Popular service categories"
            >
              {CATEGORIES.map((cat) => (
                <li key={cat.seed} className="snap-start shrink-0 w-48">
                  <CategoryCard name={cat.name} imageSrc={`https://picsum.photos/seed/${cat.seed}/400`} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Help near you ── */}
        <section className="bg-linen py-20" aria-labelledby="nearby-heading">
          <div className="mx-auto max-w-4xl px-6">
            <h2 id="nearby-heading" className="font-heading text-3xl font-bold text-foreground mb-1">Help near you</h2>
            <div className="flex items-end justify-between mb-6">
              <p className="text-muted text-small">Based on your location • Munich, 10km radius</p>
              <div className="flex gap-2 shrink-0 ml-4" role="group" aria-label="Scroll providers">
                <button
                  type="button"
                  onClick={() => scroll(providerRef, 'left')}
                  aria-label="Scroll providers left"
                  aria-controls="providers-list"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(providerRef, 'right')}
                  aria-label="Scroll providers right"
                  aria-controls="providers-list"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            <ul
              id="providers-list"
              ref={providerRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth list-none m-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              style={{ scrollbarWidth: 'none' }}
              tabIndex={0}
              aria-label="Helpers near you"
            >
              {PROVIDERS.map((p) => (
                <li key={p.firstName} className="snap-start shrink-0 w-64">
                  <ProviderCard
                    variant="compact"
                    firstName={p.firstName}
                    lastName={p.lastName}
                    avatar={<AvatarIcon firstName={p.firstName} lastName={p.lastName} picture=''/>}
                    distanceKm={p.distanceKm}
                    bio={p.bio}
                    pricePerHour={p.pricePerHour}
                    
                  />
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <a href="/" className="inline-flex items-center gap-2 text-primary font-medium no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                View all helpers near you <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-charcoal px-6 py-10">
        <div className="mx-auto max-w-4xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 max-w-[180px]">
            <Logo variant="white" height={32} title="Mira" />
            <p className="text-small text-cream/50 leading-relaxed">
              A service marketplace connecting people with trusted local helpers. Designed for everyone.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 list-none m-0 p-0 justify-end">
              {FOOTER_LINKS.map((link, i) => (
                <li key={link} className="flex items-center gap-4">
                  {i > 0 && <span className="text-cream/30 select-none" aria-hidden="true">·</span>}
                  
                    <a href={`/${link.toLowerCase().replace(/ /g, '-')}`}
                    className="text-small text-cream/70 no-underline hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream rounded transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </>
  )
}