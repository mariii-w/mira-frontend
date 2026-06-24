import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SubmitCredentialModal } from '../components/SubmitCredentialModal'
import type { CredentialTypeResponse } from '../api/model'

vi.mock('../components/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

const credentialTypes: CredentialTypeResponse[] = [
  { credentialType: 'STUDENT_VERIFIED', name: 'Student Status', description: 'Proof of enrollment' },
  { credentialType: 'MASTER_PLUMBER', name: 'Master Plumber', description: 'Trade certification' },
]

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  credentialTypes,
  catalogLoading: false,
  isSubmitting: false,
  errorMessage: null,
  onSubmit: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('<SubmitCredentialModal />', () => {
  it('does not render when closed', () => {
    render(<SubmitCredentialModal {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lists the credential types from the catalog', () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /student status/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /master plumber/i })).toBeInTheDocument()
  })

  it('shows a loading message instead of the catalog while it loads', () => {
    render(<SubmitCredentialModal {...defaultProps} catalogLoading credentialTypes={[]} />)
    expect(screen.getByText('Loading credential types…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /student status/i })).not.toBeInTheDocument()
  })

  it('disables Submit until a type and a file are chosen', () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /student status/i }))
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    const file = new File(['evidence'], 'evidence.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
  })

  it('accepts jpg, png, and pdf evidence files', () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    expect(screen.getByLabelText('Choose file')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,application/pdf',
    )
    expect(screen.getByText('JPG, PNG, or PDF.')).toBeInTheDocument()
  })

  it('marks the selected type as pressed', () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    const studentButton = screen.getByRole('button', { name: /student status/i })
    fireEvent.click(studentButton)
    expect(studentButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /master plumber/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSubmit with the selected type and file', () => {
    const onSubmit = vi.fn()
    const file = new File(['evidence'], 'evidence.png', { type: 'image/png' })
    render(<SubmitCredentialModal {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /master plumber/i }))
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith('MASTER_PLUMBER', file)
  })

  it('rejects unsupported evidence file types before submit', () => {
    const onSubmit = vi.fn()
    render(<SubmitCredentialModal {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /master plumber/i }))
    const file = new File(['evidence'], 'evidence.gif', { type: 'image/gif' })
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })

    expect(screen.getByRole('alert')).toHaveTextContent('Choose a JPG, PNG, or PDF file.')
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<SubmitCredentialModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables Cancel while submitting', () => {
    render(<SubmitCredentialModal {...defaultProps} isSubmitting />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('shows the supplied error message', () => {
    render(<SubmitCredentialModal {...defaultProps} errorMessage="Submission failed." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Submission failed.')
  })
})
