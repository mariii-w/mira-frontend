import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SearchPage } from '../routes/search'

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
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={String(to)}>{children}</a>
    ),
  }
})

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

// ─── Fetch mock ────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

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
  mockFetch.mockImplementation(async (url: string) => {
    if (String(url).startsWith('/v1/service-tags')) {
      return { ok: true, json: async () => tags }
    }
    return {
      ok: true,
      json: async () => ({ items, cursor: { limit: 20, next } }),
    }
  })
}

function calledListingsUrl(): URL {
  const call = mockFetch.mock.calls.find((c: unknown[]) =>
    String(c[0]).includes('/v1/public-listings')
  )
  return new URL(String(call![0]), 'http://localhost')
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchPage />
    </QueryClientProvider>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParams = { ...DEFAULT_PARAMS }
})

describe('<SearchPage />', () => {

  describe('loading / error / empty states', () => {
    it('shows loading state while fetching', () => {
      mockFetch.mockReturnValue(new Promise(() => {}))
      renderPage()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading…')).toBeInTheDocument()
    })

    it('shows error message when listings fetch fails', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (String(url).startsWith('/v1/service-tags')) return { ok: true, json: async () => [] }
        return { ok: false }
      })
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
    it('calls /v1/public-listings with limit=20', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/public-listings')))
      expect(calledListingsUrl().searchParams.get('limit')).toBe('20')
    })

    it('does not send radiusKm when city is empty', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/public-listings')))
      expect(calledListingsUrl().searchParams.has('radiusKm')).toBe(false)
      expect(calledListingsUrl().searchParams.has('city')).toBe(false)
    })

    it('sends city and radiusKm when city is set', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, city: 'Munich', radiusKm: 10 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('city=Munich')))
      const url = calledListingsUrl()
      expect(url.searchParams.get('city')).toBe('Munich')
      expect(url.searchParams.get('radiusKm')).toBe('10')
    })

    it('sends maxPrice when below 100', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, maxPrice: 40 }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('maxPrice=40')))
      expect(calledListingsUrl().searchParams.get('maxPrice')).toBe('40')
    })

    it('omits maxPrice when undefined', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/public-listings')))
      expect(calledListingsUrl().searchParams.has('maxPrice')).toBe(false)
    })

    it('sends tagIds as repeated params', async () => {
      mockSearchParams = { ...DEFAULT_PARAMS, tagIds: ['uuid-a', 'uuid-b'] }
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('tagIds=uuid-a')))
      const url = calledListingsUrl()
      expect(url.searchParams.getAll('tagIds')).toEqual(['uuid-a', 'uuid-b'])
    })

    it('fetches /v1/service-tags on mount', async () => {
      mockApiSuccess()
      renderPage()
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/v1/service-tags'))
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
