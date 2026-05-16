
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { exchangeRefreshForAccess, useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/login')({
  component: LoginCallback,
})

// eslint-disable-next-line react-refresh/only-export-components
function LoginCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    exchangeRefreshForAccess().then((loggedIn) => {
      if (!loggedIn) {
        navigate({ to: '/' })
        return
      }
      const user = useAuthStore.getState().user
      if (user && !user.registrationComplete) {
        navigate({ to: '/register' })
      } else {
        navigate({ to: '/' })
      }
    })
  }, [])

  return null
}