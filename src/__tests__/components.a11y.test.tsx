import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import axe from 'axe-core'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { AvatarIcon } from '../components/AvatarIcon'
import { Badge } from '../components/Badge'
import { Breadcrumb } from '../components/BreadCrumb'
import { Button } from '../components/Button'
import { CategoryCard } from '../components/CategoryCard'
import { FilterBar } from '../components/FilterBar'
import { Input } from '../components/Input'
import { Label } from '../components/Label'
import { Logo } from '../components/Logo'
import { MultiSelect } from '../components/MultiSelect'
import { MyListingCard, type MyListingSummary } from '../components/MyListingCard'
import { Navbar } from '../components/Navbar'
import { Pagination } from '../components/Pagination'
import * as Popover from '../components/Popover'
import { ProviderCard } from '../components/ProviderCard'
import { SearchBar } from '../components/SearchBar'
import { ServiceCard } from '../components/ServiceCard'
import { ServiceProviderToggle } from '../components/ServiceProviderToggle'
import { Slider } from '../components/Slider'
import * as Switch from '../components/Switch'
import { Textarea } from '../components/Textarea'
import { UserMenu } from '../components/UserMenu'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, activeProps, ...props }: {
    children: ReactNode
    to: string
    className?: string
    activeProps?: { className?: string }
  }) => (
    <a href={to} className={className ?? activeProps?.className} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}))

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  })
  expect(results.violations).toEqual([])
}

const listing: MyListingSummary = {
  listingId: 'listing-1',
  title: 'Grocery pickup',
  description: 'Weekly pickup and drop-off support.',
  price: 24,
  publicationStatus: 'ACTIVE',
  moderationStatus: 'VISIBLE',
  author: { name: 'Mira', surname: 'Muster' },
  publishedAt: '2026-06-01T12:00:00Z',
  location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
  primaryMedia: {
    mediaId: 'media-1',
    url: '/listing.jpg',
    altText: 'Shopping bags on a kitchen table',
    altTextStatus: 'COMPLETED',
  },
  tags: [{ tagId: 'tag-1', name: 'Errands', isBarrierefrei: false, isActive: true }],
}

const componentCases: Array<[string, ReactElement]> = [
  ['AccessibilityPanel', <AccessibilityPanel />],
  ['AvatarIcon', <AvatarIcon firstName="Mira" lastName="Muster" picture="/avatar.jpg" />],
  ['Badge', <Badge text="Accessible" />],
  ['Breadcrumb', <Breadcrumb links={[{ name: 'Home', href: '/' }, { name: 'Profile', href: '/profile' }]} />],
  ['Button', <Button>Save</Button>],
  ['CategoryCard', <CategoryCard name="Household" imageSrc="/category.jpg" />],
  ['FilterBar', <FilterBar tagList={[{ name: 'Errands', checked: true }, { name: 'Tutoring', checked: false }]} />],
  [
    'Input',
    (
      <>
        <Label htmlFor="a11y-input">Name</Label>
        <Input id="a11y-input" />
      </>
    ),
  ],
  [
    'Label',
    (
      <>
        <Label htmlFor="standalone-label">Email</Label>
        <input id="standalone-label" />
      </>
    ),
  ],
  ['Logo', <Logo title="Mira" />],
  [
    'MultiSelect',
    (
      <MultiSelect
        aria-label="Service tags"
        options={[{ id: 'errands', label: 'Errands' }, { id: 'support', label: 'Support' }]}
        value={['errands']}
        onChange={vi.fn()}
      />
    ),
  ],
  ['MyListingCard', <MyListingCard listing={listing} onEdit={vi.fn()} />],
  ['Navbar', <Navbar />],
  ['Pagination', <Pagination onPrevious={vi.fn()} onNext={vi.fn()} />],
  [
    'Popover',
    (
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button>Menu</Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <Button>Action</Button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    ),
  ],
  [
    'ProviderCard',
    (
      <ProviderCard
        firstName="Mira"
        lastName="Muster"
        distanceKm={2}
        bio="Friendly local support."
        pricePerHour={20}
        services={[{ name: 'Shopping', price: 20 }]}
      />
    ),
  ],
  ['SearchBar', <SearchBar aria-label="Search services" place="Berlin" />],
  [
    'ServiceCard',
    (
      <ServiceCard
        link="/services/1"
        pictureLink="/service.jpg"
        location="Berlin"
        providerFirstName="Mira"
        providerLastName="Muster"
        varified
        label="Shopping help"
        description="Help with weekly shopping."
        badges={[{ text: 'Errands' }]}
        hourRate={20}
        distance={3}
      />
    ),
  ],
  [
    'ServiceProviderToggle',
    (
      <ServiceProviderToggle
        id="provider-toggle"
        labelLeft="Customer"
        labelRight="Provider"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    ),
  ],
  ['Slider', <Slider label="Distance" min={1} max={50} unit="km" />],
  [
    'Switch',
    (
      <Switch.Root aria-label="Reduce motion" checked={false} onCheckedChange={vi.fn()}>
        <Switch.Thumb />
      </Switch.Root>
    ),
  ],
  [
    'Textarea',
    (
      <>
        <Label htmlFor="a11y-textarea">Description</Label>
        <Textarea id="a11y-textarea" />
      </>
    ),
  ],
  ['UserMenu', <UserMenu firstName="Mira" lastName="Muster" isProvider />],
]

describe('component accessibility', () => {
  it.each(componentCases)('%s has no automated accessibility violations', async (_name, ui) => {
    const { container } = render(ui)
    await expectNoAxeViolations(container)
  })

  it('AccessibilityPanel has no automated accessibility violations when opened', async () => {
    render(<AccessibilityPanel />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /accessibility settings/i })).toBeInTheDocument()
    })
    await expectNoAxeViolations(document.body)
  })

  it('UserMenu has no automated accessibility violations when opened', async () => {
    render(<UserMenu firstName="Mira" lastName="Muster" isProvider />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /mira m\./i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /user menu/i })).toBeInTheDocument()
    })
    await expectNoAxeViolations(document.body)
  })

  it('SearchBar has no automated accessibility violations when location filters are opened', async () => {
    render(<SearchBar aria-label="Search services" place="Berlin" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /berlin - 20km/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /search location filters/i })).toBeInTheDocument()
    })
    await expectNoAxeViolations(document.body)
  })
})
