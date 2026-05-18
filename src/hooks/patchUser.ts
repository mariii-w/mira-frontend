import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'

export type UserType = 'CUSTOMER' | 'PROVIDER'
export type AccessibilityPreference = 'EASY_LANGUAGE' | 'REDUCED_MOTION'

export interface PatchAddressPayload {
  street: string
  houseNumber: string
  city: string
  postalCode: string
}

export interface PatchUserPayload {
  username?: string
  firstName?: string
  lastName?: string
  userType?: UserType
  privateAddress?: PatchAddressPayload
  bio?: string
  selfSummary?: string
  isPublic?: boolean
  accessibilityPreferences?: AccessibilityPreference[]
}

export interface RegisterPatchError {
  field: 'server' | 'username'
  message: string
}

export interface UseRegisterPatchResult {
  patch: (payload: PatchUserPayload) => Promise<boolean>
}

export function useRegisterPatch(): UseRegisterPatchResult {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  async function patch(payload: PatchUserPayload): Promise<boolean> {
    if (!user) {
      throw { field: 'server', message: 'Not logged in.' } satisfies RegisterPatchError
    }

    const res = await authFetch(`/v1/users/${user.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // 409 = username already taken
      if (res.status === 409) {
        throw {
          field: 'username',
          message: 'That username is already taken. Try another one.',
        } satisfies RegisterPatchError
      }

      // 400 = validation failure (backend ConstraintViolationException)
      if (res.status === 400) {
        const body = await res.json().catch(() => null)
        throw {
          field: 'server',
          message: body?.detail ?? 'Some fields are invalid. Please check your input.',
        } satisfies RegisterPatchError
      }

      throw {
        field: 'server',
        message: `Unexpected error (${res.status}). Please try again.`,
      } satisfies RegisterPatchError
    }

    const updated = await res.json()
    setUser(updated)
    return true
  }

  return { patch }
}