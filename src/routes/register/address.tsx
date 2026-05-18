import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/address')({
  component: AddressStub,
})

function AddressStub() {
  return <p className="text-muted">Coming next…</p>
}