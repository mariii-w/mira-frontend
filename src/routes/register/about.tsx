import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/about')({
  component: AboutStub,
})

function AboutStub() {
  return <p className="text-muted">Soon</p>
}