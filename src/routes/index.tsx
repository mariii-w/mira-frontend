import { createFileRoute } from '@tanstack/react-router'
import { Search, Check, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'

/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/')({ component: Home })

const NEED_HELP_BULLETS = [
  'Browse by category, price, rating',
  'Direct chat with providers',
  'Secure Stripe Payments',
]

const CAN_HELP_BULLETS = [
  'Free to list, only pay on booking',
  'Your schedule, your rates',
  'Build reputation with reviews',
]

function Home() {
  const [query, setQuery] = useState('')

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="bg-background px-6 py-20 text-center">
          <h1 className="font-heading text-5xl font-bold leading-tight">
            <span className="text-primary">Give help.</span>{' '}
            <span className="text-accent">Get help.</span>
          </h1>
          <p className="mt-4 text-muted text-body max-w-md mx-auto">
            On Mira, anyone can offer services or find them.<br />
            Pick your path!
          </p>

          <div className="mt-12 mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* I need help */}
            <article className="rounded-2xl border border-primary/30 bg-mint p-6 text-left flex flex-col gap-4">
              <span className="inline-flex self-start rounded-full bg-primary px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I need help
              </span>
              <h2 className="text-primary text-xl font-heading font-bold">
                Find trusted helpers near you
              </h2>
              <p className="text-small text-foreground/70">
                Search thousands of verified services in your neighbourhood. Book in minutes, pay securely, leave a review.
              </p>

              <div className="flex gap-2">
                <label htmlFor="hero-search" className="sr-only">Search for a service</label>
                <input
                  id="hero-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. PC support, tutoring…"
                  className="flex-1 h-11 px-4 text-small text-foreground bg-surface border border-border rounded-full placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors duration-150"
                />
                <Button variant="primary" trailingIcon={<Search />} size="md">
                  Search
                </Button>
              </div>

              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {NEED_HELP_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-small text-foreground/70">
                    <Check size={14} className="text-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>

            {/* I can help */}
            <article className="rounded-2xl border border-accent/30 bg-blush p-6 text-left flex flex-col gap-4">              <span className="inline-flex self-start rounded-full bg-accent px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I can help
              </span>
              <h2 className="text-accent text-xl font-heading font-bold">
                Turn your skills into income
              </h2>
              <p className="text-small text-foreground/70">
                List the services you offer, set your prices and schedule. We handle bookings, payments and reviews — keep your time.
              </p>

              <Button variant="accent" size="lg" trailingIcon={<ArrowRight />} fullWidth>
                Get started
              </Button>

              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {CAN_HELP_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-small text-foreground/70">
                    <Check size={14} className="text-accent shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>

          </div>
        </section>
      </main>
    </>
  )
}