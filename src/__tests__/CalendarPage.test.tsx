import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarPage, type CalendarPageProps } from '../components/CalendarPage'
import type { BookingSummary, ScheduleExceptionResponse } from '../api/model'


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

function makeBooking(overrides: Partial<{
  bookingId: string
  bookedStart: string
  bookedEnd: string
  counterpartyName: string
  title: string
}> = {}): BookingSummary {
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
    status: 'CONFIRMED' as const,
    serviceAddress: null,
    totalPrice: 50,
    bookedStart,
    bookedEnd,
    createdAt: '2026-06-01T10:00:00Z',
  }
}

function makeException(
  overrides: Partial<ScheduleExceptionResponse> = {},
): ScheduleExceptionResponse {
  return {
    exceptionId: 'e-1',
    userId: 'user-1',
    date: '2026-07-01',
    exceptionType: 'BLOCKED',
    startTime: null,
    endTime: null,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    ...overrides,
  }
}

function makeProps(overrides: Partial<CalendarPageProps> = {}): CalendarPageProps {
  return {
    userId: 'user-1',
    isProvider: true,
    today: new Date(2026, 5, 10),
    year: 2026,
    month: 6,
    selectedDate: new Date(2026, 5, 10),
    monthBookings: [],
    upcomingBookings: [],
    scheduleEntries: [],
    scheduleLoaded: true,
    scheduleLoading: false,
    exceptions: [],
    scheduleSaving: false,
    scheduleError: null,
    exceptionCreating: false,
    exceptionError: null,
    onMonthChange: vi.fn(),
    onSelectedDateChange: vi.fn(),
    onToday: vi.fn(),
    onSaveSchedule: vi.fn(),
    onCreateException: vi.fn(),
    onUpdateException: vi.fn(),
    onDeleteException: vi.fn(),
    ...overrides,
  }
}

function StatefulCalendarPage({ initialProps }: { initialProps: CalendarPageProps }) {
  const [selectedDate, setSelectedDate] = useState(initialProps.selectedDate)

  return (
    <CalendarPage
      {...initialProps}
      selectedDate={selectedDate}
      onSelectedDateChange={setSelectedDate}
    />
  )
}

function renderPage(overrides: Partial<CalendarPageProps> = {}) {
  return render(<CalendarPage {...makeProps(overrides)} />)
}

function renderStatefulPage(overrides: Partial<CalendarPageProps> = {}) {
  return render(<StatefulCalendarPage initialProps={makeProps(overrides)} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('<CalendarPage />', () => {
  it('renders the page heading and calendar grid', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'My Calendar' })).toBeInTheDocument()
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
    renderPage({
      scheduleEntries: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }],
      exceptions: [makeException()],
    })
    fireEvent.click(screen.getByRole('button', { name: /weekly schedule/i }))
    expect(screen.getByTestId('schedule-entry-count')).toHaveTextContent('1')
    fireEvent.click(screen.getByRole('button', { name: /add exception/i }))
    expect(screen.getByTestId('exception-count')).toHaveTextContent('1')
  })

  it('routes modal actions through component callbacks', () => {
    const onSaveSchedule = vi.fn()
    const onCreateException = vi.fn()
    const onUpdateException = vi.fn()
    const onDeleteException = vi.fn()
    renderPage({ onSaveSchedule, onCreateException, onUpdateException, onDeleteException })

    fireEvent.click(screen.getByRole('button', { name: /weekly schedule/i }))
    fireEvent.click(screen.getByRole('button', { name: 'modal save schedule' }))
    expect(onSaveSchedule).toHaveBeenCalledWith({ entries: [] })

    fireEvent.click(screen.getByRole('button', { name: /add exception/i }))
    fireEvent.click(screen.getByRole('button', { name: 'modal create exception' }))
    expect(onCreateException).toHaveBeenCalledWith({ date: '2026-07-01', exceptionType: 'BLOCKED' })
    fireEvent.click(screen.getByRole('button', { name: 'modal update exception' }))
    expect(onUpdateException).toHaveBeenCalledWith('e-1', { startTime: '10:00', endTime: '11:00' })
    fireEvent.click(screen.getByRole('button', { name: 'modal delete exception' }))
    expect(onDeleteException).toHaveBeenCalledWith('e-1')
  })

  it('hides provider-only controls for consumers', () => {
    renderPage({ isProvider: false })
    expect(screen.getByText(/See your upcoming bookings/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /weekly schedule/i })).not.toBeInTheDocument()
  })

  it('shows booking card when selected date has bookings', () => {
    const booking = makeBooking()
    renderStatefulPage({ monthBookings: [booking] })
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
    renderPage({ upcomingBookings: [booking] })
    expect(screen.getAllByText('Laptop Fix').length).toBeGreaterThan(0)
  })

  it('shows Today button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
  })
})
