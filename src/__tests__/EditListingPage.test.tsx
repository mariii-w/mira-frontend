import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { authFetch } from '../lib/queryClient'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => ({
      ...(config as object),
      useParams: () => ({ listingId: 'listing-1' }),
    }),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('../components/MultiSelect', () => ({
  MultiSelect: ({ onChange, value, id, 'aria-label': ariaLabel, 'aria-describedby': describedby, 'aria-required': required }: any) => (
    <button
      type="button"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={describedby}
      aria-required={required}
      data-testid="multiselect"
      onClick={() => onChange([...value, 'tag-1'])}
    >
      Select tags
    </button>
  ),
}))

import { EditListingPage } from '../routes/edit-listing.$listingId'

const mockFetch = vi.mocked(authFetch)

type PublicationStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DELETED'

function makeListing(overrides: { publicationStatus?: PublicationStatus; tags?: object[] } = {}) {
  return {
    listingId: 'listing-1',
    title: 'PC Help',
    description: 'I help with your computer.',
    price: 25,
    publicationStatus: 'ACTIVE' as PublicationStatus,
    tags: [{ tagId: 'tag-1', name: 'IT', isBarrierefrei: false, isActive: true }],
    location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
    ...overrides,
  }
}

function setupMocks(listing = makeListing(), media: unknown[] = [], actionOk = true) {
  mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
    const method = init?.method?.toUpperCase()
    if (!method || method === 'GET') {
      if (String(url).includes('/media')) {
        return { ok: true, json: async () => ({ items: media }) } as Response
      }
      return { ok: true, json: async () => listing } as Response
    }
    if (actionOk) {
      return { ok: true, json: async () => ({}) } as Response
    }
    return { ok: false, json: async () => ({ detail: 'Action failed.' }) } as Response
  })
}

async function waitForLoad() {
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ tagId: 'tag-1', name: 'IT', isBarrierefrei: false, isActive: true }],
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('<EditListingPage />', () => {
  it('shows loading state on mount', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<EditListingPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows error when listing fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false } as Response)
    render(<EditListingPage />)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load listing.')
    )
  })

  it('renders the Edit Listing heading after load', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Edit Listing' })).toBeInTheDocument()
    )
  })

  it('pre-populates form fields from the fetched listing', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.getByLabelText(/title/i)).toHaveValue('PC Help')
    expect(screen.getByLabelText(/description/i)).toHaveValue('I help with your computer.')
    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(25)
    expect(screen.getByLabelText(/city/i)).toHaveValue('Berlin')
    expect(screen.getByLabelText(/postal code/i)).toHaveValue('10115')
  })

  it('shows status badge', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument())
  })

  it('shows Save and Pause buttons for ACTIVE listing', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument()
  })

  it('shows Save and Publish buttons for DRAFT listing', async () => {
    setupMocks(makeListing({ publicationStatus: 'DRAFT' }))
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^publish$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument()
  })

  it('shows Resume button and no Save button for PAUSED listing', async () => {
    setupMocks(makeListing({ publicationStatus: 'PAUSED' }))
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.getByRole('button', { name: /^resume$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument()
  })

  it('disables form fields for PAUSED listing', async () => {
    setupMocks(makeListing({ publicationStatus: 'PAUSED' }))
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.getByLabelText(/title/i)).toBeDisabled()
    expect(screen.getByLabelText(/description/i)).toBeDisabled()
    expect(screen.getByLabelText(/hourly rate/i)).toBeDisabled()
  })

  it('back button navigates to /my-listings', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /back to my services/i }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
  })

  it('shows title validation error on empty submit', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(screen.getByText('Required.')).toBeInTheDocument())
  })

  it('shows tag error when no tags are selected on submit', async () => {
    setupMocks(makeListing({ tags: [] }))
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() =>
      expect(screen.getByText('Select at least one tag.')).toBeInTheDocument()
    )
  })

  it('does not call authFetch for PATCH when form is invalid', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    const patchCall = (mockFetch.mock.calls as [string, RequestInit?][]).find(
      ([, init]) => init?.method === 'PATCH'
    )
    expect(patchCall).toBeUndefined()
  })

  it('sends PATCH to /v1/listings/:id with updated data on save', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Title' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      const patchCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
        ([, init]) => init?.method === 'PATCH'
      )
      expect(patchCall).toBeDefined()
    })

    const [url, init] = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([, init]) => init?.method === 'PATCH'
    )!
    expect(url).toBe('/v1/listings/listing-1')
    const body = JSON.parse(init.body as string)
    expect(body.title).toBe('Updated Title')
    expect(body.tagIds).toEqual(['tag-1'])
  })

  it('navigates to /my-listings after successful save', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
    )
  })

  it('shows server error when save fails', async () => {
    setupMocks(makeListing(), [], false)
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Action failed.')
    )
  })

  it('calls publish endpoint and navigates on Publish click', async () => {
    setupMocks(makeListing({ publicationStatus: 'DRAFT' }))
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
    )
    const publishCall = (mockFetch.mock.calls as [string, RequestInit][]).find(([url]) =>
      String(url).includes('/publish')
    )
    expect(publishCall).toBeDefined()
    expect(publishCall![1].method).toBe('POST')
  })

  it('calls pause endpoint and navigates on Pause click', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
    )
    const pauseCall = (mockFetch.mock.calls as [string, RequestInit][]).find(([url]) =>
      String(url).includes('/pause')
    )
    expect(pauseCall).toBeDefined()
    expect(pauseCall![1].method).toBe('POST')
  })

  it('calls resume endpoint and navigates on Resume click', async () => {
    setupMocks(makeListing({ publicationStatus: 'PAUSED' }))
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /^resume$/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
    )
    const resumeCall = (mockFetch.mock.calls as [string, RequestInit][]).find(([url]) =>
      String(url).includes('/resume')
    )
    expect(resumeCall).toBeDefined()
    expect(resumeCall![1].method).toBe('POST')
  })

  it('shows delete confirmation dialog when Delete listing is clicked', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /delete listing/i }))
    expect(screen.getByText('Are you sure? This cannot be undone.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('hides delete confirmation when Cancel is clicked', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /delete listing/i }))
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.queryByText('Are you sure? This cannot be undone.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete listing/i })).toBeInTheDocument()
  })

  it('sends DELETE to /v1/listings/:id and navigates after confirming deletion', async () => {
    setupMocks()
    render(<EditListingPage />)
    await waitForLoad()
    fireEvent.click(screen.getByRole('button', { name: /delete listing/i }))
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' })
    )
    const deleteCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([, init]) => init?.method === 'DELETE'
    )
    expect(deleteCall).toBeDefined()
    expect(deleteCall![0]).toBe('/v1/listings/listing-1')
  })

  it('does not show delete button for DELETED listing', async () => {
    setupMocks(makeListing({ publicationStatus: 'DELETED' }))
    render(<EditListingPage />)
    await waitForLoad()
    expect(screen.queryByRole('button', { name: /delete listing/i })).not.toBeInTheDocument()
  })
})
