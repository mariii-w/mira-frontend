/* Drop-in redirect for users who land on /register with no sub-step in the URL
(e.g. closed the tab mid-flow, then navigated back). Picks the first missing
field in the canonical step order: role → name → address → about → photo.
*/

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore, type User } from '../../stores/auth'

export const Route = createFileRoute('/register/')({
  component: RegisterIndex,
})

function nextIncompleteStep(user: User | null): string {
  if (!user) return '/register/role'
  if (!user.userType) return '/register/role'
  if (!user.firstName || !user.lastName || !user.username) return '/register/name'
  if (!user.privateAddress) return '/register/address'
  if (!user.bio) return '/register/about'
  if (!user.profileMedia) return '/register/photo'
  return '/register/done'
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterIndex() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    navigate({ to: nextIncompleteStep(user), replace: true })
  }, [user, navigate])

  return null
}