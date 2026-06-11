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
import { useAuthStore, type User } from '../stores/auth'

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
  useAuthStore.getState().clear()
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

  it('AvatarIcon fallback states have no automated accessibility violations', async () => {
    const { container, rerender } = render(<AvatarIcon firstName="Mira" lastName="Muster" />)
    await expectNoAxeViolations(container)

    rerender(<AvatarIcon picture="/broken-avatar.jpg" />)
    await act(async () => {
      fireEvent.error(screen.getByRole('img', { name: /user avatar/i }))
    })

    expect(screen.getByText('?')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('Button icon and loading states have no automated accessibility violations', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const warningRender = render(<Button variant="icon">Missing label</Button>)
    expect(warn).toHaveBeenCalledWith('[Button] icon variant is missing `aria-label`.')
    warningRender.unmount()
    warn.mockRestore()

    const { container } = render(
      <div>
        <Button variant="icon" size="lg" aria-label="Open filters">
          F
        </Button>
        <Button variant="accent" size="sm" loading fullWidth>
          Save
        </Button>
      </div>,
    )

    await expectNoAxeViolations(container)
  })

  it('FilterBar search and collapsed sections have no automated accessibility violations', async () => {
    const { container } = render(
      <FilterBar
        tagList={[
          { name: 'Errands', checked: true },
          { name: 'Tutoring', checked: false },
        ]}
      />,
    )

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/tags suchen/i), { target: { value: 'tut' } })
      fireEvent.click(screen.getByRole('button', { name: /tags/i }))
    })

    expect(screen.getByRole('button', { name: /tags/i })).toHaveAttribute('aria-expanded', 'false')
    await expectNoAxeViolations(container)
  })

  it('MultiSelect option list states have no automated accessibility violations', async () => {
    const { container } = render(
      <MultiSelect
        id="tag-select"
        aria-label="Service tags"
        aria-describedby="tag-help"
        options={[
          { id: 'errands', label: 'Errands', badge: 'A11y', variant: 'accent' },
          { id: 'support', label: 'Support' },
        ]}
        value={['errands', 'missing']}
        onChange={vi.fn()}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /service tags, 2 selected/i }))
    })

    expect(screen.getByRole('listbox', { name: /service tags/i })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('MultiSelect chip removal and unlabeled state have no automated accessibility violations', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <MultiSelect
        options={[{ id: 'support', label: 'Support' }]}
        value={['support']}
        onChange={onChange}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /remove support/i }))
    })

    expect(onChange).toHaveBeenCalledWith([])
    await expectNoAxeViolations(container)
  })

  it('MultiSelect loading state has no automated accessibility violations', async () => {
    const { container } = render(
      <MultiSelect
        aria-label="Service tags"
        loading
        options={[{ id: 'errands', label: 'Errands' }]}
        value={[]}
        onChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })

  it.each(['DRAFT', 'PAUSED', 'DELETED'] as const)(
    'MyListingCard %s state has no automated accessibility violations',
    async (publicationStatus) => {
      const { container } = render(
        <MyListingCard
          listing={{
            ...listing,
            listingId: `listing-${publicationStatus.toLowerCase()}`,
            publicationStatus,
            primaryMedia:
              publicationStatus === 'DRAFT'
                ? undefined
                : { ...listing.primaryMedia!, altText: null, altTextStatus: 'PENDING' },
          }}
          onEdit={vi.fn()}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
      await expectNoAxeViolations(container)
    },
  )

  it('Navbar login action remains accessible', async () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    })

    const { container } = render(<Navbar />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    expect(window.location.href).toBe('http://localhost:8080/auth/login/google')
    await expectNoAxeViolations(container)

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('Navbar logged-in state has no automated accessibility violations', async () => {
    useAuthStore.getState().setUser({
      userId: 'user-1',
      username: 'mira',
      firstName: 'Mira',
      lastName: 'Muster',
      userType: 'PROVIDER',
      bio: null,
      simplifiedBio: null,
      selfSummary: null,
      accessibilityPreferences: [],
      profileMedia: { mediaId: 'avatar-1', url: '/avatar.jpg' },
      registrationComplete: true,
      isPublic: true,
      privateAddress: null,
    } satisfies User)

    const { container } = render(<Navbar />)
    await expectNoAxeViolations(container)
  })

  it('Popover keyboard and outside-click behavior has no automated accessibility violations', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button>Open actions</Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="Actions" align="start" sideOffset={4}>
            <Button>First</Button>
            <Button>Last</Button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open actions/i }))
    })
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /actions/i })).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByRole('button', { name: /last/i }).focus()
      fireEvent.keyDown(document, { key: 'Tab' })
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    expect(screen.queryByRole('dialog', { name: /actions/i })).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open actions/i }))
    })
    await act(async () => {
      fireEvent.mouseDown(document.body)
    })

    expect(screen.queryByRole('dialog', { name: /actions/i })).not.toBeInTheDocument()
    await expectNoAxeViolations(document.body)
  })

  it('ProviderCard full state has no automated accessibility violations', async () => {
    const { container } = render(
      <ProviderCard
        variant="full"
        firstName="Mira"
        lastName="Muster"
        avatar={<AvatarIcon firstName="Mira" lastName="Muster" />}
        distanceKm={2}
        bio="Friendly local support."
        pricePerHour={20}
        services={[{ name: 'Shopping', price: 20 }]}
        badges={<Badge text="Verified" />}
        onMessage={vi.fn()}
        onViewProfile={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })

  it('Slider disabled and controlled states have no automated accessibility violations', async () => {
    const onChange = vi.fn()
    const onChangeCommitted = vi.fn()
    const { container } = render(
      <div>
        <Slider label="Exact distance" min={10} max={10} disabled />
        <Slider label="Price" min={0} max={100} value={25} onChange={onChange} onChangeCommitted={onChangeCommitted} />
      </div>,
    )

    await act(async () => {
      const price = screen.getByRole('slider', { name: /price/i })
      fireEvent.change(price, { target: { value: '50' } })
      fireEvent.mouseUp(price)
      fireEvent.keyUp(price, { key: 'Home' })
      fireEvent.keyUp(price, { key: 'Tab' })
    })

    expect(onChange).toHaveBeenCalledWith(50)
    expect(onChangeCommitted).toHaveBeenCalled()
    await expectNoAxeViolations(container)
  })

  it('Switch checked state has no automated accessibility violations', async () => {
    const onCheckedChange = vi.fn()
    const { container } = render(
      <Switch.Root aria-label="Easy language" checked onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch.Root>,
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('switch', { name: /easy language/i }))
    })

    expect(onCheckedChange).toHaveBeenCalledWith(false)
    await expectNoAxeViolations(container)
  })

  it('UserMenu non-provider state has no automated accessibility violations', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<UserMenu firstName="Mira" lastName="" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^mira$/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /user menu/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole('link', { name: /my services/i })).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    })

    await expectNoAxeViolations(document.body)
    vi.unstubAllGlobals()
  })
})
