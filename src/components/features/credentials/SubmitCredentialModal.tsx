import { useRef, useState, type ChangeEvent } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { Check, ChevronDown, Upload } from 'lucide-react'
import { Modal } from '../../common/ui/Modal'
import { Button } from '../../common/ui/Button'
import type { CredentialType, CredentialTypeResponse } from '../../../api/model'

const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png']

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
      setFileError('Choose a JPG or PNG file.')
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

  const sortedTypes = [...credentialTypes].sort((a, b) => a.name.localeCompare(b.name))
  const selectedTypeInfo = sortedTypes.find((type) => type.credentialType === selectedType)

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
          <Listbox value={selectedType} onChange={setSelectedType}>
            <div className="relative">
              <ListboxButton
                aria-label="Credential type"
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary data-[open]:border-primary"
              >
                <span className={selectedTypeInfo ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted'}>
                  {selectedTypeInfo ? selectedTypeInfo.name : 'Select a credential type'}
                </span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform ui-open:rotate-180"
                />
              </ListboxButton>

              <ListboxOptions
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-lg py-1 focus:outline-none"
              >
                {sortedTypes.map((type) => (
                  <ListboxOption
                    key={type.credentialType}
                    value={type.credentialType}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors data-[focus]:bg-primary/10"
                  >
                    <span>
                      <p className="text-sm font-semibold text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                    </span>
                    {selectedType === type.credentialType && (
                      <Check size={14} aria-hidden="true" className="shrink-0 text-primary" />
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        )}

        {selectedTypeInfo && (
          <p className="-mt-2 text-xs text-muted-foreground">{selectedTypeInfo.description}</p>
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
              aria-describedby={["evidence-hint", fileError ? "evidence-error" : undefined].filter(Boolean).join(" ")}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
            <input
              ref={fileInputRef}
              id="credential-evidence-input"
              type="file"
              accept="image/jpeg,image/png"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={handleFileChange}
            />
            <p role="status" aria-live="polite" className="text-small text-muted truncate">
              {file ? file.name : ''}
            </p>
          </div>
          <p id="evidence-hint" className="text-small text-muted">JPG or PNG.</p>
        </div>

        {(fileError || errorMessage) && (
          <p id="evidence-error" role="alert" className="text-sm text-red-600">
            {fileError ?? errorMessage}
          </p>
        )}

        <div className="flex justify-center gap-3 mt-1">
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
