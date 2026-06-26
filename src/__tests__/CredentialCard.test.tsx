import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CredentialCard } from '../components/CredentialCard'
import type { CredentialResponse } from '../api/model'

vi.mock('../components/CredentialDocumentViewer', () => ({
  CredentialDocumentViewer: ({ open }: { open: boolean }) =>
    open ? <div data-testid="document-viewer" /> : null,
}))

const evidenceMedia = {
  mediaId: 'm-1',
  url: '/v1/users/u-1/credentials/cred-1/evidence-media/content',
  altTextStatus: 'COMPLETED' as const,
  mimeType: 'image/png',
  size: 100,
  width: 10,
  height: 10,
  createdAt: '2026-01-01T00:00:00Z',
}

function makeCredential(overrides: Partial<CredentialResponse> = {}): CredentialResponse {
  return {
    credentialId: 'cred-1',
    credentialType: 'STUDENT_VERIFIED',
    name: 'Student Status',
    description: 'Proof of student enrollment',
    expiresAt: null,
    isVisible: true,
    evidenceMedia,
    createdAt: '2026-01-01T00:00:00Z',
    latestVerification: {
      verificationId: 'v-1',
      status: 'COMPLETED',
      result: 'APPROVED',
      feedback: null,
      createdAt: '2026-01-01T00:00:00Z',
      completedAt: '2026-01-02T00:00:00Z',
    },
    ...overrides,
  }
}

const defaultProps = {
  userId: 'u-1',
  isUpdatingVisibility: false,
  isDeleting: false,
  onVisibilityChange: vi.fn(),
  onDelete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('<CredentialCard />', () => {
  it('renders the credential name as a heading', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential()} />)
    expect(screen.getByRole('heading', { name: 'Student Status' })).toBeInTheDocument()
  })

  it('shows "Verified" and a Visible toggle when approved and visible', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential({ isVisible: true })} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /show student status on public profile/i })).toBeChecked()
  })

  it('shows an unchecked Visible toggle when approved but hidden', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential({ isVisible: false })} />)
    expect(screen.getByRole('switch', { name: /show student status on public profile/i })).not.toBeChecked()
  })

  it('shows "Pending" and no toggle when there is no verification yet', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential({ latestVerification: null })} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('does not show the Visible toggle for an expired approved credential', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({ expiresAt: '2025-01-01T00:00:00Z' })}
      />,
    )
    expect(screen.getByText('Expired')).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('shows "Pending" while verification is queued or processing', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({
          latestVerification: {
            verificationId: 'v-1',
            status: 'PROCESSING',
            result: null,
            feedback: null,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: null,
          },
        })}
      />,
    )
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows "Verification failed" when the verification attempt failed', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({
          latestVerification: {
            verificationId: 'v-1',
            status: 'FAILED',
            result: null,
            feedback: null,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-02T00:00:00Z',
          },
        })}
      />,
    )
    expect(screen.getByText('Verification failed')).toBeInTheDocument()
  })

  it('shows "Not approved" and no toggle when denied', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({
          latestVerification: {
            verificationId: 'v-1',
            status: 'COMPLETED',
            result: 'DENIED',
            feedback: 'Document unreadable.',
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-02T00:00:00Z',
          },
        })}
      />,
    )
    expect(screen.getByText('Not approved')).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('opens a modal with the rejection reason when a denied status is clicked', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({
          latestVerification: {
            verificationId: 'v-1',
            status: 'COMPLETED',
            result: 'DENIED',
            feedback: 'Document unreadable.',
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-02T00:00:00Z',
          },
        })}
      />,
    )
    expect(screen.queryByText('Document unreadable.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /view rejection reason/i }))
    expect(screen.getByRole('dialog', { name: 'Rejection reason' })).toBeInTheDocument()
    expect(screen.getByText('Document unreadable.')).toBeInTheDocument()
  })

  it('does not make the status clickable when there is no feedback', () => {
    render(
      <CredentialCard
        {...defaultProps}
        credential={makeCredential({
          latestVerification: {
            verificationId: 'v-1',
            status: 'COMPLETED',
            result: 'DENIED',
            feedback: null,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-02T00:00:00Z',
          },
        })}
      />,
    )
    expect(screen.queryByRole('button', { name: /view rejection reason/i })).not.toBeInTheDocument()
    expect(screen.getByText('Not approved').tagName).toBe('P')
  })

  it('calls onVisibilityChange with the credentialId and new value when the toggle is clicked', () => {
    const onVisibilityChange = vi.fn()
    render(
      <CredentialCard
        {...defaultProps}
        onVisibilityChange={onVisibilityChange}
        credential={makeCredential({ isVisible: true })}
      />,
    )
    fireEvent.click(screen.getByRole('switch', { name: /show student status on public profile/i }))
    expect(onVisibilityChange).toHaveBeenCalledWith('cred-1', false)
  })

  it('opens the document viewer when "View document" is clicked', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential()} />)
    expect(screen.queryByTestId('document-viewer')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /view document/i }))
    expect(screen.getByTestId('document-viewer')).toBeInTheDocument()
  })

  it('shows an inline confirmation before deleting, and cancel dismisses it', () => {
    render(<CredentialCard {...defaultProps} credential={makeCredential()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete "student status"/i }))
    expect(screen.getByText('Delete this credential?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText('Delete this credential?')).not.toBeInTheDocument()
  })

  it('calls onDelete with the credentialId when delete is confirmed', () => {
    const onDelete = vi.fn()
    render(<CredentialCard {...defaultProps} onDelete={onDelete} credential={makeCredential()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete "student status"/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('cred-1')
  })
})
