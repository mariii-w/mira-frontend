import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ensureAuthInitialized, useAuthStore } from '../stores/auth'

// Steps that should redirect to "/" once registration is complete.
// about/photo/done stay excluded so the flow can still show them.
const REQUIRED_REGISTRATION_STEP_PATHS = [
  '/register',
  '/register/role',
  '/register/name',
  '/register/address',
] as const

function isRequiredRegistrationStep(pathname: string): boolean {
  return (REQUIRED_REGISTRATION_STEP_PATHS as readonly string[]).includes(pathname)
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
    ensureAuthInitialized()
  }, [])

  useEffect(() => {
    if (!user) return

    if (user.registrationComplete) {
      // Only bounce from required steps — let about/photo/done stay reachable.
      if (isRequiredRegistrationStep(location.pathname)) {
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