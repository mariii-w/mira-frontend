import { Plus } from 'lucide-react'
import { Button } from './Button'
import { CredentialCard } from './CredentialCard'
import type { CredentialResponse } from '../api/model'

interface CredentialsProps {
  userId: string
  credentials: CredentialResponse[]
  loading: boolean
  error: string | null
  submissionStatus: string | null
  actionError: string | null
  updatingVisibilityId: string | null
  deletingId: string | null
  onAddCredential: () => void
  onVisibilityChange: (credentialId: string, isVisible: boolean) => void
  onDelete: (credentialId: string) => void
}

function countActive(credentials: CredentialResponse[]): number {
  return credentials.filter((c) => c.latestVerification?.status === 'COMPLETED' && c.latestVerification.result === 'APPROVED').length
}

function AddCredentialButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-accent text-accent font-bold hover:bg-accent/5 active:bg-accent/10 shrink-0"
      trailingIcon={
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-cream shrink-0">
          <Plus size={14} aria-hidden="true" />
        </span>
      }
    >
      Add credential
    </Button>
  )
}

export function Credentials({
  userId,
  credentials,
  loading,
  error,
  submissionStatus,
  actionError,
  updatingVisibilityId,
  deletingId,
  onAddCredential,
  onVisibilityChange,
  onDelete,
}: CredentialsProps) {
  const activeCount = countActive(credentials)

  return (
    <>
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 animate-fade-in-up">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-h1 font-bold text-foreground">My Credentials</h1>
              <p className="text-small text-muted">
                {activeCount} active credential{activeCount === 1 ? '' : 's'}
              </p>
            </div>
            <AddCredentialButton onClick={onAddCredential} />
          </div>

          <p
            role="status"
            aria-live="polite"
            className={`mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-small font-medium text-accent${submissionStatus ? '' : ' sr-only'}`}
          >
            {submissionStatus ?? ''}
          </p>

          {actionError && (
            <p role="alert" className="mb-4 text-small text-red-600">
              {actionError}
            </p>
          )}

          {loading && (
            <div role="status" aria-live="polite" className="flex justify-center py-16">
              <p className="text-small text-muted">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <p role="alert" className="text-small text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && credentials.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-body text-muted">You haven't added any credentials yet.</p>
              <AddCredentialButton onClick={onAddCredential} />
            </div>
          )}

          {!loading && !error && credentials.length > 0 && (
            <ul role="list" aria-label="Your credentials" className="flex flex-col gap-4 list-none m-0 p-0">
              {credentials.map((credential, index) => (
                <li
                  key={credential.credentialId}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index * 60, 420) + 120}ms` }}
                >
                  <CredentialCard
                    credential={credential}
                    userId={userId}
                    isUpdatingVisibility={updatingVisibilityId === credential.credentialId}
                    isDeleting={deletingId === credential.credentialId}
                    onVisibilityChange={onVisibilityChange}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
