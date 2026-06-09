import { authFetch } from './queryClient'
import type { User } from '../stores/auth'
import { create } from 'zustand'

export type UserType = 'CUSTOMER' | 'PROVIDER'
export type AccessibilityPreference = 'EASY_LANGUAGE' | 'REDUCED_MOTION'

export interface FetchAddressPayload {
  street: string
  houseNumber: string
  city: string
  postalCode: string
}

export interface FetchUserPayload {
  username?: string
  firstName?: string
  lastName?: string
  userType?: UserType
  privateAddress?: FetchAddressPayload
  bio?: string
  selfSummary?: string
  isPublic?: boolean
  accessibilityPreferences?: AccessibilityPreference[]
}

export interface FetchUserError {
  field: 'server' | 'username'
  message: string
}

export interface UploadPhotoError {
  field: 'server' | 'file'
  message: string
}

interface AuthState {
  accessToken: string | null
  accountId: string | null
  permissions: string[]
  user: User | null
  setToken: (data: { accessToken: string; accountId: string; permissions: string[] }) => void
  setUser: (user: User | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  accountId: null,
  permissions: [],
  user: null,
  setToken: ({ accessToken, accountId, permissions }) =>
    set({ accessToken, accountId, permissions }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, accountId: null, permissions: [], user: null }),
}))

const API_BASE ='http://localhost:8081'

export async function fetchUser(id: string): Promise<User> {
  const token = useAuthStore.getState().accessToken
  
  const res = await authFetch(`${API_BASE}/v1/users/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)

    if (res.status === 404) {
      throw { field: 'server', message: 'User not found.' } satisfies FetchUserError
    }

    throw {
      field: 'server',
      message: body?.detail ?? `Unexpected error (${res.status}). Please try again.`,
    } satisfies FetchUserError
  }

  return res.json() as Promise<User>
}
