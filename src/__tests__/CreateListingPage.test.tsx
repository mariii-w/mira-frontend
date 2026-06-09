import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('../components/MultiSelect', () => ({
  MultiSelect: ({ onChange, id, 'aria-label': ariaLabel, 'aria-describedby': describedby, 'aria-required': required }: any) => (
    <button
      type="button"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={describedby}
      aria-required={required}
      data-testid="multiselect"
      onClick={() => onChange(['tag-1'])}
    >
      Select tags
    </button>
  ),
}))

import { CreateListingPage } from '../routes/create-listing'

const mockFetch = vi.mocked(authFetch)

function fillForm() {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title Here' } })
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A valid description with enough text.' } })
  fireEvent.change(screen.getByLabelText(/hourly rate/i), { target: { value: '25' } })
  fireEvent.change(screen.getByLabelText(/street/i), { target: { value: 'Main Street' } })
  fireEvent.change(screen.getByLabelText(/no\./i), { target: { value: '12a' } })
  fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } })
  fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Berlin' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('<CreateListingPage />', () => {
  it('renders all main form sections', () => {
    render(<CreateListingPage />)
    expect(screen.getByRole('heading', { name: 'New Service' })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hourly rate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
  })

  it('shows required field errors when submitting an empty form', () => {
    render(<CreateListingPage />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(7)
  })

  it('shows tag error when no tags are selected', () => {
    render(<CreateListingPage />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText('Select at least one tag.')).toBeInTheDocument()
  })

  it('does not call authFetch when the form is invalid', () => {
    render(<CreateListingPage />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('shows "Service is being saved…" while the request is pending', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<CreateListingPage />)
    fillForm()
    fireEvent.click(screen.getByTestId('multiselect'))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(screen.getByText('Service is being saved…')).toBeInTheDocument(),
    )
  })

  it('sends a multipart POST to /v1/listings with correct JSON payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ listingId: 'new-id' }),
    } as Response)
    render(<CreateListingPage />)
    fillForm()
    fireEvent.click(screen.getByTestId('multiselect'))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce())

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/v1/listings')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)

    const listingBlob = (init.body as FormData).get('listing') as Blob
    const json = JSON.parse(await listingBlob.text())
    expect(json.title).toBe('Valid Title Here')
    expect(json.price).toBe(25)
    expect(json.tagIds).toEqual(['tag-1'])
    expect(json.location.city).toBe('Berlin')
    expect(json.location.postalCode).toBe('12345')
  })

  it('navigates to /my-listings on successful submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ listingId: 'new-id' }),
    } as Response)
    render(<CreateListingPage />)
    fillForm()
    fireEvent.click(screen.getByTestId('multiselect'))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/my-listings' }),
    )
  })

  it('shows a server error message when the request fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Something went wrong.' }),
    } as Response)
    render(<CreateListingPage />)
    fillForm()
    fireEvent.click(screen.getByTestId('multiselect'))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.'),
    )
  })
})
