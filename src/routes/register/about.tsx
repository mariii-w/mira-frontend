import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Label } from '../../components/Label'
import { Textarea } from '../../components/Textarea'
import { useAuthStore } from '../../stores/auth'
import { patchUser, type PatchUserPayload, type RegisterPatchError } from '../../lib/patchUser'

export const Route = createFileRoute('/register/about')({
  component: RegisterAbout,
})

function validateBio(value: string): string | null {
  if (value.length > 2000) return 'Maximum 2000 characters.'
  return null
}

function validateTagline(value: string, required: boolean): string | null {
  if (required && !value.trim()) return 'Required.'
  if (value.length > 100) return 'Maximum 100 characters.'
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterAbout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isProvider = user?.userType === 'PROVIDER'

  const [tagline, setTagline] = useState(user?.selfSummary ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')

  const [taglineError, setTaglineError] = useState<string | null>(null)
  const [bioError, setBioError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const tErr = validateTagline(tagline, isProvider)
    const bErr = validateBio(bio)
    setTaglineError(tErr)
    setBioError(bErr)
    if (tErr || bErr) return

    setSubmitting(true)
    setServerError(null)

    const payload: PatchUserPayload = {}
    if (bio.trim()) payload.bio = bio.trim()
    if (isProvider && tagline.trim()) payload.selfSummary = tagline.trim()

    try {
      if (Object.keys(payload).length > 0) {
        await patchUser(payload)
      }
      navigate({ to: '/register/photo' })
    } catch (e) {
      setServerError((e as RegisterPatchError).message)
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <header className="flex flex-col gap-2">
        <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
          {isProvider ? 'Tell us about yourself' : 'A bit about you'}
        </h2>
        <p className="text-small text-muted">
          {isProvider
            ? "Customers will read this when deciding to book. Be friendly and clear about what you offer."
            : "This helps providers understand what kind of help you're looking for. You can keep it short."}
        </p>
      </header>

      {isProvider && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tagline" required>Short tagline</Label>
          <Input
            id="tagline"
            size="sm"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            onBlur={() => setTaglineError(validateTagline(tagline, true))}
            maxLength={100}
            placeholder="Patient PC help for senior"
            error={taglineError}
          />
          <p className="text-small text-muted">
            A one-liner that appears next to your name in search.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => setBioError(validateBio(bio))}
          maxLength={2000}
          rows={6}
          placeholder={isProvider
            ? "I've been helping friends and neighbours with their computers for over 10 years…"
            : "Looking for friendly, patient help with my MacBook and iPhone. I'm 68 and not very tech-confident, so kind explanations go a long way."}
          error={bioError}
        />
        <p className="text-small text-muted">
          This appears on your profile page so {isProvider ? 'customers' : 'providers'} know what to expect.
        </p>
      </div>

      {serverError && (
        <p role="alert" className="text-small text-red-600">{serverError}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button type="button" variant="ghost" size="md" leadingIcon={<ArrowLeft />} onClick={() => navigate({ to: '/register/address' })}>Back</Button>
        <Button type="submit" variant="primary" size="md" loading={submitting} trailingIcon={<ArrowRight />}>Continue</Button>
      </div>
    </form>
  )
}