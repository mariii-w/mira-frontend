import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CalendarPage } from '../routes/calendar'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, createFileRoute: () => (config: unknown) => config }
})

const mockUser = { userId: 'user-1', userType: 'PROVIDER' as string }

vi.mock('../stores/auth', () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser }),
}))

const apiMocks = vi.hoisted(() => ({
  useGetV1UsersUserIdCalendar: vi.fn(),
  useGetV1UsersUserIdSchedule: vi.fn(),
  useListScheduleExceptions: vi.fn(),
  usePutV1UsersUserIdSchedule: vi.fn(),
  useCreateScheduleException: vi.fn(),
  useUpdateScheduleException: vi.fn(),
  useDeleteScheduleException: vi.fn(),
  getGetV1UsersUserIdScheduleQueryKey: vi.fn((userId: string) => [`/v1/users/${userId}/schedule`]),
  getListScheduleExceptionsQueryKey: vi.fn((userId: string) => [`/v1/users/${userId}/exceptions`]),
}))

vi.mock('../api/mira', () => apiMocks)

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('../components/CalendarGrid', () => ({
  CalendarGrid: ({ renderDay }: { renderDay: (d: Date) => ReactNode }) => (
    <div data-testid="calendar-grid">{renderDay(new Date(2026, 5, 10))}</div>
  ),
}))

vi.mock('../components/WeeklyScheduleModal', () => ({
  WeeklyScheduleModal: ({ open, entries, onSave }: { open: boolean; entries: unknown[]; onSave: (value: unknown) => void }) =>
    open ? (
      <div data-testid="weekly-schedule-modal" role="dialog">
        <span data-testid="schedule-entry-count">{entries.length}</span>
        <button onClick={() => onSave({ entries: [] })}>modal save schedule</button>
      </div>
    ) : null,
}))

vi.mock('../components/ExceptionModal', () => ({
  ExceptionModal: ({
    open,
    exceptions,
    onCreate,
    onUpdate,
    onDelete,
  }: {
    open: boolean
    exceptions: unknown[]
    onCreate: (value: unknown) => void
    onUpdate: (id: string, value: unknown) => void
    onDelete: (id: string) => void
  }) =>
    open ? (
      <div data-testid="exception-modal" role="dialog">
        <span data-testid="exception-count">{exceptions.length}</span>
        <button onClick={() => onCreate({ date: '2026-07-01', exceptionType: 'BLOCKED' })}>modal create exception</button>
        <button onClick={() => onUpdate('e-1', { startTime: '10:00', endTime: '11:00' })}>modal update exception</button>
        <button onClick={() => onDelete('e-1')}>modal delete exception</button>
      </div>
    ) : null,
}))

vi.mock('../components/BookingCard', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}))

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>
}

function renderPage() {
  return render(<CalendarPage />, { wrapper: Wrapper })
}

function success<T>(data: T) {
  return { data, status: 200, headers: new Headers() }
}

function makeBooking(overrides: Partial<{
  bookingId: string
  bookedStart: string
  bookedEnd: string
  counterpartyName: string
  title: string
}> = {}) {
  const {
    bookingId = 'b-1',
    bookedStart = '2026-06-10T09:00:00Z',
    bookedEnd = '2026-06-10T10:00:00Z',
    counterpartyName = 'Anna',
    title = 'PC Repair',
  } = overrides
  return {
    bookingId,
    listingId: 'l-1',
    listing: { title },
    counterparty: { userId: 'u-2', name: counterpartyName, surname: 'Muster' },
    status: 'CONFIRMED',
    locationType: 'REMOTE',
    serviceAddress: null,
    totalPrice: 50,
    bookedStart,
    bookedEnd,
    durationHours: 1,
    createdAt: '2026-06-01T10:00:00Z',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUser.userType = 'PROVIDER'
  apiMocks.useGetV1UsersUserIdCalendar.mockReturnValue({ data: success({ items: [] }) })
  apiMocks.useGetV1UsersUserIdSchedule.mockReturnValue({ data: success({ timezone: 'Europe/Berlin', entries: [] }), isLoading: false })
  apiMocks.useListScheduleExceptions.mockReturnValue({ data: success({ items: [] }), isLoading: false })
  apiMocks.usePutV1UsersUserIdSchedule.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null })
  apiMocks.useCreateScheduleException.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null })
  apiMocks.useUpdateScheduleException.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null })
  apiMocks.useDeleteScheduleException.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null })
})

describe('<CalendarPage />', () => {
  it('renders the page heading, navbar, and calendar grid', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'My Calendar' })).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
  })

  it('shows provider controls and legend', () => {
    renderPage()
    expect(screen.getByText(/Manage your bookings, working hours/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weekly schedule/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add exception/i })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Calendar legend' })).toBeInTheDocument()
  })

  it('opens modals with route-owned data', () => {
    apiMocks.useGetV1UsersUserIdSchedule.mockReturnValue({
      data: success({ timezone: 'Europe/Berlin', entries: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }] }),
      isLoading: false,
    })
    apiMocks.useListScheduleExceptions.mockReturnValue({
      data: success({ items: [{ exceptionId: 'e-1', date: '2026-07-01', exceptionType: 'BLOCKED', startTime: null, endTime: null }] }),
      isLoading: false,
    })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /weekly schedule/i }))
    expect(screen.getByTestId('schedule-entry-count')).toHaveTextContent('1')
    fireEvent.click(screen.getByRole('button', { name: /add exception/i }))
    expect(screen.getByTestId('exception-count')).toHaveTextContent('1')
  })

  it('uses Orval hooks for calendar, schedule, and exceptions', () => {
    renderPage()
    expect(apiMocks.useGetV1UsersUserIdCalendar).toHaveBeenCalledWith('user-1', expect.objectContaining({ from: expect.any(String), to: expect.any(String) }), expect.any(Object))
    expect(apiMocks.useGetV1UsersUserIdSchedule).toHaveBeenCalledWith('user-1', expect.any(Object))
    expect(apiMocks.useListScheduleExceptions).toHaveBeenCalledWith('user-1', expect.any(Object))
  })

  it('routes modal actions through Orval mutations', () => {
    const saveSchedule = vi.fn()
    const createException = vi.fn()
    const updateException = vi.fn()
    const deleteException = vi.fn()
    apiMocks.usePutV1UsersUserIdSchedule.mockReturnValue({ mutate: saveSchedule, isPending: false, error: null })
    apiMocks.useCreateScheduleException.mockReturnValue({ mutate: createException, isPending: false, error: null })
    apiMocks.useUpdateScheduleException.mockReturnValue({ mutate: updateException, isPending: false, error: null })
    apiMocks.useDeleteScheduleException.mockReturnValue({ mutate: deleteException, isPending: false, error: null })
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /weekly schedule/i }))
    fireEvent.click(screen.getByRole('button', { name: 'modal save schedule' }))
    expect(saveSchedule).toHaveBeenCalledWith({ userId: 'user-1', data: { entries: [] } })

    fireEvent.click(screen.getByRole('button', { name: /add exception/i }))
    fireEvent.click(screen.getByRole('button', { name: 'modal create exception' }))
    expect(createException).toHaveBeenCalledWith({ userId: 'user-1', data: { date: '2026-07-01', exceptionType: 'BLOCKED' } })
    fireEvent.click(screen.getByRole('button', { name: 'modal update exception' }))
    expect(updateException).toHaveBeenCalledWith({ userId: 'user-1', exceptionId: 'e-1', data: { startTime: '10:00', endTime: '11:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'modal delete exception' }))
    expect(deleteException).toHaveBeenCalledWith({ userId: 'user-1', exceptionId: 'e-1' })
  })

  it('does not fetch schedule or exceptions for consumer', () => {
    mockUser.userType = 'CONSUMER'
    renderPage()
    expect(screen.getByText(/See your upcoming bookings/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /weekly schedule/i })).not.toBeInTheDocument()
    expect(apiMocks.useGetV1UsersUserIdSchedule).toHaveBeenCalledWith('user-1', expect.objectContaining({ query: expect.objectContaining({ enabled: false }) }))
    expect(apiMocks.useListScheduleExceptions).toHaveBeenCalledWith('user-1', expect.objectContaining({ query: expect.objectContaining({ enabled: false }) }))
  })

  it('shows booking card when selected date has bookings', () => {
    const booking = makeBooking()
    apiMocks.useGetV1UsersUserIdCalendar.mockReturnValue({ data: success({ items: [booking] }) })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Wednesday, June 10, 2026/i }))
    expect(screen.getByText('PC Repair')).toBeInTheDocument()
  })

  it('shows upcoming booking in the panel', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    const booking = makeBooking({
      bookingId: 'b-future',
      bookedStart: future.toISOString(),
      bookedEnd: new Date(future.getTime() + 3600000).toISOString(),
      title: 'Laptop Fix',
    })
    apiMocks.useGetV1UsersUserIdCalendar.mockReturnValue({ data: success({ items: [booking] }) })
    renderPage()
    expect(screen.getAllByText('Laptop Fix').length).toBeGreaterThan(0)
  })

  it('shows Today button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
  })
})
