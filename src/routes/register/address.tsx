import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Label } from '../../components/Label'
import { useAuthStore } from '../../stores/auth'
import { patchUser, type RegisterPatchError } from '../../lib/patchUser'

export const Route = createFileRoute('/register/address')({
  component: RegisterAddress,
})

function validateStreet(value: string): string | null {
  if (!value.trim()) return 'Required.'
  if (value.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöüß\s\-]+$/.test(value.trim())) {
    return 'No digits or special characters.'
  }
  return null
}

function validateHouseNumber(value: string): string | null {
  if (!value.trim()) return 'Required.'
  if (value.length > 10) return 'Maximum 10 characters.'
  if (!/^[0-9]+[a-zA-Z]?$/.test(value.trim())) {
    return 'Must be a number, optionally followed by a letter (e.g. 43a).'
  }
  return null
}

function validatePostalCode(value: string): string | null {
  if (!value) return 'Required.'
  if (!/^[0-9]{5}$/.test(value)) return 'Must be exactly 5 digits.'
  return null
}

function validateCity(value: string): string | null {
  if (!value.trim()) return 'Required.'
  if (value.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöüß\s\-]+$/.test(value.trim())) {
    return 'No digits or special characters.'
  }
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterAddress() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [street, setStreet] = useState(user?.privateAddress?.street ?? '')
  const [houseNumber, setHouseNumber] = useState(user?.privateAddress?.houseNumber ?? '')
  const [postalCode, setPostalCode] = useState(user?.privateAddress?.postalCode ?? '')
  const [city, setCity] = useState(user?.privateAddress?.city ?? '')

  const [streetError, setStreetError] = useState<string | null>(null)
  const [houseNumberError, setHouseNumberError] = useState<string | null>(null)
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const sErr = validateStreet(street)
    const hErr = validateHouseNumber(houseNumber)
    const pErr = validatePostalCode(postalCode)
    const cErr = validateCity(city)

    setStreetError(sErr)
    setHouseNumberError(hErr)
    setPostalCodeError(pErr)
    setCityError(cErr)

    if (sErr || hErr || pErr || cErr) return

    setSubmitting(true)
    setServerError(null)
    try {
      await patchUser({
        privateAddress: {
          street: street.trim(),
          houseNumber: houseNumber.trim(),
          postalCode,
          city: city.trim(),
        },
      })
      navigate({ to: '/register/about' })
    } catch (e) {
      setServerError((e as RegisterPatchError).message)
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <header className="flex flex-col gap-2">
        <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
          Where are you based?
        </h2>
        <p className="text-small text-muted">
          We use this to match you with nearby providers. Your exact address is only shared on confirmed bookings.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="street" required>Street</Label>
          <Input
            id="street"
            size="sm"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            onBlur={() => setStreetError(validateStreet(street))}
            autoComplete="address-line1"
            error={streetError}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="houseNumber" required>House Number</Label>
          <Input
            id="houseNumber"
            size="sm"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            onBlur={() => setHouseNumberError(validateHouseNumber(houseNumber))}
            error={houseNumberError}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postalCode" required>Postal Code</Label>
          <Input
            id="postalCode"
            size="sm"
            inputMode="numeric"
            maxLength={5}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
            onBlur={() => setPostalCodeError(validatePostalCode(postalCode))}
            autoComplete="postal-code"
            error={postalCodeError}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city" required>City</Label>
          <Input
            id="city"
            size="sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => setCityError(validateCity(city))}
            autoComplete="address-level2"
            error={cityError}
          />
        </div>
      </div>

      {serverError && (
        <p role="alert" className="text-small text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          leadingIcon={<ArrowLeft />}
          onClick={() => navigate({ to: '/register/name' })}
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