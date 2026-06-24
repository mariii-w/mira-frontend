import { useRef, useState, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { CredentialType, CredentialTypeResponse } from '../api/model'

const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

interface SubmitCredentialModalProps {
  open: boolean
  onClose: () => void
  credentialTypes: CredentialTypeResponse[]
  catalogLoading: boolean
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (credentialType: CredentialType, file: File) => void
}

export function SubmitCredentialModal({
  open,
  onClose,
  credentialTypes,
  catalogLoading,
  isSubmitting,
  errorMessage,
  onSubmit,
}: SubmitCredentialModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function resetForm() {
    setSelectedType(null)
    setFile(null)
    setFileError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return

    if (!ALLOWED_EVIDENCE_TYPES.includes(picked.type)) {
      setFile(null)
      setFileError('Choose a JPG, PNG, or PDF file.')
      return
    }

    setFileError(null)
    setFile(picked)
  }

  function handleSubmit() {
    if (!selectedType || !file) return
    onSubmit(selectedType, file)
    resetForm()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add credential"
      description="Choose a credential type and upload supporting evidence for review."
    >
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Credential type
        </p>

        {catalogLoading ? (
          <p className="text-small text-muted">Loading credential types…</p>
        ) : (
          <div className="flex flex-col gap-2 -mt-2 max-h-56 overflow-y-auto">
            {credentialTypes.map((type) => (
              <button
                key={type.credentialType}
                type="button"
                onClick={() => setSelectedType(type.credentialType)}
                aria-pressed={selectedType === type.credentialType}
                className={[
                  'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                  selectedType === type.credentialType
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:bg-foreground/5',
                ].join(' ')}
              >
                <p
                  className={[
                    'text-sm font-semibold',
                    selectedType === type.credentialType ? 'text-accent' : 'text-foreground',
                  ].join(' ')}
                >
                  {type.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              leadingIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
            <input
              ref={fileInputRef}
              id="credential-evidence-input"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              aria-label="Choose file"
              className="sr-only"
              onChange={handleFileChange}
            />
            {file && <p className="text-small text-muted truncate">{file.name}</p>}
          </div>
          <p className="text-small text-muted">JPG, PNG, or PDF.</p>
        </div>

        {(fileError || errorMessage) && (
          <p role="alert" className="text-sm text-red-600">
            {fileError ?? errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-1">
          <Button variant="secondary" size="md" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="accent"
            size="md"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !selectedType || !file || !!fileError}
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
