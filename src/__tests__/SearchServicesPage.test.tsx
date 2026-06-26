import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SearchServicesPage } from '../components/features/search/SearchServicesPage'
import { getPublicListings, getServiceTags } from '../api/mira'

// ─── Search params state ───────────────────────────────────────────────────────

type SearchParams = {
  q: string
  city: string
  radiusKm?: number
  tagIds: string[]
  maxPrice?: number
  from?: string
}

const DEFAULT_PARAMS: SearchParams = {
  q: '',
  city: '',
  radiusKm: undefined,
  tagIds: [],
  maxPrice: undefined,
  from: undefined,
}

let mockSearchParams: SearchParams = { ...DEFAULT_PARAMS }
const mockNavigate = vi.fn()

// ─── Router mock ───────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => ({
      ...(config as object),
      useSearch: () => mockSearchParams,
    }),
    getRouteApi: () => ({ useSearch: () => mockSearchParams }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={String(to)}>{children}</a>
    ),
  }
})

// ─── Generated-client mock ───────────────────────────────────────────────────

vi.mock('../api/mira', () => ({
  getPublicListings: vi.fn(),
  getServiceTags: vi.fn(),
}))

const mockGetPublicListings = vi.mocked(getPublicListings)
const mockGetServiceTags = vi.mocked(getServiceTags)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeListing(overrides: object = {}) {
  return {
    listingId: 'listing-1',
    title: 'Laptop Setup',
    description: 'I help with laptop setup.',
    easyDescription: null,
    easyDescriptionStatus: null,
    price: 25,
    author: { name: 'Patrick', surname: 'S.' },
    publishedAt: '2026-04-20T13:00:00Z',
    location: { city: 'Munich', postalCode: '80331', serviceRadiusKm: 15 },
    tags: [],
    primaryMedia: null,
    ...overrides,
  }
}

function mockApiSuccess({
  items = [makeListing()],
  next = null as string | null,
  tags = [] as object[],
} = {}) {
  mockGetPublicListings.mockResolvedValue({
    data: { items, cursor: { limit: 10, next } },
    status: 200,
    headers: new Headers(),
  } as never)
  mockGetServiceTags.mockResolvedValue({
    data: tags,
    status: 200,
    headers: new Headers(),
  } as never)
}

function listingsParams(): Record<string, unknown> {
  const call = mockGetPublicListings.mock.calls.at(-1)
  return (call?.[0] ?? {}) as Record<string, unknown>
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchServicesPage />
    </QueryClientProvider>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParams = { ...DEFAULT_PARAMS }
})

describe('<SearchServicesPage />', () => {

  describe('loading / error / empty states', () => {
    it('shows loading state while fetching', () => {
      mockGetPublicListings.mockReturnValue(new Promise(() => {}) as never)
      mockGetServiceTags.mockResolvedValue({ data: [], status: 200, headers: new Headers() } as never)
      renderPage()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading…')).toBeInTheDocument()
    })

    it('shows error message when listings fetch fails', async () => {
      mockGetServiceTags.mockResolvedValue({ data: [], status: 200, headers: new Headers() } as never)
      mockGetPublicListings.mockResolvedValue({ data: {}, status: 500, headers: new Headers() } as never)
      renderPage()
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Listings could not be loaded.')
      )
    })

    it('shows empty state when no results are returned', async () => {
      mockApiSuccess({ items: [] })
      renderPage()
      await waitFor(() =>
        expect(screen.getByText('No services found.')).toBeInTheDocument()
      )
      expect(screen.queryByRole('list', { name: 'Search results' })).not.toBeInTheDocument()
    })

    it('shows "Filter zurücksetzen" in empty state when filters are active', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess({ items: [] })
      renderPage()
      await waitFor(() =>
        expect(screen.getByText('No services found.')).toBeInTheDocument()
      )
      expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument()
    })
  })

  describe('rendering results', () => {
    it('renders a card for each listing returned', async () => {
      mockApiSuccess({
        items: [
          makeListing({ listingId: '1', title: 'Laptop Setup' }),
          makeListing({ listingId: '2', title: 'Wi-Fi Help' }),
        ],
      })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByText('Laptop Setup')).toBeInTheDocument()
      expect(screen.getByText('Wi-Fi Help')).toBeInTheDocument()
    })

    it('shows listing description', async () => {
      mockApiSuccess({
        items: [makeListing({ description: 'Expert laptop service near you.' })],
      })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByText('Expert laptop service near you.')).toBeInTheDocument()
    })

    it('shows provider name and city', async () => {
      mockApiSuccess({
        items: [
          makeListing({
            author: { name: 'Anna', surname: 'K.' },
            location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
          }),
        ],
      })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByText(/Anna/)).toBeInTheDocument()
      expect(screen.getByText(/Berlin/)).toBeInTheDocument()
    })

    it('results list has accessible label', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('list', { name: 'Search results' })).toBeInTheDocument()
    })
  })

  describe('results header', () => {
    it('shows query text in heading when q is set', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, q: 'PC Support' }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('heading', { name: 'Services for "PC Support"' })).toBeInTheDocument()
    })

    it('shows generic heading when no query', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument()
    })

    it('shows city and radius in subtitle when city is set', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, city: 'Munich', radiusKm: 10 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByText(/In Munich/)).toBeInTheDocument()
      expect(screen.getByText(/10 km/)).toBeInTheDocument()
    })
  })

  describe('API parameters', () => {
    it('calls getPublicListings with limit=10', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams().limit).toBe(10)
    })

    it('does not send radiusKm or city when city is empty', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams()).not.toHaveProperty('radiusKm')
      expect(listingsParams()).not.toHaveProperty('city')
    })

    it('sends city and radiusKm when city is set', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, city: 'Munich', radiusKm: 10 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams().city).toBe('Munich')
      expect(listingsParams().radiusKm).toBe(10)
    })

    it('sends maxPrice when below 100', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams().maxPrice).toBe(40)
    })

    it('omits maxPrice when undefined', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams()).not.toHaveProperty('maxPrice')
    })

    it('sends tagIds', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, tagIds: ['uuid-a', 'uuid-b'] }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalled())
      expect(listingsParams().tagIds).toEqual(['uuid-a', 'uuid-b'])
    })

    it('loads service tags on mount', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockGetServiceTags).toHaveBeenCalled())
    })
  })

  describe('pagination', () => {
    it('does not show pagination when there is only one page', async () => {
      mockApiSuccess({ next: null })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    })

    it('shows Next enabled and Previous disabled when cursor.next is set', async () => {
      mockApiSuccess({ next: 'cursor-abc' })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    })

    it('navigates with the opaque cursor when Next is clicked', async () => {
      mockApiSuccess({ next: 'cursor-abc' })
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(mockNavigate).toHaveBeenCalledWith({
        search: { ...DEFAULT_PARAMS, from: 'cursor-abc' },
      })
    })
  })

  describe('active filter chips', () => {
    it('shows no filter chips with default params', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument()
    })

    it('shows price chip when maxPrice is set', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('group', { name: 'Active filters' })).toBeInTheDocument()
      expect(screen.getByText('40€/h')).toBeInTheDocument()
    })

    it('shows "Clear all" button when any filter is active', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
    })

    it('navigates with maxPrice=undefined when price chip × is clicked', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: 'Remove price filter' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ maxPrice: undefined }),
        })
      )
    })

    it('navigates with empty tagIds and maxPrice=undefined when "Clear all" is clicked', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ tagIds: [], maxPrice: undefined }),
        })
      )
    })
  })

  describe('responsive layout', () => {
    it('renders a "Filters" trigger button for the mobile drawer', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
    })
  })
})
