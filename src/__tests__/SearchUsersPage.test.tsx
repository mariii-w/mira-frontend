import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchUsersPage } from '../components/search/pages/SearchUsersPage'
import { getPublicProfilesCollection } from '../api/mira'

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

vi.mock('../api/mira', () => ({ getPublicProfilesCollection: vi.fn() }))
const mockGetProfiles = vi.mocked(getPublicProfilesCollection)

function profile(userId: string, firstName: string, userType: 'PROVIDER' | 'CUSTOMER') {
  return {
    userId,
    username: firstName.toLowerCase(),
    firstName,
    lastName: 'User',
    userType,
    bio: `${firstName} bio`,
    simplifiedBio: null,
    selfSummary: null,
    accessibilityPreferences: [],
    profileMedia: null,
  }
}

function mockSuccess(next: string | null = null) {
  mockGetProfiles.mockResolvedValue({
    data: {
      items: [profile('p1', 'Patrick', 'PROVIDER'), profile('c1', 'Anna', 'CUSTOMER')],
      cursor: { limit: 20, next },
    },
    status: 200,
    headers: new Headers(),
  } as never)
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <SearchUsersPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSearch = { ...defaultSearch }
})

describe('<SearchUsersPage /> role filtering', () => {
  it('shows counts for the current backend page', async () => {
    mockSuccess()
    renderPage()

    expect(await screen.findByRole('heading', { name: '2 users' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Providers 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Consumers 1' })).toBeInTheDocument()
  })

  it('filters cards and updates the heading for the selected role', async () => {
    mockSearch = { ...defaultSearch, role: 'providers' }
    mockSuccess()
    renderPage()

    expect(await screen.findByRole('heading', { name: '1 provider' })).toBeInTheDocument()
    expect(screen.getByText('Patrick User')).toBeInTheDocument()
    expect(screen.queryByText('Anna User')).not.toBeInTheDocument()
  })

  it('changes role through URL navigation without another request', async () => {
    mockSuccess()
    renderPage()
    await screen.findByRole('heading', { name: '2 users' })

    fireEvent.click(screen.getByRole('button', { name: 'Providers 1' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      search: { ...defaultSearch, role: 'providers', from: undefined },
    })
    expect(mockGetProfiles).toHaveBeenCalledTimes(1)
  })

  it('preserves role when submitting a search and moving to the next page', async () => {
    mockSearch = { q: '', from: undefined, role: 'consumers' }
    mockSuccess('cursor-next')
    renderPage()
    await screen.findByRole('heading', { name: '1 consumer' })

    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Anna' } })
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
  })
})
