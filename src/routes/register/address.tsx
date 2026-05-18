import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/address')({
  component: AddressStub,
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

function AddressStub() {
  return <p className="text-muted">Coming next…</p>
}