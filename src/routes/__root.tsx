import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { exchangeRefreshForAccess, useAuthStore } from '../stores/auth'

const REGISTRATION_STEP_PATHS = [
  '/register',
  '/register/role',
  '/register/name',
  '/register/address',
  '/register/about',
  '/register/photo',
] as const

function isRegistrationStep(pathname: string): boolean {
  return (REGISTRATION_STEP_PATHS as readonly string[]).includes(pathname)
}

function shouldSkipUnregisteredGuard(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register' || pathname.startsWith('/register/')
}

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    exchangeRefreshForAccess()
  }, [])

  useEffect(() => {
    if (!user) return

    if (user.registrationComplete) {
      // TEMP (testing): registered users may revisit registration steps.
      if (isRegistrationStep(location.pathname)) {
      navigate({ to: '/' })
      }
      return
    }

    if (shouldSkipUnregisteredGuard(location.pathname)) return
    navigate({ to: '/register' })
  }, [user, location.pathname, navigate])

  return <Outlet />
}

export const Route = createRootRoute({
  component: RootComponent,
})