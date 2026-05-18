import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Label } from '../../components/Label'
import { useAuthStore } from '../../stores/auth'
import { patchUser, type RegisterPatchError } from '../../lib/patchUser'

export const Route = createFileRoute('/register/name')({
  component: RegisterName,
})

function validateName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Required.'
  if (v.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöü](?:[^0-9]*[^0-9\s])?$/.test(v)) {
    return 'No digits. Must not start or end with a space.'
  }
  return null
}

function validateUsername(value: string): string | null {
  if (!value) return 'Required.'
  if (value.length < 3) return 'Minimum 3 characters.'
  if (value.length > 50) return 'Maximum 50 characters.'
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Only lowercase letters, digits, and underscores.'
  }
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterName() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [username, setUsername] = useState(user?.username ?? '')

  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const fnErr = validateName(firstName)
    const lnErr = validateName(lastName)
    const unErr = validateUsername(username)

    setFirstNameError(fnErr)
    setLastNameError(lnErr)
    setUsernameError(unErr)

    if (fnErr || lnErr || unErr) return

    setSubmitting(true)
    try {
      await patchUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username,
      })
      navigate({ to: '/register/address' })
    } catch (e) {
      const err = e as RegisterPatchError
      if (err.field === 'username') {
        setUsernameError(err.message)
      } else {
        setUsernameError(err.message)
      }
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <header className="flex flex-col gap-2">
        <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
          What should we call you?
        </h2>
        <p className="text-small text-muted">
          Your name appears on bookings. Your username is your handle on Mira.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName" required>First Name</Label>
          <Input
            id="firstName"
            size="sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setFirstNameError(validateName(firstName))}
            autoComplete="given-name"
            error={firstNameError}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName" required>Last Name</Label>
          <Input
            id="lastName"
            size="sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setLastNameError(validateName(lastName))}
            autoComplete="family-name"
            error={lastNameError}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username" required>Username</Label>
        <Input
          id="username"
          size="sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setUsernameError(validateUsername(username))}
          autoComplete="username"
          error={usernameError}
        />
        {!usernameError && (
          <p className="text-small text-muted">
            Lowercase letters, numbers and underscores. 3–50 characters.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          leadingIcon={<ArrowLeft />}
          onClick={() => navigate({ to: '/register/role' })}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting}
          trailingIcon={<ArrowRight />}
        >
          Continue
        </Button>
      </div>
    </form>
  )
}