import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { WeeklyScheduleModal } from '../components/features/bookings/WeeklyScheduleModal'

vi.mock('../components/common/ui/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  entries: [],
  isLoading: false,
  isSaving: false,
  errorMessage: null,
  onSave: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('<WeeklyScheduleModal />', () => {
  it('does not render when closed', () => {
    render(<WeeklyScheduleModal {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows loading state from props', () => {
    render(<WeeklyScheduleModal {...defaultProps} isLoading />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders all 7 days from supplied schedule info', () => {
    render(<WeeklyScheduleModal {...defaultProps} />)
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      expect(screen.getByLabelText(day)).toBeInTheDocument()
    }
  })

  it('pre-checks days passed in entries', () => {
    render(
      <WeeklyScheduleModal
        {...defaultProps}
        entries={[{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }]}
      />,
    )
    expect(screen.getByLabelText('Monday')).toBeChecked()
    expect(screen.getByLabelText('Tuesday')).not.toBeChecked()
  })

  it('toggling an unchecked day shows time inputs', () => {
    render(<WeeklyScheduleModal {...defaultProps} />)
    expect(screen.queryByLabelText('Monday start time')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Monday'))
    expect(screen.getByLabelText('Monday start time')).toBeInTheDocument()
  })

  it('toggling a checked day hides time inputs', () => {
    render(
      <WeeklyScheduleModal
        {...defaultProps}
        entries={[{ dayOfWeek: 'FRI', startTime: '08:00', endTime: '16:00' }]}
      />,
    )
    expect(screen.getByLabelText('Friday start time')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Friday'))
    expect(screen.queryByLabelText('Friday start time')).not.toBeInTheDocument()
  })

  it('calls onSave with enabled days on save', () => {
    const onSave = vi.fn()
    render(
      <WeeklyScheduleModal
        {...defaultProps}
        onSave={onSave}
        entries={[{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
    expect(onSave).toHaveBeenCalledWith({
      entries: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }],
    })
  })

  it('shows supplied error message', () => {
    render(<WeeklyScheduleModal {...defaultProps} errorMessage="Server error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Server error')
  })
})
