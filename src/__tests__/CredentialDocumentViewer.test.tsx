import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CredentialDocumentViewer } from '../components/features/credentials/CredentialDocumentViewer'
import { fetchCredentialEvidenceMediaUrl } from '../lib/credentialEvidenceMedia'

vi.mock('../components/common/ui/Modal', () => ({
  Modal: ({ open, children, title }: { open: boolean; children: ReactNode; title: string }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
}))

vi.mock('../lib/credentialEvidenceMedia', () => ({
  fetchCredentialEvidenceMediaUrl: vi.fn(),
}))

const mockFetch = vi.mocked(fetchCredentialEvidenceMediaUrl)

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  userId: 'u-1',
  credentialId: 'cred-1',
  credentialName: 'Student Status',
}

beforeEach(() => vi.clearAllMocks())

describe('<CredentialDocumentViewer />', () => {
  it('does not fetch when closed', () => {
    render(<CredentialDocumentViewer {...defaultProps} open={false} />)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches the evidence image for the given user and credential when opened', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<CredentialDocumentViewer {...defaultProps} />)
    expect(mockFetch).toHaveBeenCalledWith('u-1', 'cred-1')
  })

  it('shows the image once the fetch resolves', async () => {
    mockFetch.mockResolvedValue('blob:fake-url')
    render(<CredentialDocumentViewer {...defaultProps} />)

    const img = await screen.findByRole('img', { name: /uploaded evidence for student status/i })
    expect(img).toHaveAttribute('src', 'blob:fake-url')
  })

  it('shows an error message when the fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('boom'))
    render(<CredentialDocumentViewer {...defaultProps} />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to load document.'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not reuse the previous (revoked) blob URL while reopening', async () => {
    mockFetch.mockResolvedValueOnce('blob:first-url')
    const { rerender } = render(<CredentialDocumentViewer {...defaultProps} />)
    await screen.findByRole('img', { name: /uploaded evidence for student status/i })

    rerender(<CredentialDocumentViewer {...defaultProps} open={false} />)

    let resolveSecond!: (url: string) => void
    mockFetch.mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)))
    rerender(<CredentialDocumentViewer {...defaultProps} open={true} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    resolveSecond('blob:second-url')
    const img = await screen.findByRole('img', { name: /uploaded evidence for student status/i })
    expect(img).toHaveAttribute('src', 'blob:second-url')
  })
})
