import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { getPublicListings, getServiceTags, getPublicProfilesCollection } from '../api/mira'


vi.mock('../api/mira', () => ({
  getPublicListings: vi.fn(),
  getServiceTags: vi.fn(),
  getPublicProfilesCollection: vi.fn(),
  refresh: vi.fn().mockResolvedValue({ status: 401 }),
}))

const mockGetPublicListings = vi.mocked(getPublicListings)
const mockGetServiceTags = vi.mocked(getServiceTags)
const mockGetPublicProfilesCollection = vi.mocked(getPublicProfilesCollection)

function emptyListings() {
  return {
    data: { items: [], cursor: { limit: 20, next: null } },
    status: 200,
    headers: new Headers(),
  } as never
}

function emptyProfiles() {
  return {
    data: { items: [], cursor: { limit: 20, next: null } },
    status: 200,
    headers: new Headers(),
  } as never
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetPublicListings.mockResolvedValue(emptyListings())
  mockGetServiceTags.mockResolvedValue({ data: [], status: 200, headers: new Headers() } as never)
  mockGetPublicProfilesCollection.mockResolvedValue(emptyProfiles())
})

function renderApp(initialPath: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('search root page toggle focus across navigation', () => {
  it('activates the violet search palette on the users page', async () => {
    renderApp('/browse-users')
    await waitFor(() => expect(document.querySelector('[data-search-variant="users"]')).toBeInTheDocument())

    expect(document.querySelector('[data-search-variant="users"]')).toBeInTheDocument()
  })

  it('renders exactly one toggle on the services page', async () => {
    renderApp('/browse-services')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument())
    expect(screen.getAllByRole('switch')).toHaveLength(1)
  })

  it('keeps focus on the toggle after switching from Services to Users', async () => {
    renderApp('/browse-services')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument())

    const toggle = screen.getByRole('switch')
    toggle.focus()
    expect(document.activeElement).toBe(toggle)

    fireEvent.click(toggle)

    await waitFor(() => expect(document.querySelector('[data-search-variant="users"]')).toBeInTheDocument())
    expect(document.activeElement).toBe(toggle)
  })

  it('keeps focus on the toggle after switching from Users to Services', async () => {
    renderApp('/browse-users')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument())

    const toggle = screen.getByRole('switch')
    toggle.focus()

    fireEvent.click(toggle)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument())
    expect(document.activeElement).toBe(toggle)
  })
})
