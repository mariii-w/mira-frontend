import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { exchangeRefreshForAccess, useAuthStore } from '../stores/auth'

function shouldSkipRegistrationGuard(pathname: string): boolean {
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
    if (user.registrationComplete) return
    if (shouldSkipRegistrationGuard(location.pathname)) return
    navigate({ to: '/register' })
  }, [user, location.pathname, navigate])

  return <Outlet />
}

export const Route = createRootRoute({
  component: RootComponent,
})