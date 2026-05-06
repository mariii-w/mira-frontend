import { createFileRoute, Link } from '@tanstack/react-router'
/* eslint-disable react-refresh/only-export-components */

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="p-6 min-h-dvh bg-background">
      <h1>Mira landing page</h1>
      <p className="text-muted">Coming soon..</p>
      <p className="mt-4">
        <Link to="/styleguide" className="underline">→ View styleguide</Link>
      </p>
    </main>
  )
}