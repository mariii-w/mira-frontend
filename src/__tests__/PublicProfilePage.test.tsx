import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PublicProfilePage } from '../components/PublicProfilePage'
import { useAccessibilityStore } from '../stores/accessibility'
import type { ServiceCardProps } from '../components/ServiceCard'
import type { VerifiedCredentialResponse } from '../api/model'

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('../stores/accessibility', () => ({
  useAccessibilityStore: vi.fn((selector: (s: { easyRead: boolean }) => unknown) =>
    selector({ easyRead: false })
  ),
}))

const credentials: VerifiedCredentialResponse[] = [
  {
    credentialType: 'IDENTITY_VERIFIED',
    name: 'Identity verified',
    description: 'ID has been checked.',
    expiresAt: null,
    verifiedAt: '2026-01-01T00:00:00Z',
  },
]

const serviceListings: ServiceCardProps[] = [
  {
    link: '/listings/listing-1',
    label: 'PC Support',
    hourRate: 20,
    location: 'Berlin',
    providerFirstName: 'Klaus',
    providerLastName: 'Mueller',
    tags: [],
  },
]

const baseProps = {
  userFirstName: 'Klaus',
  userLastName: 'Mueller',
  username: 'klausm',
  selfSummary: 'Retired IT professional.',
  bio: null,
  simplifiedBio: null,
  city: 'Munich',
  pictureUrl: undefined,
  isProvider: true,
  verified: false,
  credentials: [],
  publicServiceListings: [],
}

describe('<PublicProfilePage />', () => {
  it('renders the user name as an h1', () => {
    render(<PublicProfilePage {...baseProps} />)
    expect(screen.getByRole('heading', { level: 1, name: /Klaus Mueller/ })).toBeInTheDocument()
  })

  it('renders the username handle with @ prefix', () => {
    render(<PublicProfilePage {...baseProps} />)
    expect(screen.getByText('@klausm')).toBeInTheDocument()
  })

  it('renders "Provider" for provider accounts', () => {
    render(<PublicProfilePage {...baseProps} />)
    expect(screen.getByText('Provider')).toBeInTheDocument()
  })

  it('renders "Consumer" for consumer accounts', () => {
    render(<PublicProfilePage {...baseProps} isProvider={false} />)
    expect(screen.getByText('Consumer')).toBeInTheDocument()
  })

  it('renders city with a visually hidden "Location:" prefix', () => {
    render(<PublicProfilePage {...baseProps} />)
    expect(screen.getByText('Location:')).toHaveClass('sr-only')
    expect(screen.getByText('Munich')).toBeInTheDocument()
  })

  it('does not render the city paragraph when city is empty', () => {
    render(<PublicProfilePage {...baseProps} city="" />)
    expect(screen.queryByText('Location:')).not.toBeInTheDocument()
  })

  it('wraps page content in a main landmark', () => {
    render(<PublicProfilePage {...baseProps} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the uploaded profile picture with the user name as alt text', () => {
    render(<PublicProfilePage {...baseProps} pictureUrl="/profile/klaus.png" />)
    expect(screen.getByRole('img', { name: 'Klaus Mueller avatar' })).toHaveAttribute('src', '/profile/klaus.png')
  })

  describe('VerifiedBadge', () => {
    it('is not shown when verified is false', () => {
      render(<PublicProfilePage {...baseProps} verified={false} credentials={credentials} />)
      expect(screen.queryByRole('img', { name: /verified/i })).not.toBeInTheDocument()
    })

    it('is not shown when credentials list is empty even if verified', () => {
      render(<PublicProfilePage {...baseProps} verified={true} credentials={[]} />)
      expect(screen.queryByRole('img', { name: /verified/i })).not.toBeInTheDocument()
    })

    it('is shown with an aria-label listing all credential names', () => {
      render(<PublicProfilePage {...baseProps} verified={true} credentials={credentials} />)
      expect(
        screen.getByRole('img', { name: 'Verified: Identity verified' })
      ).toBeInTheDocument()
    })

    it('includes all credential names in the aria-label when there are multiple', () => {
      const multi: VerifiedCredentialResponse[] = [
        { ...credentials[0] },
        {
          credentialType: 'STUDENT_VERIFIED',
          name: 'Student verified',
          description: 'Student ID checked.',
          expiresAt: null,
          verifiedAt: '2026-01-01T00:00:00Z',
        },
      ]
      render(<PublicProfilePage {...baseProps} verified={true} credentials={multi} />)
      expect(
        screen.getByRole('img', { name: 'Verified: Identity verified, Student verified' })
      ).toBeInTheDocument()
    })

    it('shows a tooltip with credential names on focus', () => {
      render(<PublicProfilePage {...baseProps} verified={true} credentials={credentials} />)
      fireEvent.focus(screen.getByRole('img', { name: /verified/i }))
      expect(screen.getByRole('tooltip')).toHaveTextContent('Identity verified')
    })

    it('shows and hides the tooltip on pointer hover', () => {
      render(<PublicProfilePage {...baseProps} verified={true} credentials={credentials} />)
      const badge = screen.getByRole('img', { name: /verified/i })
      fireEvent.mouseEnter(badge)
      expect(screen.getByRole('tooltip')).toHaveTextContent('Identity verified')
      fireEvent.mouseLeave(badge)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('hides the tooltip on blur', () => {
      render(<PublicProfilePage {...baseProps} verified={true} credentials={credentials} />)
      const badge = screen.getByRole('img', { name: /verified/i })
      fireEvent.focus(badge)
      fireEvent.blur(badge)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('How it works sidebar', () => {
    it('shows "How to book" heading for providers', () => {
      render(<PublicProfilePage {...baseProps} isProvider={true} />)
      expect(screen.getByRole('heading', { name: 'How to book' })).toBeInTheDocument()
    })

    it('shows "How it works" heading for consumers', () => {
      render(<PublicProfilePage {...baseProps} isProvider={false} />)
      expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument()
    })

    it('renders provider-specific booking steps', () => {
      render(<PublicProfilePage {...baseProps} isProvider={true} />)
      expect(screen.getByText('Explore services')).toBeInTheDocument()
      expect(screen.getByText('Book & confirm')).toBeInTheDocument()
    })

    it('renders consumer-specific how-it-works steps', () => {
      render(<PublicProfilePage {...baseProps} isProvider={false} />)
      expect(screen.getByText('Create your profile')).toBeInTheDocument()
      expect(screen.getByText('Browse services')).toBeInTheDocument()
    })
  })

  describe('About me section', () => {
    it('shows selfSummary when provided', () => {
      render(<PublicProfilePage {...baseProps} selfSummary="Short tagline." bio={null} />)
      expect(screen.getByText('Short tagline.')).toBeInTheDocument()
    })

    it('shows bio when provided', () => {
      render(<PublicProfilePage {...baseProps} selfSummary="" bio="Full biography text." />)
      expect(screen.getByText('Full biography text.')).toBeInTheDocument()
    })

    it('shows simplifiedBio instead of bio when easyRead is on', () => {
      vi.mocked(useAccessibilityStore).mockImplementationOnce(
        (selector: (s: { easyRead: boolean }) => unknown) => selector({ easyRead: true })
      )
      render(
        <PublicProfilePage
          {...baseProps}
          selfSummary="Short tagline."
          bio="Full biography text."
          simplifiedBio="Simple version."
        />
      )
      expect(screen.getByText('Simple version.')).toBeInTheDocument()
      expect(screen.queryByText('Full biography text.')).not.toBeInTheDocument()
      expect(screen.queryByText('Short tagline.')).not.toBeInTheDocument()
    })

    it('shows bio when easyRead is on but simplifiedBio is null', () => {
      vi.mocked(useAccessibilityStore).mockImplementationOnce(
        (selector: (s: { easyRead: boolean }) => unknown) => selector({ easyRead: true })
      )
      render(
        <PublicProfilePage
          {...baseProps}
          selfSummary=""
          bio="Full biography text."
          simplifiedBio={null}
        />
      )
      expect(screen.getByText('Full biography text.')).toBeInTheDocument()
    })

    it('shows "No description provided." when neither selfSummary nor bio is given', () => {
      render(<PublicProfilePage {...baseProps} selfSummary="" bio={null} />)
      expect(screen.getByText('No description provided.')).toBeInTheDocument()
    })
  })

  describe('Services grid', () => {
    it('is not rendered for consumer accounts', () => {
      render(<PublicProfilePage {...baseProps} isProvider={false} publicServiceListings={serviceListings} />)
      expect(screen.queryByRole('heading', { name: /^services$/i })).not.toBeInTheDocument()
    })

    it('is not rendered when the listings array is empty', () => {
      render(<PublicProfilePage {...baseProps} isProvider={true} publicServiceListings={[]} />)
      expect(screen.queryByRole('heading', { name: /^services$/i })).not.toBeInTheDocument()
    })

    it('renders a link for each service pointing to the correct url', () => {
      render(<PublicProfilePage {...baseProps} publicServiceListings={serviceListings} />)
      const link = screen.getByRole('link', { name: /PC Support/i })
      expect(link).toHaveAttribute('href', '/listings/listing-1')
    })

    it('renders each service price as an hourly starting rate', () => {
      render(<PublicProfilePage {...baseProps} publicServiceListings={serviceListings} />)
      expect(screen.getByText('From 20€/h')).toBeInTheDocument()
    })

    it('renders service images with AI alt text when status is COMPLETED', () => {
      const withMedia: ServiceCardProps[] = [
        {
          ...serviceListings[0],
          pictureLink: '/images/pc.jpg',
          pictureAltText: 'Person fixing a laptop on a desk',
          pictureAltTextStatus: 'COMPLETED',
        },
      ]
      render(<PublicProfilePage {...baseProps} publicServiceListings={withMedia} />)
      expect(screen.getByRole('img', { name: 'Person fixing a laptop on a desk' })).toBeInTheDocument()
    })

    it('renders service images with empty alt when alt text is not ready', () => {
      const withMedia: ServiceCardProps[] = [
        {
          ...serviceListings[0],
          pictureLink: '/images/pc.jpg',
          pictureAltText: null,
          pictureAltTextStatus: 'PENDING',
        },
      ]
      const { container } = render(<PublicProfilePage {...baseProps} publicServiceListings={withMedia} />)
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', '')
    })
  })
})
