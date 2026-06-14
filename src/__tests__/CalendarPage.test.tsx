import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { authFetch } from '../lib/authFetch'
import { CalendarPage } from '../routes/calendar'

// ─── Router mock ─────────────────────────────────────────────────────────────
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, createFileRoute: () => (config: unknown) => config }
})

// ─── Auth store mock ──────────────────────────────────────────────────────────
const mockUser = { userId: 'user-1', userType: 'PROVIDER' as string }

vi.mock('../stores/auth', () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser }),
}))

// ─── authFetch mock ───────────────────────────────────────────────────────────
vi.mock('../lib/authFetch', () => ({ authFetch: vi.fn() }))
const mockFetch = vi.mocked(authFetch)

// ─── Component stubs ──────────────────────────────────────────────────────────
vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('../components/CalendarGrid', () => ({
  CalendarGrid: ({ renderDay }: { renderDay: (d: Date) => ReactNode }) => (
    <div data-testid="calendar-grid">{renderDay(new Date(2026, 5, 10))}</div>
  ),
}))

vi.mock('../components/WeeklyScheduleModal', () => ({
  WeeklyScheduleModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="weekly-schedule-modal" role="dialog" /> : null,
}))

vi.mock('../components/ExceptionModal', () => ({
  ExceptionModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="exception-modal" role="dialog" /> : null,
}))

vi.mock('../components/BookingCard', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>
}

function renderPage() {
  return render(<CalendarPage />, { wrapper: Wrapper })
}

function apiResponse<T>(data: T, status = 200) {
  return { data, status, headers: new Headers() }
}

function mockEmptyCalendar() {
  mockFetch.mockImplementation(async (url: RequestInfo | URL) => {
    const u = String(url)
    if (u.includes('/calendar')) return apiResponse({ items: [] })
    if (u.includes('/exceptions')) return apiResponse({ items: [] })
    if (u.includes('/schedule')) return apiResponse({ entries: [] })
    return apiResponse({})
  })
}

function makeBooking(overrides: Partial<{
  bookingId: string; bookedStart: string; bookedEnd: string;
  counterpartyName: string; title: string;
}> = {}) {
  const { bookingId = 'b-1', bookedStart = '2026-06-10T09:00:00Z', bookedEnd = '2026-06-10T10:00:00Z',
    counterpartyName = 'Anna', title = 'PC Repair' } = overrides
  return {
    bookingId,
    listingId: 'l-1',
    listing: { title },
    counterparty: { userId: 'u-2', name: counterpartyName, surname: 'Muster' },
    status: 'CONFIRMED',
    serviceAddress: null,
    totalPrice: 50,
    bookedStart,
    bookedEnd,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  mockUser.userType = 'PROVIDER'
  mockEmptyCalendar()
})

describe('<CalendarPage />', () => {
  it('renders the page heading', async () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'My Calendar' })).toBeInTheDocument()
  })

  it('renders the navbar', () => {
    renderPage()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders the calendar grid', () => {
    renderPage()
    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
  })

  describe('Provider view', () => {
    it('shows provider subtitle', () => {
      renderPage()
      expect(screen.getByText(/Manage your bookings, working hours/i)).toBeInTheDocument()
    })

    it('shows "Weekly schedule" button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /weekly schedule/i })).toBeInTheDocument()
    })

    it('shows "Add exception" button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /add exception/i })).toBeInTheDocument()
    })

    it('shows calendar legend', () => {
      renderPage()
      expect(screen.getByRole('list', { name: 'Calendar legend' })).toBeInTheDocument()
    })

    it('opens WeeklyScheduleModal when "Weekly schedule" is clicked', async () => {
      renderPage()
      expect(screen.queryByTestId('weekly-schedule-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /weekly schedule/i }))
      expect(screen.getByTestId('weekly-schedule-modal')).toBeInTheDocument()
    })

    it('opens ExceptionModal when "Add exception" is clicked', async () => {
      renderPage()
      expect(screen.queryByTestId('exception-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /add exception/i }))
      expect(screen.getByTestId('exception-modal')).toBeInTheDocument()
    })

    it('fetches schedule and exceptions for provider', async () => {
      renderPage()
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/users/user-1/schedule'))
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/users/user-1/exceptions'))
      })
    })
  })

  describe('Consumer view', () => {
    beforeEach(() => { mockUser.userType = 'CONSUMER' })

    it('shows consumer subtitle', () => {
      renderPage()
      expect(screen.getByText(/See your upcoming bookings/i)).toBeInTheDocument()
    })

    it('does not show "Weekly schedule" button', () => {
      renderPage()
      expect(screen.queryByRole('button', { name: /weekly schedule/i })).not.toBeInTheDocument()
    })

    it('does not show "Add exception" button', () => {
      renderPage()
      expect(screen.queryByRole('button', { name: /add exception/i })).not.toBeInTheDocument()
    })

    it('does not show calendar legend', () => {
      renderPage()
      expect(screen.queryByRole('list', { name: 'Calendar legend' })).not.toBeInTheDocument()
    })

    it('does not fetch schedule or exceptions for consumer', async () => {
      renderPage()
      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/calendar'))
      )
      expect(mockFetch).not.toHaveBeenCalledWith(expect.stringContaining('/schedule'))
      expect(mockFetch).not.toHaveBeenCalledWith(expect.stringContaining('/exceptions'))
    })
  })

  describe('Selected day panel', () => {
    it('shows "No bookings on this day." when selected date has no bookings', async () => {
      renderPage()
      await waitFor(() =>
        expect(screen.getByText('No bookings on this day.')).toBeInTheDocument()
      )
    })

    it('shows booking card when selected date has bookings', async () => {
      const booking = makeBooking({ bookedStart: '2026-06-10T09:00:00Z', bookedEnd: '2026-06-10T10:00:00Z' })
      mockFetch.mockImplementation(async (url: RequestInfo | URL) => {
        const u = String(url)
        if (u.includes('/calendar')) return apiResponse({ items: [booking] })
        if (u.includes('/exceptions')) return apiResponse({ items: [] })
        if (u.includes('/schedule')) return apiResponse({ entries: [] })
        return apiResponse({})
      })
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /Wednesday, June 10, 2026/i }))
      await waitFor(() =>
        expect(screen.getByText('PC Repair')).toBeInTheDocument()
      )
    })
  })

  describe('Upcoming appointments panel', () => {
    it('shows "No upcoming appointments." when there are none', async () => {
      renderPage()
      await waitFor(() =>
        expect(screen.getByText('No upcoming appointments.')).toBeInTheDocument()
      )
    })

    it('shows upcoming booking in the panel', async () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)
      const isoStart = future.toISOString()
      const isoEnd = new Date(future.getTime() + 3600000).toISOString()
      const booking = makeBooking({ bookingId: 'b-future', bookedStart: isoStart, bookedEnd: isoEnd, title: 'Laptop Fix' })

      mockFetch.mockImplementation(async (url: RequestInfo | URL) => {
        const u = String(url)
        if (u.includes('/calendar')) return apiResponse({ items: [booking] })
        if (u.includes('/exceptions')) return apiResponse({ items: [] })
        if (u.includes('/schedule')) return apiResponse({ entries: [] })
        return apiResponse({})
      })
      renderPage()
      await waitFor(() =>
        expect(screen.getAllByText('Laptop Fix').length).toBeGreaterThan(0)
      )
    })
  })

  describe('Calendar queries', () => {
    it('fetches calendar data for the current month', async () => {
      renderPage()
      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/v1\/users\/user-1\/calendar\?from=/)
        )
      )
    })

    it('shows "Today" button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    })
  })
})
