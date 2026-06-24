import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import { fetchCredentialEvidenceMediaUrl } from '../lib/credentialEvidenceMedia'

interface CredentialDocumentViewerProps {
  open: boolean
  onClose: () => void
  userId: string
  credentialId: string
  credentialName: string
}

export function CredentialDocumentViewer({
  open,
  onClose,
  userId,
  credentialId,
  credentialName,
}: CredentialDocumentViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setImageUrl(null)
      setError(null)
    }
  }

  useEffect(() => {
    if (!open) return

    let objectUrl: string | null = null
    let cancelled = false

    fetchCredentialEvidenceMediaUrl(userId, credentialId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setError(null)
        setImageUrl(url)
      })
      .catch(() => {
        if (cancelled) return
        setImageUrl(null)
        setError('Failed to load document.')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, userId, credentialId])

  return (
    <Modal open={open} onClose={onClose} title="Uploaded document" description={credentialName}>
      <div className="mt-4 flex min-h-[16rem] items-center justify-center">
        {error && (
          <p role="alert" className="text-small text-red-600">
            {error}
          </p>
        )}
        {!error && !imageUrl && (
          <Loader2
            size={28}
            className="animate-spin motion-reduce:animate-none text-muted"
            aria-label="Loading document"
          />
        )}
        {!error && imageUrl && (
          <img
            src={imageUrl}
            alt={`Uploaded evidence for ${credentialName}`}
            className="max-h-[70vh] w-full rounded-xl object-contain"
          />
        )}
      </div>
    </Modal>
  )
}
