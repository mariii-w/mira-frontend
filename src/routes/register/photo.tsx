import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { usePageTitle } from '../../lib/usePageTitle'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import { Button } from '../../components/Button'
import { AvatarIcon } from '../../components/AvatarIcon'
import { useAuthStore } from '../../stores/auth'
import { uploadProfilePhoto, type UploadPhotoError } from '../../lib/patchUser'

export const Route = createFileRoute('/register/photo')({
  component: RegisterPhoto,
})

const MAX_BYTES = 5 * 1024 * 1024

function validateFile(file: File): string | null {
  if (file.size > MAX_BYTES) return 'Image is too large. Max 5 MB.'
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return 'Unsupported format. Use JPG or PNG.'
  }
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterPhoto() {
  usePageTitle('Profile photo')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileMedia?.url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    const validationError = validateFile(picked)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError(null)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      if (file) {
        await uploadProfilePhoto(file)
      }
      navigate({ to: '/register/done' })
    } catch (e) {
      setError((e as UploadPhotoError).message)
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <header className="flex flex-col gap-2">
        <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
          Add a profile photo
        </h2>
        <p className="text-small text-muted">
          Optional, but profiles with photos get faster responses. You can always add one later.
        </p>
      </header>

      <div className="flex items-center gap-6 py-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile preview"
            className="h-[100px] w-[100px] rounded-full object-cover border-2 border-border"
          />
        ) : (
          <AvatarIcon
            firstName={user?.firstName ?? ''}
            lastName={user?.lastName ?? ''}
            size={100}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            leadingIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose photo
          </Button>
          <input
            ref={fileInputRef}
            id="profile-photo-input"
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={handleFileChange}
          />
          <p className="text-small text-muted">JPG or PNG, max 5 MB.</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-small text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button type="button" variant="ghost" size="md" leadingIcon={<ArrowLeft />} onClick={() => navigate({ to: '/register/about' })}>Back</Button>
        <Button type="submit" variant="primary" size="md" loading={submitting} trailingIcon={<ArrowRight />}>
          Finish
        </Button>
      </div>
    </form>
  )
}