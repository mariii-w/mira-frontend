import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getAuthorListings } from '../api/mira'

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

vi.mock('../api/mira', () => ({
  getGetAuthorListingsQueryKey: (userId: string, params?: object) => [
    `/v1/users/${userId}/listings`,
    params,
  ],
  getAuthorListings: vi.fn(),
}))

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

const mockGetListings = vi.mocked(getAuthorListings)

function renderRoute() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MyListingsRoute />
    </QueryClientProvider>,
  )
}

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

function makeListingsResponse(items: object[], next: string | null = null) {
  return {
    status: 200,
    data: { items, cursor: { limit: 20, next } },
    headers: new Headers(),
  } as Awaited<ReturnType<typeof getAuthorListings>>
}

function mockSuccess(items: object[]) {
  mockGetListings.mockResolvedValue(makeListingsResponse(items))
}

import { MyListingsRoute } from '../routes/my-listings'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('<MyListingsPage />', () => {
  it('shows loading state on mount', () => {
    mockGetListings.mockReturnValue(new Promise(() => {})) // never resolves
    renderRoute()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders a card for each listing after fetch', async () => {
    mockSuccess(makeListings([{ title: 'PC Help' }, { title: 'Smartphone Setup' }]))
    renderRoute()
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /PC Help/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Smartphone Setup/ })).toBeInTheDocument()
  })

  it('list has role="list" and accessible label', async () => {
    mockSuccess(makeListings([{}]))
    renderRoute()
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
    const list = screen.getByRole('list', { name: 'Your services' })
    expect(list).toBeInTheDocument()
  })


  it('shows empty state when no listings are returned', async () => {
    mockSuccess([])
    renderRoute()
    await waitFor(() =>
      expect(screen.getByText("You haven't created any services yet.")).toBeInTheDocument()
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    mockGetListings.mockResolvedValue({
      status: 400,
      data: {
        type: 'about:blank',
        title: 'Error',
        status: 400,
        detail: 'Failed to load listings.',
        instance: '/v1/users/user-1/listings',
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getAuthorListings>>)
    renderRoute()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load listings.')
    )
  })

  it('fetches listings for the authenticated user with limit', async () => {
    mockSuccess([])
    renderRoute()
    await waitFor(() =>
      expect(mockGetListings).toHaveBeenCalledWith(
        'user-1',
        { limit: 20 },
      )
    )
  })

  it('does not show pagination controls when there is only one page', async () => {
    mockSuccess(makeListings([{}]))
    renderRoute()
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
  })

  it('shows Next button when there is a next cursor', async () => {
    mockGetListings.mockResolvedValue(makeListingsResponse(makeListings([{}]), 'cursor-abc'))
    renderRoute()
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('fetches next page and enables Previous when Next is clicked', async () => {
    mockGetListings.mockImplementation(async (_userId, params) => {
      const page = params?.from ? 2 : 1
      return makeListingsResponse(
        makeListings([{ title: `Page ${page}` }]),
        page === 1 ? 'cursor-p2' : null,
      )
    })

    renderRoute()
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 2/ })).toBeInTheDocument())

    expect(mockGetListings).toHaveBeenCalledWith(
      'user-1',
      { limit: 20, from: 'cursor-p2' },
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('returns to first page when Previous is clicked', async () => {
    mockGetListings.mockImplementation(async (_userId, params) => {
      const page = params?.from ? 2 : 1
      return makeListingsResponse(
        makeListings([{ title: `Page ${page}` }]),
        page === 1 ? 'cursor-p2' : null,
      )
    })

    renderRoute()
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 2/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

    expect(mockGetListings).toHaveBeenLastCalledWith(
      'user-1',
      { limit: 20 },
    )
  })

  it('Create service button is always visible', async () => {
    mockSuccess(makeListings([{}]))
    renderRoute()
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Create service/ })).toBeInTheDocument()
  })

  describe('status filter', () => {
    it('renders all five filter buttons', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
      const group = screen.getByRole('group', { name: /filter services by status/i })
      expect(group).toBeInTheDocument()
      for (const label of ['All', 'Active', 'Draft', 'Paused', 'Deleted']) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
      }
    })

    it('"All" is selected by default', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
      expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
      for (const label of ['Active', 'Draft', 'Paused', 'Deleted']) {
        expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
      }
    })

    it('fetches without publicationStatus param when "All" is active', async () => {
    mockSuccess([])
    renderRoute()
    await waitFor(() =>
        expect(mockGetListings).toHaveBeenCalledWith(
          'user-1',
          { limit: 20 },
        )
      )
    })

    it('appends publicationStatus param when a specific filter is selected', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())

      mockSuccess([])
      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))

      await waitFor(() =>
        expect(mockGetListings).toHaveBeenCalledWith(
          'user-1',
          { limit: 20, publicationStatus: 'DRAFT' },
        )
      )
    })

    it('marks the selected filter as pressed and deselects the previous one', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())

      fireEvent.click(screen.getByRole('button', { name: 'Active' }))

      expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('resets pagination to page 1 when filter changes', async () => {
      mockGetListings.mockImplementation(async (_userId, params) => {
        const page = params?.from ? 2 : 1
        return makeListingsResponse(
          makeListings([{ title: `Page ${page}` }]),
          page === 1 ? 'cursor-p2' : null,
        )
      })

      renderRoute()
      await waitFor(() => expect(screen.getByRole('heading', { name: /Page 1/ })).toBeInTheDocument())

      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      await waitFor(() => expect(screen.getByRole('heading', { name: /Page 2/ })).toBeInTheDocument())

      mockSuccess([])
      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))

      await waitFor(() =>
        expect(mockGetListings).toHaveBeenCalledWith(
          'user-1',
          { limit: 20, publicationStatus: 'DRAFT' },
        )
      )
    })

    it('shows filter-specific empty state when a filter returns no results', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())

      mockGetListings.mockClear()
      mockSuccess([])
      fireEvent.click(screen.getByRole('button', { name: 'Paused' }))

      await waitFor(() =>
        expect(screen.getByText('No paused services.')).toBeInTheDocument()
      )
      expect(screen.queryByText("You haven't created any services yet.")).not.toBeInTheDocument()
    })

    it('shows generic empty state when "All" returns no results', async () => {
      mockSuccess([])
      renderRoute()
      await waitFor(() =>
        expect(screen.getByText("You haven't created any services yet.")).toBeInTheDocument()
      )
      // header + empty-state body both render Create service
      expect(screen.getAllByRole('button', { name: /Create service/ })).toHaveLength(2)
      expect(screen.queryByText(/No .* services\./)).not.toBeInTheDocument()
    })
  })
})
