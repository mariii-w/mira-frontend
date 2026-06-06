import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { authFetch } from '../lib/queryClient'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => config,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../stores/auth', () => ({
  useAuthStore: (selector: (s: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: 'user-1' } }),
}))

vi.mock('../lib/queryClient', () => ({
  authFetch: vi.fn(),
}))

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

const mockFetch = vi.mocked(authFetch)

function makeListings(overrides: object[] = [{}]) {
  return overrides.map((o, i) => ({
    listingId: `listing-${i}`,
    title: `Service ${i}`,
    description: `Description for service ${i}`,
    price: 20,
    publicationStatus: 'ACTIVE',
    moderationStatus: 'VISIBLE',
    author: { name: 'Klaus', surname: 'M' },
    publishedAt: null,
    location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
    tags: [],
    ...o,
  }))
}

function mockSuccess(items: object[]) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ items, cursor: { limit: 20, next: null } }),
  } as Response)
}

import { MyListingsPage } from '../routes/my-listings'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('<MyListingsPage />', () => {
  it('shows loading state on mount', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<MyListingsPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders a card for each listing after fetch', async () => {
    mockSuccess(makeListings([{ title: 'PC Help' }, { title: 'Smartphone Setup' }]))
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /PC Help/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Smartphone Setup/ })).toBeInTheDocument()
  })

  it('list has role="list" and accessible label', async () => {
    mockSuccess(makeListings([{}]))
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    const list = screen.getByRole('list', { name: 'Your services' })
    expect(list).toBeInTheDocument()
  })

  it('shows active count in stats after load', async () => {
    mockSuccess(makeListings([
      { publicationStatus: 'ACTIVE' },
      { publicationStatus: 'ACTIVE' },
      { publicationStatus: 'DRAFT' },
    ]))
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.getByText(/2 active/)).toBeInTheDocument())
  })

  it('shows empty state when no listings are returned', async () => {
    mockSuccess([])
    render(<MyListingsPage />)
    await waitFor(() =>
      expect(screen.getByText("You haven't created any services yet.")).toBeInTheDocument()
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false } as Response)
    render(<MyListingsPage />)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load listings.')
    )
  })

  it('fetches listings for the authenticated user with limit', async () => {
    mockSuccess([])
    render(<MyListingsPage />)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce())
    expect(mockFetch).toHaveBeenCalledWith('/v1/users/user-1/listings?limit=20')
  })

  it('does not show pagination controls when there is only one page', async () => {
    mockSuccess(makeListings([{}]))
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
  })

  it('shows Next button when there is a next cursor', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: makeListings([{}]), cursor: { limit: 20, next: 'cursor-abc' } }),
    } as Response)
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('fetches next page and enables Previous when Next is clicked', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      const page = String(url).includes('from=') ? 2 : 1
      return {
        ok: true,
        json: async () => ({
          items: makeListings([{ title: `Page ${page}` }]),
          cursor: { limit: 20, next: page === 1 ? 'cursor-p2' : null },
        }),
      } as Response
    })

    render(<MyListingsPage />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 2/ })).toBeInTheDocument())

    expect(mockFetch).toHaveBeenLastCalledWith('/v1/users/user-1/listings?limit=20&from=cursor-p2')
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('returns to first page when Previous is clicked', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      const page = String(url).includes('from=') ? 2 : 1
      return {
        ok: true,
        json: async () => ({
          items: makeListings([{ title: `Page ${page}` }]),
          cursor: { limit: 20, next: page === 1 ? 'cursor-p2' : null },
        }),
      } as Response
    })

    render(<MyListingsPage />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 2/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    expect(mockFetch).toHaveBeenLastCalledWith('/v1/users/user-1/listings?limit=20')
  })

  it('Create service button is always visible', async () => {
    mockSuccess(makeListings([{}]))
    render(<MyListingsPage />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Create service/ })).toBeInTheDocument()
  })
})
