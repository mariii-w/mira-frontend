import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { authFetch } from '../lib/authFetch'
import { ExceptionModal } from '../components/ExceptionModal'

vi.mock('../lib/authFetch', () => ({ authFetch: vi.fn() }))
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

function apiResponse<T>(data: T, status = 200) {
  return { data, status, headers: new Headers() }
}

beforeEach(() => vi.clearAllMocks())

describe('<ExceptionModal />', () => {
  it('does not render when closed', () => {
    render(<ExceptionModal {...defaultProps} open={false} />, { wrapper: Wrapper })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders Add tab by default', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('tab', { name: 'Add exception' })).toHaveAttribute('aria-selected', 'true')
  })

  it('BLOCKED type selected by default', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /mark as unavailable/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows all-day checkbox for BLOCKED, hides for AVAILABLE', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByLabelText('All day')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /add extra availability/i }))
    expect(screen.queryByLabelText('All day')).not.toBeInTheDocument()
  })

  it('unchecking all-day reveals time inputs for BLOCKED', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.queryByLabelText('Start time')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('All day'))
    expect(screen.getByLabelText('Start time')).toBeInTheDocument()
  })

  it('AVAILABLE type always shows time inputs', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /add extra availability/i }))
    expect(screen.getByLabelText('Start time')).toBeInTheDocument()
    expect(screen.getByLabelText('End time')).toBeInTheDocument()
  })

  it('submit button is disabled when no date selected', () => {
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /block this time/i })).toBeDisabled()
  })

  it('calls POST with correct body on submit', async () => {
    mockFetch.mockResolvedValue(apiResponse({}))
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-01' } })
    fireEvent.click(screen.getByRole('button', { name: /block this time/i }))

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/v1/users/user-1/exceptions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ date: '2026-07-01', exceptionType: 'BLOCKED' }),
        }),
      )
    )
  })

  it('shows error alert when POST fails', async () => {
    mockFetch.mockResolvedValue(apiResponse({ detail: 'Conflict' }, 409))
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-01' } })
    fireEvent.click(screen.getByRole('button', { name: /block this time/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Conflict'))
  })

  it('switches to Manage tab and shows empty state', async () => {
    mockFetch.mockResolvedValue(apiResponse({ items: [] }))
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    await waitFor(() =>
      expect(screen.getByText('No exceptions set yet.')).toBeInTheDocument()
    )
  })

  it('lists existing exceptions in Manage tab', async () => {
    mockFetch.mockResolvedValue(apiResponse({
      items: [
        { exceptionId: 'e-1', date: '2026-07-05', exceptionType: 'BLOCKED', startTime: null, endTime: null },
      ],
    }))
    render(<ExceptionModal {...defaultProps} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    await waitFor(() => expect(screen.getByText(/Jul/)).toBeInTheDocument())
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })
})
