import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/name')({
  component: RegisterName,
})

export function validateName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Required.'
  if (v.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöü](?:[^0-9]*[^0-9\s])?$/.test(v)) {
    return 'No digits. Must not start or end with a space.'
  }
  return null
}

export function validateUsername(value: string): string | null {
  if (!value) return 'Required.'
  if (value.length < 3) return 'Minimum 3 characters.'
  if (value.length > 50) return 'Maximum 50 characters.'
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Only lowercase letters, digits, and underscores.'
  }
  return null
}

function RegisterName() {
  return <p className="text-muted">Coming next…</p>
}