import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListingDetailPage } from '../components/ListingDetailPage'
import type {
  PublicListingDetails,
  PublicListingSummary,
  VerifiedCredentialResponse,
} from '../api/model'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={String(to)}>{children}</a>
    ),
  }
})


const baseListing: PublicListingDetails = {
  listingId: 'listing-1',
  tags: [
    { tagId: 'tag-1', name: 'PC & Laptop', isBarrierefrei: false, isActive: true },
    { tagId: 'tag-2', name: 'Seniors', isBarrierefrei: true, isActive: true },
  ],
  title: 'PC Support & Laptop Help',
  description: 'Whether your computer is running slowly or your printer refuses to connect.',
  price: 20,
  publicationStatus: 'ACTIVE',
  author: { userId: 'user-1', name: 'Klaus', surname: 'Mueller' },
  publishedAt: '2026-01-01T00:00:00Z',
  location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 15 },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  media: [
    {
      mediaId: 'media-1',
      position: 0,
      url: '/media/1',
      altText: 'A laptop on a desk',
      altTextStatus: 'COMPLETED',
      mimeType: 'image/jpeg',
      size: 1000,
      width: 800,
      height: 600,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      mediaId: 'media-2',
      position: 1,
      url: '/media/2',
      altText: null,
      altTextStatus: 'PENDING',
      mimeType: 'image/jpeg',
      size: 1000,
      width: 800,
      height: 600,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
}

const otherListing: PublicListingSummary = {
  listingId: 'listing-2',
  tags: [],
  title: 'Phone Setup',
  description: 'Phone setup help.',
  price: 15,
  author: { userId: 'user-1', name: 'Klaus', surname: 'Mueller' },
  publishedAt: '2026-01-01T00:00:00Z',
  location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 15 },
}

const publicCredentials: VerifiedCredentialResponse[] = [
  {
    credentialType: 'IDENTITY_VERIFIED',
    name: 'Identity verified',
    description: 'Identity has been checked.',
    expiresAt: null,
    verifiedAt: '2026-06-24T10:00:00Z',
  },
]

describe('<ListingDetailPage />', () => {
  it('shows a loading state', () => {
    render(<ListingDetailPage loading otherListings={[]} onBookNow={vi.fn()} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows an error message', () => {
    render(
      <ListingDetailPage
        loading={false}
        error="Listing not found."
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Listing not found.')
  })

  it('renders listing title, price, location, and tags', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        description={baseListing.description}
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: 'PC Support & Laptop Help' })).toBeInTheDocument()
    expect(screen.getByText('20€')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('PC & Laptop')).toBeInTheDocument()
    expect(screen.getByText('Seniors')).toBeInTheDocument()
  })

  it('passes the public credentials to the provider card', () => {
    const { rerender } = render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        publicVerifiedCredentials={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.queryByText('Verified')).not.toBeInTheDocument()

    rerender(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        publicVerifiedCredentials={publicCredentials}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('Verified')).toBeInTheDocument()
    fireEvent.focus(screen.getByText('Verified'))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Identity verified')
  })

  it('renders the resolved description text', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        description="A simplified description."
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('A simplified description.')).toBeInTheDocument()
  })

  it('switches the hero image when a thumbnail is clicked', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show photo 2' }))
    expect(screen.getByRole('button', { name: 'Show photo 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls onBookNow when Book Now is clicked', () => {
    const onBookNow = vi.fn()
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        onBookNow={onBookNow}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(onBookNow).toHaveBeenCalledTimes(1)
  })

  it('renders other listings from the same author', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[otherListing]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('Other services from Klaus')).toBeInTheDocument()
    expect(screen.getByText('Phone Setup')).toBeInTheDocument()
    expect(screen.getByText('From 15€/h')).toBeInTheDocument()
  })

  it('does not render the other-services section when there are none', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Other services from/)).not.toBeInTheDocument()
  })

  it('renders the banner under the navbar when provided', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        onBookNow={vi.fn()}
        banner={<div>Previewing — this is what customers will see</div>}
      />,
    )
    expect(
      screen.getByText('Previewing — this is what customers will see'),
    ).toBeInTheDocument()
  })

  it('does not render a banner by default', () => {
    render(
      <ListingDetailPage
        listing={baseListing}
        loading={false}
        otherListings={[]}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Previewing/)).not.toBeInTheDocument()
  })
})
