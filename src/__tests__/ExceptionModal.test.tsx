import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ExceptionModal } from '../components/features/bookings/ExceptionModal'

vi.mock('../components/common/ui/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  exceptions: [],
  isCreating: false,
  errorMessage: null,
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('<ExceptionModal />', () => {
  it('does not render when closed', () => {
    render(<ExceptionModal {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders Add tab by default', () => {
    render(<ExceptionModal {...defaultProps} />)
    expect(screen.getByRole('tab', { name: 'Add exception' })).toHaveAttribute('aria-selected', 'true')
  })

  it('BLOCKED type selected by default', () => {
    render(<ExceptionModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /mark as unavailable/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows all-day checkbox for BLOCKED, hides for AVAILABLE', () => {
    render(<ExceptionModal {...defaultProps} />)
    expect(screen.getByLabelText('All day')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /add extra availability/i }))
    expect(screen.queryByLabelText('All day')).not.toBeInTheDocument()
  })

  it('unchecking all-day reveals time inputs for BLOCKED', () => {
    render(<ExceptionModal {...defaultProps} />)
    expect(screen.queryByLabelText('Start time')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('All day'))
    expect(screen.getByLabelText('Start time')).toBeInTheDocument()
  })

  it('AVAILABLE type always shows time inputs', () => {
    render(<ExceptionModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /add extra availability/i }))
    expect(screen.getByLabelText('Start time')).toBeInTheDocument()
    expect(screen.getByLabelText('End time')).toBeInTheDocument()
  })

  it('submit button is disabled when no date selected', () => {
    render(<ExceptionModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /block this time/i })).toBeDisabled()
  })

  it('calls onCreate with correct body on submit', () => {
    const onCreate = vi.fn()
    render(<ExceptionModal {...defaultProps} onCreate={onCreate} />)

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-01' } })
    fireEvent.click(screen.getByRole('button', { name: /block this time/i }))

    expect(onCreate).toHaveBeenCalledWith({ date: '2026-07-01', exceptionType: 'BLOCKED' })
  })

  it('shows supplied error alert', () => {
    render(<ExceptionModal {...defaultProps} errorMessage="Conflict" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Conflict')
  })

  it('switches to Manage tab and shows empty state from supplied exceptions', () => {
    render(<ExceptionModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    expect(screen.getByText('No exceptions set yet.')).toBeInTheDocument()
  })

  it('lists existing exceptions in Manage tab', () => {
    render(
      <ExceptionModal
        {...defaultProps}
        exceptions={[
          { exceptionId: 'e-1', date: '2026-07-05', exceptionType: 'BLOCKED', startTime: null, endTime: null },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    expect(screen.getByText(/Jul/)).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('calls onUpdate when editing an exception', () => {
    const onUpdate = vi.fn()
    render(
      <ExceptionModal
        {...defaultProps}
        onUpdate={onUpdate}
        exceptions={[
          { exceptionId: 'e-1', date: '2026-07-05', exceptionType: 'AVAILABLE', startTime: '09:00', endTime: '17:00' },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit times' }))
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '10:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onUpdate).toHaveBeenCalledWith('e-1', { startTime: '10:00', endTime: '17:00' })
  })

  it('calls onDelete after confirmation', () => {
    const onDelete = vi.fn()
    render(
      <ExceptionModal
        {...defaultProps}
        onDelete={onDelete}
        exceptions={[
          { exceptionId: 'e-1', date: '2026-07-05', exceptionType: 'BLOCKED', startTime: null, endTime: null },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Manage exceptions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete exception' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('e-1')
  })
})
