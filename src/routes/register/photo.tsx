import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/photo')({
  component: PhotoStub,
})

function PhotoStub() {
  return <p className="text-muted">Comin</p>
}