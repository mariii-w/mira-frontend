import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '../../components/Navbar'

export const Route = createFileRoute('/register')({
  component: RegisterLayout,
})

// eslint-disable-next-line react-refresh/only-export-components
function RegisterLayout() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-sm bg-surface p-8">
          <Outlet />
        </div>
      </main>
    </>
  )
}