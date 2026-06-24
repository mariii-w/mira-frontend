import { useId, useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import * as Switch from './Switch'
import { Button } from './Button'
import { CredentialDocumentViewer } from './CredentialDocumentViewer'
import type { CredentialResponse } from '../api/model'

export type { CredentialResponse } from '../api/model'

type StatusKind = 'verified' | 'verified-muted' | 'pending' | 'denied'

const STATUS_STYLE: Record<StatusKind, { bar: string; text: string }> = {
  verified: { bar: 'bg-forest', text: 'text-forest font-semibold' },
  'verified-muted': { bar: 'bg-grey-olive', text: 'text-muted' },
  pending: { bar: 'bg-amber-500', text: 'text-amber-600 font-medium' },
  denied: { bar: 'bg-red-600', text: 'text-red-600 font-semibold' },
}

function getStatus(credential: CredentialResponse): { kind: StatusKind; label: string } {
  const verification = credential.latestVerification

  if (verification?.status === 'COMPLETED' && verification.result === 'APPROVED') {
    return { kind: credential.isVisible ? 'verified' : 'verified-muted', label: 'Verified' }
  }
  if (verification?.status === 'COMPLETED' && verification.result === 'DENIED') {
    return { kind: 'denied', label: 'Not approved' }
  }
  if (verification?.status === 'FAILED') {
    return { kind: 'pending', label: 'Verification failed' }
  }
  return { kind: 'pending', label: 'Pending' }
}

interface CredentialCardProps {
  credential: CredentialResponse
  userId: string
  isUpdatingVisibility?: boolean
  isDeleting?: boolean
  onVisibilityChange: (credentialId: string, isVisible: boolean) => void
  onDelete: (credentialId: string) => void
}

export function CredentialCard({
  credential,
  userId,
  isUpdatingVisibility = false,
  isDeleting = false,
  onVisibilityChange,
  onDelete,
}: CredentialCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const headingId = useId()
  const visibilityToggleId = useId()

  const status = getStatus(credential)
  const style = STATUS_STYLE[status.kind]
  const canToggleVisibility = status.kind === 'verified' || status.kind === 'verified-muted'

  return (
    <article aria-labelledby={headingId} className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border/20 flex">
      <div aria-hidden="true" className={`w-2 shrink-0 ${style.bar}`} />

      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        className="flex w-28 sm:w-32 shrink-0 flex-col items-center justify-center gap-1.5 bg-linen p-3 text-center text-label font-medium text-muted hover:bg-linen/70 transition-colors"
      >
        <FileText size={22} aria-hidden="true" />
        View document
      </button>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-label uppercase tracking-wide text-muted">Credential</p>
          <h2 id={headingId} className="font-heading text-h2 font-bold text-foreground leading-snug">
            {credential.name}
          </h2>
          <p className={`text-small ${style.text}`}>{status.label}</p>
        </div>

        {!confirmDelete ? (
          <div className="flex items-center gap-4 shrink-0">
            {canToggleVisibility && (
              <div className="flex items-center gap-2">
                <label htmlFor={visibilityToggleId} className="text-small font-medium text-foreground cursor-pointer">
                  Visible
                </label>
                <Switch.Root
                  id={visibilityToggleId}
                  checked={credential.isVisible}
                  disabled={isUpdatingVisibility}
                  onCheckedChange={(checked) => onVisibilityChange(credential.credentialId, checked)}
                  className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-grey-olive/40 data-[state=checked]:bg-primary transition-colors duration-150 disabled:opacity-50"
                >
                  <Switch.Thumb className="block h-5 w-5 rounded-full bg-surface shadow translate-x-0.5 data-[state=checked]:translate-x-[22px] transition-transform duration-150" />
                </Switch.Root>
              </div>
            )}
            <Button
              variant="icon"
              size="md"
              aria-label={`Delete "${credential.name}"`}
              onClick={() => setConfirmDelete(true)}
              className="bg-accent text-accent-foreground border-accent hover:bg-accent-hover active:bg-accent-hover"
            >
              <Trash2 />
            </Button>
          </div>
        ) : (
          <div role="alert" className="flex items-center gap-3 shrink-0 rounded-xl bg-red-50 px-3 py-2">
            <p className="text-small font-medium text-red-700">Delete this credential?</p>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isDeleting}
              onClick={() => onDelete(credential.credentialId)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-700"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <CredentialDocumentViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        userId={userId}
        credentialId={credential.credentialId}
        credentialName={credential.name}
      />
    </article>
  )
}
