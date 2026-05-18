import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'

export const Route = createFileRoute('/register')({
  component: Register,
})

// eslint-disable-next-line react-refresh/only-export-components
function Register() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
        <h1 className="font-heading text-4xl font-bold text-foreground" aria-live="polite">
          Building…
        </h1>
      </main>
    </>
  )
}