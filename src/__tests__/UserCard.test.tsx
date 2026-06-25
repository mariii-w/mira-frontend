import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { computeAccessibleDescription } from 'dom-accessibility-api'
import { describe, expect, it, vi } from 'vitest'
import { UserCard } from '../components/search/cards/UserCard'
import type { PublicProfileResponse } from '../api/model'
import type { ProviderServiceSummary } from '../lib/providerServiceSummary'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    'aria-label': ariaLabel,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode; to: string; 'aria-label'?: string }) => (
    <a href={to} className={className} aria-label={ariaLabel} {...props}>{children}</a>
  ),
}))

function profile(overrides: Partial<PublicProfileResponse> = {}): PublicProfileResponse {
  return {
    userId: 'user-1',
    username: 'pat.s',
    firstName: 'Patrick',
    lastName: 'Smith',
    userType: 'PROVIDER',
    city: 'Berlin',
    bio: 'Friendly help with everyday tasks.',
    simplifiedBio: null,
    selfSummary: 'Five years of experience.',
    accessibilityPreferences: [],
    profileMedia: null,
    verified: false,
    ...overrides,
  }
}

const providerSummary: ProviderServiceSummary = {
  serviceCount: 4,
  startingPrice: 20,
  topTags: [
    { tagId: 'wifi', name: 'Wi-Fi Setup', usageCount: 2, isBarrierefrei: false, minPrice: 22 },
  ],
}

describe('<UserCard /> role palettes', () => {
  it('uses the green palette for providers', () => {
    render(<UserCard profile={profile({ userType: 'PROVIDER' })} easyRead={false} />)
    expect(screen.getByRole('link', { name: 'View profile of Patrick Smith' })).toHaveClass('bg-forest')
  })

  it('uses the violet palette for consumers', () => {
    render(<UserCard profile={profile({ userType: 'CUSTOMER' })} easyRead={false} />)
    expect(screen.getByRole('link', { name: 'View profile of Patrick Smith' })).toHaveClass('bg-accent')
  })
})

describe('<UserCard /> content', () => {
  it('renders the city when present', () => {
    render(<UserCard profile={profile({ city: 'Berlin' })} easyRead={false} />)
    expect(screen.getByText('Berlin')).toBeInTheDocument()
  })

  it('omits the city row when city is null', () => {
    render(<UserCard profile={profile({ city: null })} easyRead={false} />)
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument()
  })

  it('never renders username, self-summary, or distance', () => {
    render(<UserCard profile={profile({ username: 'pat.s', selfSummary: 'Five years of experience.' })} easyRead={false} />)
    expect(screen.queryByText('pat.s')).not.toBeInTheDocument()
    expect(screen.queryByText('@pat.s')).not.toBeInTheDocument()
    expect(screen.queryByText('Five years of experience.')).not.toBeInTheDocument()
    expect(screen.queryByText(/km away/)).not.toBeInTheDocument()
  })

  it('shows the normal biography by default', () => {
    render(<UserCard profile={profile({ bio: 'Normal bio.', simplifiedBio: 'Simple bio.' })} easyRead={false} />)
    expect(screen.getByText('Normal bio.')).toBeInTheDocument()
    expect(screen.queryByText('Simple bio.')).not.toBeInTheDocument()
  })

  it('shows the simplified biography when easy-read is active and available', () => {
    render(<UserCard profile={profile({ bio: 'Normal bio.', simplifiedBio: 'Simple bio.' })} easyRead={true} />)
    expect(screen.getByText('Simple bio.')).toBeInTheDocument()
    expect(screen.queryByText('Normal bio.')).not.toBeInTheDocument()
  })

  it('falls back to the normal biography when easy-read is active but no simplified value exists', () => {
    render(<UserCard profile={profile({ bio: 'Normal bio.', simplifiedBio: null })} easyRead={true} />)
    expect(screen.getByText('Normal bio.')).toBeInTheDocument()
  })
})

describe('<UserCard /> links', () => {
  it('renders only the View Profile link pointing to "/"', () => {
    render(<UserCard profile={profile({ firstName: 'Patrick', lastName: 'Smith' })} easyRead={false} />)
    const viewProfile = screen.getByRole('link', { name: 'View profile of Patrick Smith' })
    expect(viewProfile).toHaveAttribute('href', '/')
    expect(viewProfile).toHaveTextContent('View Profile')
    expect(screen.queryByRole('link', { name: 'Message Patrick Smith' })).not.toBeInTheDocument()
  })
})

describe('<UserCard /> verification', () => {
  it('exposes an accessible "Verified profile" indicator when the profile is verified', () => {
    render(<UserCard profile={profile({ verified: true })} easyRead={false} />)
    expect(screen.getByRole('img', { name: 'Verified profile' })).toBeInTheDocument()
  })

  it('omits the "Verified profile" indicator when the profile is not verified', () => {
    render(<UserCard profile={profile({ verified: false })} easyRead={false} />)
    expect(screen.queryByRole('img', { name: 'Verified profile' })).not.toBeInTheDocument()
  })
})

describe('<UserCard /> provider enrichment', () => {
  it('shows the minimum price and provider services section on success', () => {
    render(<UserCard profile={profile({ userType: 'PROVIDER' })} easyRead={false} providerSummary={providerSummary} />)
    expect(screen.getByText('20€/hr')).toBeInTheDocument()
    expect(screen.getByText('Offers 4 services')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi Setup • 22€')).toBeInTheDocument()
  })

  it('omits price and services when enrichment has not completed', () => {
    render(<UserCard profile={profile({ userType: 'PROVIDER' })} easyRead={false} />)
    expect(screen.queryByText(/€\/hr/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Offers/)).not.toBeInTheDocument()
  })

  it('omits price and services for consumer cards even if a summary is passed', () => {
    render(<UserCard profile={profile({ userType: 'CUSTOMER' })} easyRead={false} providerSummary={providerSummary} />)
    expect(screen.queryByText(/€\/hr/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Offers/)).not.toBeInTheDocument()
  })

  it('omits the price block when startingPrice is null but still shows the services section', () => {
    render(
      <UserCard
        profile={profile({ userType: 'PROVIDER' })}
        easyRead={false}
        providerSummary={{ serviceCount: 0, startingPrice: null, topTags: [] }}
      />,
    )
    expect(screen.queryByText(/€\/hr/)).not.toBeInTheDocument()
    expect(screen.getByText('Offers 0 services')).toBeInTheDocument()
  })
})

describe('<UserCard /> accessible navigation links', () => {
  it('puts the full profile context on the card group, not the link', () => {
    render(<UserCard profile={profile({ firstName: 'Patrick', lastName: 'Smith' })} easyRead={false} />)
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    const card = screen.getByRole('group', { name: 'Patrick Smith' })
    expect(card).toBeInTheDocument()

    const viewProfile = screen.getByRole('link', { name: 'View profile of Patrick Smith' })
    expect(viewProfile).toHaveTextContent('View Profile')
    expect(viewProfile).toHaveAttribute('href', '/')
  })

  it('describes role and city for a consumer card with no enrichment, and excludes price', () => {
    render(
      <UserCard
        profile={profile({ userType: 'CUSTOMER', city: 'Berlin', bio: 'Friendly help.', firstName: 'Anna', lastName: 'Weber' })}
        easyRead={false}
      />,
    )
    const card = screen.getByRole('group', { name: 'Anna Weber' })
    const description = computeAccessibleDescription(card)
    expect(description).toContain('Consumer')
    expect(description).toContain('Berlin')
    expect(description).toContain('Friendly help.')
    expect(description).not.toContain('From')
  })

  it('describes role, price, city, bio, verification, and services for an enriched provider card', () => {
    render(
      <UserCard
        profile={profile({ userType: 'PROVIDER', city: 'Berlin', bio: 'Friendly help.', verified: true })}
        easyRead={false}
        providerSummary={providerSummary}
      />,
    )
    const card = screen.getByRole('group', { name: 'Patrick Smith' })
    const description = computeAccessibleDescription(card)
    expect(description).toContain('Provider')
    expect(description).toContain('From')
    expect(description).toContain('20€/hr')
    expect(description).toContain('Berlin')
    expect(description).toContain('Friendly help.')
    expect(description).toContain('Verified profile')
    expect(description).toContain('Wi-Fi Setup • 22€')
  })

  it('omits city and price from the description when absent', () => {
    render(<UserCard profile={profile({ userType: 'PROVIDER', city: null, bio: null })} easyRead={false} />)
    const card = screen.getByRole('group', { name: 'Patrick Smith' })
    const description = computeAccessibleDescription(card)
    expect(description).not.toContain('Berlin')
    expect(description).not.toContain('From')
  })
})
