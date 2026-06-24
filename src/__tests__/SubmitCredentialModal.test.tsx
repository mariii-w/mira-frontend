import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { SubmitCredentialModal } from '../components/SubmitCredentialModal'
import type { CredentialTypeResponse } from '../api/model'

// Headless UI's Listbox uses ResizeObserver to position the options popover, which jsdom doesn't implement.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

vi.mock('../components/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

const credentialTypes: CredentialTypeResponse[] = [
  { credentialType: 'STUDENT_VERIFIED', name: 'Student Status', description: 'Proof of enrollment' },
  { credentialType: 'MASTER_PLUMBER', name: 'Master Plumber', description: 'Trade certification' },
]

async function openTypeDropdown() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Credential type' }))
  })
}

async function selectTypeOption(name: RegExp) {
  await act(async () => {
    fireEvent.click(screen.getByRole('option', { name }))
  })
}

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

  it('lists the credential types from the catalog, sorted alphabetically', async () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    await openTypeDropdown()
    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining('Master Plumber'),
      expect.stringContaining('Student Status'),
    ])
  })

  it('shows a loading message instead of the catalog while it loads', () => {
    render(<SubmitCredentialModal {...defaultProps} catalogLoading credentialTypes={[]} />)
    expect(screen.getByText('Loading credential types…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Credential type' })).not.toBeInTheDocument()
  })

  it('disables Submit until a type and a file are chosen', async () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    await openTypeDropdown()
    await selectTypeOption(/student status/i)
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

  it('marks the selected type as selected and shows it on the trigger', async () => {
    render(<SubmitCredentialModal {...defaultProps} />)
    await openTypeDropdown()
    await selectTypeOption(/student status/i)

    expect(screen.getByRole('button', { name: 'Credential type' })).toHaveTextContent('Student Status')

    await openTypeDropdown()
    expect(screen.getByRole('option', { name: /student status/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /master plumber/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onSubmit with the selected type and file', async () => {
    const onSubmit = vi.fn()
    const file = new File(['evidence'], 'evidence.png', { type: 'image/png' })
    render(<SubmitCredentialModal {...defaultProps} onSubmit={onSubmit} />)

    await openTypeDropdown()
    await selectTypeOption(/master plumber/i)
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith('MASTER_PLUMBER', file)
  })

  it('rejects unsupported evidence file types before submit', async () => {
    const onSubmit = vi.fn()
    render(<SubmitCredentialModal {...defaultProps} onSubmit={onSubmit} />)

    await openTypeDropdown()
    await selectTypeOption(/master plumber/i)
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
