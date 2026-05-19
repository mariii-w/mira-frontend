import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import { Button } from '../../components/Button'
import { AvatarIcon } from '../../components/AvatarIcon'
import { useAuthStore } from '../../stores/auth'

export const Route = createFileRoute('/register/photo')({
  component: RegisterPhoto,
})

// eslint-disable-next-line react-refresh/only-export-components
function RegisterPhoto() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileMedia?.url ?? null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setPreviewUrl(URL.createObjectURL(picked))
  }

  return (
    <form className="flex flex-col gap-6" noValidate>
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
            className="h-20 w-20 rounded-full object-cover border-2 border-border"
          />
        ) : (
            <AvatarIcon
              firstName={user?.firstName ?? ''}
              lastName={user?.lastName ?? ''}
              picture=""
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

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button type="button" variant="ghost" size="md" leadingIcon={<ArrowLeft />} onClick={() => navigate({ to: '/register/about' })}>Back</Button>
        <Button type="submit" variant="primary" size="md" trailingIcon={<ArrowRight />}>Finish</Button>
      </div>
    </form>
  )
}