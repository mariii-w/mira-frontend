import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchUsersPage } from '../components/search/pages/SearchUsersPage'
import { getPublicProfilesCollection, getPublicListings } from '../api/mira'
import type { PublicListingSummary } from '../api/model'

type SearchParams = { q: string; from?: string; role: 'everyone' | 'providers' | 'consumers' }
const defaultSearch: SearchParams = { q: '', from: undefined, role: 'everyone' }
let mockSearch: SearchParams = { ...defaultSearch }
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    getRouteApi: () => ({ useSearch: () => mockSearch }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  }
})

vi.mock('../api/mira', () => ({ getPublicProfilesCollection: vi.fn(), getPublicListings: vi.fn() }))
const mockGetProfiles = vi.mocked(getPublicProfilesCollection)
const mockGetPublicListings = vi.mocked(getPublicListings)

function profile(userId: string, firstName: string, userType: 'PROVIDER' | 'CUSTOMER') {
  return {
    userId,
    username: firstName.toLowerCase(),
    firstName,
    lastName: 'User',
    userType,
    city: 'Berlin',
    bio: `${firstName} bio`,
    simplifiedBio: null,
    selfSummary: null,
    accessibilityPreferences: [],
    profileMedia: null,
  }
}

function listing(overrides: Partial<PublicListingSummary> = {}): PublicListingSummary {
  return {
    listingId: 'listing-1',
    tags: [],
    title: 'Listing',
    description: 'Listing description.',
    price: 20,
    author: { userId: 'author-1', name: 'Patrick', surname: 'User' },
    publishedAt: null,
    location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
    ...overrides,
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(fulfill => { resolve = fulfill })
  return { promise, resolve }
}

function mockProfiles(items: ReturnType<typeof profile>[], next: string | null = null) {
  mockGetProfiles.mockResolvedValue({
    data: { items, cursor: { limit: 20, next } },
    status: 200,
    headers: new Headers(),
  } as never)
}

function mockSuccess(next: string | null = null) {
  mockProfiles([profile('p1', 'Patrick', 'PROVIDER'), profile('c1', 'Anna', 'CUSTOMER')], next)
}

function renderPage(configureClient?: (client: QueryClient) => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  configureClient?.(client)
  const page = () => (
    <QueryClientProvider client={client}>
      <SearchUsersPage />
    </QueryClientProvider>
  )
  const result = render(page())
  return { ...result, rerenderPage: () => result.rerender(page()) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSearch = { ...defaultSearch }
  mockGetPublicListings.mockResolvedValue({
    data: { items: [], cursor: { limit: 500, next: null } },
    status: 200,
    headers: new Headers(),
  } as never)
})

afterEach(() => onlineManager.setOnline(true))

describe('<SearchUsersPage /> role filtering', () => {
  it('shows counts for the current backend page', async () => {
    mockSuccess()
    renderPage()

    expect(await screen.findByRole('heading', { name: '2 users' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Providers 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Consumers 1' })).toBeInTheDocument()
  })

  it('preserves the profile error alert when the profiles request fails', async () => {
    mockGetProfiles.mockResolvedValue({
      data: { type: 'about:blank', title: 'Server Error' },
      status: 500,
      headers: new Headers(),
    } as never)
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Users could not be loaded.')
    expect(mockGetPublicListings).not.toHaveBeenCalled()
  })

  it('filters cards and updates the heading for the selected role', async () => {
    mockSearch = { ...defaultSearch, role: 'providers' }
    mockSuccess()
    renderPage()

    expect(await screen.findByRole('heading', { name: '1 provider' })).toBeInTheDocument()
    expect(await screen.findByText('Patrick User')).toBeInTheDocument()
    expect(screen.queryByText('Anna User')).not.toBeInTheDocument()
  })

  it('switches roles instantly without refetching profiles or provider listings', async () => {
    mockSuccess()
    const { rerenderPage } = renderPage()
    await screen.findByText('Anna User')

    fireEvent.click(screen.getByRole('button', { name: 'Providers 1' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      search: { ...defaultSearch, role: 'providers', from: undefined },
    })
    expect(mockGetProfiles).toHaveBeenCalledTimes(1)
    expect(mockGetPublicListings).toHaveBeenCalledTimes(1)

    mockSearch = { ...defaultSearch, role: 'providers' }
    rerenderPage()

    expect(screen.getByText('Patrick User')).toBeInTheDocument()
    expect(screen.queryByText('Anna User')).not.toBeInTheDocument()
    expect(mockGetProfiles).toHaveBeenCalledTimes(1)
    expect(mockGetPublicListings).toHaveBeenCalledTimes(1)
  })

  it('preserves role when submitting a search and moving to the next page', async () => {
    mockSearch = { q: '', from: undefined, role: 'consumers' }
    mockSuccess('cursor-next')
    renderPage()
    await screen.findByRole('heading', { name: '1 consumer' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'Anna' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(mockNavigate).toHaveBeenCalledWith({ search: { q: 'Anna', role: 'consumers', from: undefined } })

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      search: { ...mockSearch, from: 'cursor-next' },
    })
  })

  it('keeps pagination available when the selected role has no matches', async () => {
    mockSearch = { ...defaultSearch, role: 'providers' }
    mockGetProfiles.mockResolvedValue({
      data: { items: [profile('c1', 'Anna', 'CUSTOMER')], cursor: { limit: 20, next: 'cursor-next' } },
      status: 200,
      headers: new Headers(),
    } as never)
    renderPage()

    expect(await screen.findByText('No providers on this page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    expect(mockGetPublicListings).not.toHaveBeenCalled()
  })
})

describe('<SearchUsersPage /> provider enrichment', () => {
  it('keeps results hidden while initial provider enrichment is paused offline', async () => {
    onlineManager.setOnline(false)
    const { unmount } = renderPage(client => {
      client.setQueryData(
        ['public-profiles', { q: '', from: undefined }],
        {
          items: [profile('p1', 'Patrick', 'PROVIDER'), profile('c1', 'Anna', 'CUSTOMER')],
          cursor: { limit: 20, next: 'cursor-next' },
        },
      )
    })

    await screen.findByRole('heading', { name: '2 users' })
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'User results' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    unmount()
  })

  it('fetches every provider with a limit of 500 regardless of the selected role tab', async () => {
    mockSearch = { ...defaultSearch, role: 'consumers' }
    mockSuccess()
    renderPage()

    await screen.findByRole('heading', { name: '1 consumer' })
    expect(mockGetPublicListings).toHaveBeenCalledWith({ userId: 'p1', limit: 500 })
  })

  it('keeps showing the loading status until provider enrichment settles', async () => {
    mockSuccess('cursor-next')
    mockGetPublicListings.mockImplementation(() => new Promise(() => {}))
    renderPage()

    await screen.findByRole('heading', { name: '2 users' })
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'User results' })).not.toBeInTheDocument()
    expect(screen.queryByText('Patrick User')).not.toBeInTheDocument()
    expect(screen.queryByText('Anna User')).not.toBeInTheDocument()
    expect(screen.queryByText('No users found.')).not.toBeInTheDocument()
    expect(screen.queryByText(/No (providers|consumers) on this page\./)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('starts all provider queries in parallel and waits for both to settle', async () => {
    mockProfiles([
      profile('p1', 'Patrick', 'PROVIDER'),
      profile('p2', 'Petra', 'PROVIDER'),
    ], 'cursor-next')
    const first = deferred<Awaited<ReturnType<typeof getPublicListings>>>()
    const second = deferred<Awaited<ReturnType<typeof getPublicListings>>>()
    mockGetPublicListings.mockImplementation(params => params?.userId === 'p1' ? first.promise : second.promise)
    renderPage()

    await waitFor(() => expect(mockGetPublicListings).toHaveBeenCalledTimes(2))
    expect(mockGetPublicListings).toHaveBeenCalledWith({ userId: 'p1', limit: 500 })
    expect(mockGetPublicListings).toHaveBeenCalledWith({ userId: 'p2', limit: 500 })
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'User results' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await act(async () => first.resolve({
      data: { items: [listing({ price: 18 })], cursor: { limit: 500, next: null } },
      status: 200,
      headers: new Headers(),
    } as never))
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'User results' })).not.toBeInTheDocument()

    await act(async () => second.resolve({
      data: { items: [], cursor: { limit: 500, next: null } },
      status: 200,
      headers: new Headers(),
    } as never))
    expect(await screen.findByText('Patrick User')).toBeInTheDocument()
    expect(screen.getByText('Petra User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('keeps a successful provider summary when another provider enrichment fails', async () => {
    mockProfiles([
      profile('p1', 'Patrick', 'PROVIDER'),
      profile('p2', 'Petra', 'PROVIDER'),
    ])
    mockGetPublicListings.mockImplementation(params => Promise.resolve(params?.userId === 'p1'
      ? {
          data: { items: [listing({ price: 18 })], cursor: { limit: 500, next: null } },
          status: 200,
          headers: new Headers(),
        } as never
      : {
          data: { type: 'about:blank', title: 'Bad Request' },
          status: 400,
          headers: new Headers(),
        } as never))
    renderPage()

    const patrickCard = (await screen.findByRole('heading', { name: 'Patrick User' })).closest<HTMLElement>('[role="group"]')
    const petraCard = screen.getByRole('heading', { name: 'Petra User' }).closest<HTMLElement>('[role="group"]')
    expect(patrickCard).not.toBeNull()
    expect(petraCard).not.toBeNull()
    expect(within(patrickCard!).getByText('18€/hr')).toBeInTheDocument()
    expect(within(patrickCard!).getByText('Offers 1 service')).toBeInTheDocument()
    expect(within(petraCard!).queryByText(/€\/hr/)).not.toBeInTheDocument()
    expect(within(petraCard!).queryByText(/Offers \d+ services?/)).not.toBeInTheDocument()
  })

  it('follows cursor pages beyond the first batch of 500', async () => {
    mockSuccess()
    mockGetPublicListings
      .mockResolvedValueOnce({
        data: { items: [listing({ listingId: 'l1' })], cursor: { limit: 500, next: 'cursor-2' } },
        status: 200,
        headers: new Headers(),
      } as never)
      .mockResolvedValueOnce({
        data: { items: [listing({ listingId: 'l2' })], cursor: { limit: 500, next: null } },
        status: 200,
        headers: new Headers(),
      } as never)
    renderPage()

    await screen.findByText('Offers 2 services')
    expect(mockGetPublicListings).toHaveBeenNthCalledWith(2, { userId: 'p1', limit: 500, from: 'cursor-2' })
  })

  it('terminates the pagination loop when the backend returns repeated cursor values', async () => {
    mockSuccess()
    mockGetPublicListings
      .mockResolvedValueOnce({
        data: { items: [listing({ listingId: 'l1' })], cursor: { limit: 500, next: 'cursor-repeat' } },
        status: 200,
        headers: new Headers(),
      } as never)
      .mockResolvedValueOnce({
        data: { items: [listing({ listingId: 'l2' })], cursor: { limit: 500, next: 'cursor-repeat' } },
        status: 200,
        headers: new Headers(),
      } as never)
    renderPage()

    await screen.findByText('Patrick User')
    expect(mockGetPublicListings).toHaveBeenCalledTimes(2)
  })

  it('renders provider price and services once enrichment resolves', async () => {
    mockSuccess()
    mockGetPublicListings.mockResolvedValue({
      data: { items: [listing({ price: 18 }), listing({ listingId: 'l2', price: 25 })], cursor: { limit: 500, next: null } },
      status: 200,
      headers: new Headers(),
    } as never)
    renderPage()

    expect(await screen.findByText('18€/hr')).toBeInTheDocument()
    expect(screen.getByText('Offers 2 services')).toBeInTheDocument()
  })

  it('still renders a provider whose enrichment fails, without price or services', async () => {
    mockSuccess()
    mockGetPublicListings.mockResolvedValue({
      data: { type: 'about:blank', title: 'Bad Request' },
      status: 400,
      headers: new Headers(),
    } as never)
    renderPage()

    expect(await screen.findByText('Patrick User')).toBeInTheDocument()
    expect(screen.queryByText(/€\/hr/)).not.toBeInTheDocument()
  })
})
