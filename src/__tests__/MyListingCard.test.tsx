import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyListingCard, type MyListingSummary } from '../components/MyListingCard'

const baseListing: MyListingSummary = {
  listingId: 'abc-123',
  title: 'PC Support & Laptop Help',
  description: 'Whether your computer is running slowly or your printer refuses to connect.',
  price: 25,
  publicationStatus: 'ACTIVE',
  moderationStatus: 'VISIBLE',
  author: { userId: 'user-1', name: 'Klaus', surname: 'M' },
  publishedAt: '2024-01-01T00:00:00Z',
  location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 15 },
  tags: [],
}

describe('<MyListingCard />', () => {
  it('renders title and description', () => {
    render(<MyListingCard listing={baseListing} onEdit={() => {}} />)
    expect(screen.getByRole('heading', { name: /PC Support & Laptop Help/ })).toBeInTheDocument()
    expect(screen.getByText(/Whether your computer is running slowly/)).toBeInTheDocument()
  })

  it('labels the article by its heading', () => {
    render(<MyListingCard listing={baseListing} onEdit={() => {}} />)
    const heading = screen.getByRole('heading', { name: /PC Support & Laptop Help/ })
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', heading.id)
  })

  it('renders image with explicit altText when provided', () => {
    const listing = {
      ...baseListing,
      primaryMedia: { mediaId: 'm1', url: 'https://cdn.example.com/img.jpg', altText: 'Open laptop on a desk', altTextStatus: 'COMPLETED' as const },
    }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    expect(screen.getByRole('img', { name: 'Open laptop on a desk' })).toBeInTheDocument()
  })

  it('falls back to listing title as alt text when altText is absent', () => {
    const listing = {
      ...baseListing,
      primaryMedia: { mediaId: 'm1', url: 'https://cdn.example.com/img.jpg', altTextStatus: 'COMPLETED' as const },
    }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    expect(screen.getByRole('img', { name: baseListing.title })).toBeInTheDocument()
  })

  it('resolves a relative media url against the API origin', () => {
    const listing = {
      ...baseListing,
      primaryMedia: { mediaId: 'm1', url: '/v1/listing-media/m1/content', altText: 'A laptop', altTextStatus: 'COMPLETED' as const },
    }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    expect(screen.getByRole('img', { name: 'A laptop' })).toHaveAttribute(
      'src',
      'http://localhost:8081/v1/listing-media/m1/content',
    )
  })

  it('renders no image when primaryMedia is absent', () => {
    render(<MyListingCard listing={baseListing} onEdit={() => {}} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not append a status label to the heading for ACTIVE listings', () => {
    render(<MyListingCard listing={baseListing} onEdit={() => {}} />)
    expect(screen.getByRole('heading', { name: 'PC Support & Laptop Help' })).toBeInTheDocument()
  })

  it('appends "(DRAFT)" to the heading accessible name for draft listings', () => {
    const listing = { ...baseListing, publicationStatus: 'DRAFT' as const }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    expect(
      screen.getByRole('heading', { name: /PC Support & Laptop Help.*DRAFT/ })
    ).toBeInTheDocument()
  })

  it('appends "(PAUSED)" to the heading accessible name for paused listings', () => {
    const listing = { ...baseListing, publicationStatus: 'PAUSED' as const }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    expect(
      screen.getByRole('heading', { name: /PC Support & Laptop Help.*PAUSED/ })
    ).toBeInTheDocument()
  })

  it('hides the visual status overlay from assistive technology', () => {
    const listing = { ...baseListing, publicationStatus: 'DRAFT' as const }
    render(<MyListingCard listing={listing} onEdit={() => {}} />)
    const overlay = screen.getByText('DRAFT').closest('div')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('Edit button aria-label identifies which listing is being edited', () => {
    render(<MyListingCard listing={baseListing} onEdit={() => {}} />)
    expect(
      screen.getByRole('button', { name: 'Edit "PC Support & Laptop Help"' })
    ).toBeInTheDocument()
  })

  it('calls onEdit with the correct listingId when Edit is clicked', () => {
    const onEdit = vi.fn()
    render(<MyListingCard listing={baseListing} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /Edit/ }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith('abc-123')
  })
})
