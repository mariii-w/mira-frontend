import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { authFetch } from '../lib/queryClient'
import { WeeklyScheduleModal } from '../components/WeeklyScheduleModal'

vi.mock('../lib/queryClient', () => ({ authFetch: vi.fn() }))
const mockFetch = vi.mocked(authFetch)

vi.mock('../components/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

const defaultProps = { open: true, onClose: vi.fn(), userId: 'user-1' }

function mockSchedule(entries: object[] = []) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ entries }),
  } as Response)
}

beforeEach(() => vi.clearAllMocks())

describe('<WeeklyScheduleModal />', () => {
  it('does not render when closed', () => {
    mockSchedule()
    render(<WeeklyScheduleModal {...defaultProps} open={false} />, { wrapper: Wrapper })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows loading state before data arrives', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByText('LoadingÔÇª')).toBeInTheDocument()
  })

  it('renders all 7 days after load', async () => {
    mockSchedule()
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      expect(screen.getByLabelText(day)).toBeInTheDocument()
    }
  })

  it('pre-checks days that are in the schedule', async () => {
    mockSchedule([{ dayOfWeek: 'MON', startTime: '09:00:00', endTime: '17:00:00' }])
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    expect(screen.getByLabelText('Monday')).toBeChecked()
    expect(screen.getByLabelText('Tuesday')).not.toBeChecked()
  })

  it('toggling an unchecked day shows time inputs', async () => {
    mockSchedule()
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    expect(screen.queryByLabelText('Monday start time')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Monday'))
    expect(screen.getByLabelText('Monday start time')).toBeInTheDocument()
  })

  it('toggling a checked day hides time inputs', async () => {
    mockSchedule([{ dayOfWeek: 'FRI', startTime: '08:00:00', endTime: '16:00:00' }])
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    expect(screen.getByLabelText('Friday start time')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Friday'))
    expect(screen.queryByLabelText('Friday start time')).not.toBeInTheDocument()
  })

  it('calls PUT with enabled days on save', async () => {
    mockSchedule([{ dayOfWeek: 'MON', startTime: '09:00:00', endTime: '17:00:00' }])
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/v1/users/user-1/schedule',
        expect.objectContaining({ method: 'PUT' }),
      )
    )
  })

  it('shows error message when save fails', async () => {
    mockSchedule()
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [] }) } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'Server error' }) } as Response)
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.queryByText('LoadingÔÇª')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Server error'))
  })

  it('fetches schedule for the correct user', async () => {
    mockSchedule()
    render(<WeeklyScheduleModal {...defaultProps} />, { wrapper: Wrapper })
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith('/v1/users/user-1/schedule')
    )
  })
})
