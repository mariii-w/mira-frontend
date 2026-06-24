import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  getV1UsersUserIdCredentials,
  getV1Credentials,
  postV1UsersUserIdCredentials,
  postV1UsersUserIdCredentialsCredentialIdVerifications,
  getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId,
  patchV1UsersUserIdCredentialsCredentialId,
  deleteV1UsersUserIdCredentialsCredentialId,
} from '../api/mira'
import type { CredentialResponse, CredentialTypeResponse } from '../api/model'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => config,
  }
})

vi.mock('../stores/auth', () => ({
  useAuthStore: (selector: (s: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: 'user-1' } }),
}))

vi.mock('../api/mira', () => ({
  getGetV1UsersUserIdCredentialsQueryKey: (userId: string) => [`/v1/users/${userId}/credentials`],
  getGetV1CredentialsQueryKey: () => ['/v1/credentials'],
  getV1UsersUserIdCredentials: vi.fn(),
  getV1Credentials: vi.fn(),
  postV1UsersUserIdCredentials: vi.fn(),
  postV1UsersUserIdCredentialsCredentialIdVerifications: vi.fn(),
  getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId: vi.fn(),
  patchV1UsersUserIdCredentialsCredentialId: vi.fn(),
  deleteV1UsersUserIdCredentialsCredentialId: vi.fn(),
}))

vi.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('../components/CredentialDocumentViewer', () => ({
  CredentialDocumentViewer: () => null,
}))

const mockGetCredentials = vi.mocked(getV1UsersUserIdCredentials)
const mockGetCatalog = vi.mocked(getV1Credentials)
const mockPost = vi.mocked(postV1UsersUserIdCredentials)
const mockStartVerification = vi.mocked(postV1UsersUserIdCredentialsCredentialIdVerifications)
const mockGetVerification = vi.mocked(getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId)
const mockPatch = vi.mocked(patchV1UsersUserIdCredentialsCredentialId)
const mockDelete = vi.mocked(deleteV1UsersUserIdCredentialsCredentialId)

const evidenceMedia = {
  mediaId: 'm-1',
  url: '/v1/users/user-1/credentials/cred-1/evidence-media/content',
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

const catalog: CredentialTypeResponse[] = [
  { credentialType: 'STUDENT_VERIFIED', name: 'Student Status', description: 'Proof of enrollment' },
  { credentialType: 'MASTER_PLUMBER', name: 'Master Plumber', description: 'Trade certification' },
]

function mockCredentialsSuccess(items: CredentialResponse[]) {
  mockGetCredentials.mockResolvedValue({ status: 200, data: { items }, headers: new Headers() } as Awaited<
    ReturnType<typeof getV1UsersUserIdCredentials>
  >)
}

function renderRoute() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MyCredentialsRoute />
    </QueryClientProvider>,
  )
}

import { MyCredentialsRoute } from '../routes/my-credentials'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCatalog.mockResolvedValue({ status: 200, data: { items: catalog }, headers: new Headers() } as Awaited<
    ReturnType<typeof getV1Credentials>
  >)
  mockGetVerification.mockResolvedValue({
    status: 200,
    data: {
      verificationId: 'v-1',
      status: 'PROCESSING',
      result: null,
      feedback: null,
      createdAt: '2026-01-01T00:00:00Z',
      completedAt: null,
    },
    headers: new Headers(),
  } as Awaited<ReturnType<typeof getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId>>)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('<MyCredentialsPage />', () => {
  it('shows loading state on mount', () => {
    mockGetCredentials.mockReturnValue(new Promise(() => {}))
    renderRoute()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a card for each credential after fetch', async () => {
    mockCredentialsSuccess([
      makeCredential({ credentialId: 'cred-1', name: 'Student Status' }),
      makeCredential({ credentialId: 'cred-2', name: 'Master Plumber' }),
    ])
    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Student Status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Master Plumber' })).toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    mockGetCredentials.mockResolvedValue({
      status: 400,
      data: { type: 'about:blank', title: 'Error', status: 400, detail: 'Failed to load credentials.', instance: '/v1/users/user-1/credentials' },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getV1UsersUserIdCredentials>>)
    renderRoute()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to load credentials.'))
  })

  it('shows empty state when no credentials are returned', async () => {
    mockCredentialsSuccess([])
    renderRoute()
    await waitFor(() => expect(screen.getByText("You haven't added any credentials yet.")).toBeInTheDocument())
  })

  it('counts only approved credentials as active', async () => {
    mockCredentialsSuccess([
      makeCredential({ credentialId: 'cred-1' }),
      makeCredential({
        credentialId: 'cred-2',
        latestVerification: {
          verificationId: 'v-2',
          status: 'PROCESSING',
          result: null,
          feedback: null,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: null,
        },
      }),
    ])
    renderRoute()
    await waitFor(() => expect(screen.getByText('1 active credential')).toBeInTheDocument())
  })

  it('opens the Add credential modal listing the fetched catalog', async () => {
    mockCredentialsSuccess([makeCredential()])
    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /add credential/i }))
    expect(await screen.findByRole('button', { name: /master plumber/i })).toBeInTheDocument()
  })

  it('submits a new credential, starts verification, and refreshes the list', async () => {
    mockCredentialsSuccess([makeCredential()])
    mockPost.mockResolvedValue({
      status: 201,
      data: makeCredential({ credentialId: 'cred-new', latestVerification: null }),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentials>>)
    mockStartVerification.mockResolvedValue({
      status: 202,
      data: {
        verificationId: 'v-new',
        status: 'QUEUED',
        result: null,
        feedback: null,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentialsCredentialIdVerifications>>)

    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /add credential/i }))
    fireEvent.click(await screen.findByRole('button', { name: /master plumber/i }))
    const file = new File(['evidence'], 'evidence.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })

    mockCredentialsSuccess([makeCredential()])
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith('user-1', { credentialType: 'MASTER_PLUMBER', file }),
    )
    await waitFor(() => expect(mockStartVerification).toHaveBeenCalledWith('user-1', 'cred-new'))
    expect(screen.getByRole('status', { name: 'credential-submission-status' })).toHaveTextContent(
      'Verification started.',
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('polls the started verification until it completes and refreshes credentials', async () => {
    mockCredentialsSuccess([makeCredential()])
    mockPost.mockResolvedValue({
      status: 201,
      data: makeCredential({ credentialId: 'cred-new', latestVerification: null }),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentials>>)
    mockStartVerification.mockResolvedValue({
      status: 202,
      data: {
        verificationId: 'v-new',
        status: 'QUEUED',
        result: null,
        feedback: null,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentialsCredentialIdVerifications>>)
    mockGetVerification.mockResolvedValueOnce({
      status: 200,
      data: {
        verificationId: 'v-new',
        status: 'COMPLETED',
        result: 'APPROVED',
        feedback: null,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-01T00:01:00Z',
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId>>)

    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /add credential/i }))
    fireEvent.click(await screen.findByRole('button', { name: /master plumber/i }))
    const file = new File(['evidence'], 'evidence.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })
    mockCredentialsSuccess([makeCredential({ credentialId: 'cred-new' })])
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(mockGetVerification).toHaveBeenCalledWith('user-1', 'cred-new', 'v-new'),
    )
    await waitFor(() => expect(mockGetCredentials).toHaveBeenCalledTimes(2))
    vi.useRealTimers()
  })

  it('refreshes the credential list automatically while verification is in progress', async () => {
    mockGetCredentials
      .mockResolvedValueOnce({
        status: 200,
        data: { items: [makeCredential()] },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getV1UsersUserIdCredentials>>)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          items: [
            makeCredential({
              credentialId: 'cred-new',
              isVisible: false,
              latestVerification: {
                verificationId: 'v-new',
                status: 'PROCESSING',
                result: null,
                feedback: null,
                createdAt: '2026-01-01T00:00:00Z',
                completedAt: null,
              },
            }),
          ],
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getV1UsersUserIdCredentials>>)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          items: [
            makeCredential({
              credentialId: 'cred-new',
              isVisible: false,
              latestVerification: {
                verificationId: 'v-new',
                status: 'COMPLETED',
                result: 'APPROVED',
                feedback: null,
                createdAt: '2026-01-01T00:00:00Z',
                completedAt: '2026-01-01T00:01:00Z',
              },
            }),
          ],
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getV1UsersUserIdCredentials>>)
    mockPost.mockResolvedValue({
      status: 201,
      data: makeCredential({ credentialId: 'cred-new', latestVerification: null }),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentials>>)
    mockStartVerification.mockResolvedValue({
      status: 202,
      data: {
        verificationId: 'v-new',
        status: 'QUEUED',
        result: null,
        feedback: null,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof postV1UsersUserIdCredentialsCredentialIdVerifications>>)
    mockGetVerification.mockResolvedValue({
      status: 200,
      data: {
        verificationId: 'v-new',
        status: 'PROCESSING',
        result: null,
        feedback: null,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId>>)

    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /add credential/i }))
    fireEvent.click(await screen.findByRole('button', { name: /master plumber/i }))
    const file = new File(['evidence'], 'evidence.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(mockGetCredentials).toHaveBeenCalledTimes(2))

    await waitFor(() => expect(mockGetCredentials).toHaveBeenCalledTimes(3), { timeout: 3500 })
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'credential-submission-status' })).toHaveTextContent(
        'Credential approved.',
      ),
    )
  })

  it('toggles credential visibility', async () => {
    mockCredentialsSuccess([makeCredential({ isVisible: true })])
    mockPatch.mockResolvedValue({
      status: 200,
      data: makeCredential({ isVisible: false }),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof patchV1UsersUserIdCredentialsCredentialId>>)

    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('switch', { name: 'Visible' }))

    await waitFor(() =>
      expect(mockPatch).toHaveBeenCalledWith('user-1', 'cred-1', { isVisible: false }),
    )
  })

  it('deletes a credential after confirmation', async () => {
    mockCredentialsSuccess([makeCredential()])
    mockDelete.mockResolvedValue({ status: 204, data: undefined, headers: new Headers() } as Awaited<
      ReturnType<typeof deleteV1UsersUserIdCredentialsCredentialId>
    >)

    renderRoute()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /delete "student status"/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('user-1', 'cred-1'))
  })
})
