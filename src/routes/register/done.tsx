import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/done')({
  component: DoneStub,
})

function DoneStub() {
  return <p className="text-muted">Coming next</p>
}