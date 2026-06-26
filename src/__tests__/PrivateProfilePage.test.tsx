import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrivateProfilePage } from '../components/PrivateProfilePage'
import type { MyListingSummary } from '../api/model'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}))

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

const baseListing: MyListingSummary = {
  listingId: 'listing-1',
  title: 'Home Cleaning',
  description: 'Thorough cleaning for kitchens and bathrooms.',
  price: 25,
  publicationStatus: 'ACTIVE',
  moderationStatus: 'VISIBLE',
  author: { userId: 'user-1', name: 'Mira', surname: 'Hofer' },
  publishedAt: '2026-01-01T00:00:00Z',
  location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
  tags: [],
}

const baseProps = {
  userFirstName: 'Mira',
  userLastName: 'Hofer',
  selfSummary: 'I help people with everyday tasks.',
  bio: null,
  city: 'Berlin',
  pictureUrl: undefined,
  isProvider: true,
  ownerListings: [],
  onEditClick: vi.fn(),
  onEditListing: vi.fn(),
}

describe('<PrivateProfilePage />', () => {
  it('renders the user name as an h1', () => {
    render(<PrivateProfilePage {...baseProps} />)
    expect(screen.getByRole('heading', { level: 1, name: /Mira Hofer/ })).toBeInTheDocument()
  })

  it('renders "Provider" role label for provider accounts', () => {
    render(<PrivateProfilePage {...baseProps} />)
    expect(screen.getByText('Provider')).toBeInTheDocument()
  })

  it('renders "Consumer" role label for consumer accounts', () => {
    render(<PrivateProfilePage {...baseProps} isProvider={false} />)
    expect(screen.getByText('Consumer')).toBeInTheDocument()
  })

  it('renders city with a visually hidden "Location:" prefix', () => {
    render(<PrivateProfilePage {...baseProps} />)
    expect(screen.getByText('Location:')).toHaveClass('sr-only')
    expect(screen.getByText('Berlin')).toBeInTheDocument()
  })

  it('does not render the city paragraph when city is empty', () => {
    render(<PrivateProfilePage {...baseProps} city="" />)
    expect(screen.queryByText('Location:')).not.toBeInTheDocument()
  })

  it('wraps page content in a main landmark', () => {
    render(<PrivateProfilePage {...baseProps} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the uploaded profile picture with the user name as alt text', () => {
    render(<PrivateProfilePage {...baseProps} pictureUrl="/profile/mira.png" />)
    expect(screen.getByRole('img', { name: 'Mira Hofer avatar' })).toHaveAttribute('src', '/profile/mira.png')
  })

  it('calls onEditClick when the Edit Profile button is clicked', () => {
    const onEditClick = vi.fn()
    render(<PrivateProfilePage {...baseProps} onEditClick={onEditClick} />)
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    expect(onEditClick).toHaveBeenCalledOnce()
  })

  describe('Quick Actions nav', () => {
    it('renders a Quick Actions nav landmark for providers', () => {
      render(<PrivateProfilePage {...baseProps} />)
      expect(screen.getByRole('navigation', { name: /quick actions/i })).toBeInTheDocument()
    })

    it('links to My Services, Create Service, Calendar, My Bookings, and Get Verified', () => {
      render(<PrivateProfilePage {...baseProps} />)
      expect(screen.getByRole('link', { name: /my services/i })).toHaveAttribute('href', '/my-listings')
      expect(screen.getByRole('link', { name: /create service/i })).toHaveAttribute('href', '/create-listing')
      expect(screen.getByRole('link', { name: /calendar/i })).toHaveAttribute('href', '/calendar')
      expect(screen.getByRole('link', { name: /my bookings/i })).toHaveAttribute('href', '/my-bookings')
      expect(screen.getByRole('link', { name: /get verified/i })).toHaveAttribute('href', '/my-credentials')
    })

    it('does not render Quick Actions for consumer accounts', () => {
      render(<PrivateProfilePage {...baseProps} isProvider={false} />)
      expect(screen.queryByRole('navigation', { name: /quick actions/i })).not.toBeInTheDocument()
    })
  })

  describe('About me section', () => {
    it('shows selfSummary when provided', () => {
      render(<PrivateProfilePage {...baseProps} selfSummary="I help people." bio={null} />)
      expect(screen.getByText('I help people.')).toBeInTheDocument()
    })

    it('shows bio when provided', () => {
      render(<PrivateProfilePage {...baseProps} selfSummary="" bio="Long form biography here." />)
      expect(screen.getByText('Long form biography here.')).toBeInTheDocument()
    })

    it('shows both selfSummary and bio when both are provided', () => {
      render(<PrivateProfilePage {...baseProps} selfSummary="Short summary." bio="Long biography." />)
      expect(screen.getByText('Short summary.')).toBeInTheDocument()
      expect(screen.getByText('Long biography.')).toBeInTheDocument()
    })

    it('shows "No description provided." when neither selfSummary nor bio is given', () => {
      render(<PrivateProfilePage {...baseProps} selfSummary="" bio={null} />)
      expect(screen.getByText('No description provided.')).toBeInTheDocument()
    })
  })

  describe('My Services section', () => {
    it('does not render My Services for consumer accounts', () => {
      render(<PrivateProfilePage {...baseProps} isProvider={false} />)
      expect(screen.queryByRole('heading', { name: /my services/i })).not.toBeInTheDocument()
    })

    it('shows "No active services yet." when the listing list is empty', () => {
      render(<PrivateProfilePage {...baseProps} ownerListings={[]} />)
      expect(screen.getByText('No active services yet.')).toBeInTheDocument()
    })

    it('does not render listing edit buttons when the listing list is empty', () => {
      render(<PrivateProfilePage {...baseProps} ownerListings={[]} />)
      expect(screen.queryByRole('button', { name: /edit "/i })).not.toBeInTheDocument()
    })

    it('renders a card for each listing', () => {
      const listings = [
        baseListing,
        { ...baseListing, listingId: 'listing-2', title: 'Garden Help' },
      ]
      render(<PrivateProfilePage {...baseProps} ownerListings={listings} />)
      expect(screen.getByRole('heading', { name: /Home Cleaning/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Garden Help/ })).toBeInTheDocument()
    })

    it('announces the service count to screen readers using singular form', () => {
      render(<PrivateProfilePage {...baseProps} ownerListings={[baseListing]} />)
      expect(screen.getByText('1 active service')).toHaveClass('sr-only')
    })

    it('announces the service count to screen readers using plural form', () => {
      const listings = [
        baseListing,
        { ...baseListing, listingId: 'listing-2', title: 'Garden Help' },
      ]
      render(<PrivateProfilePage {...baseProps} ownerListings={listings} />)
      expect(screen.getByText('2 active services')).toHaveClass('sr-only')
    })

    it('calls onEditListing with the correct listingId when an Edit button is clicked', () => {
      const onEditListing = vi.fn()
      render(<PrivateProfilePage {...baseProps} ownerListings={[baseListing]} onEditListing={onEditListing} />)
      fireEvent.click(screen.getByRole('button', { name: /edit "Home Cleaning"/i }))
      expect(onEditListing).toHaveBeenCalledOnce()
      expect(onEditListing).toHaveBeenCalledWith('listing-1')
    })
  })
})
