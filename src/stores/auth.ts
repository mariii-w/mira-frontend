import { create } from 'zustand'

export type UserType = 'CUSTOMER' | 'PROVIDER'
export type AccessibilityPreference = 'EASY_LANGUAGE' | 'READING_MODE' | 'REDUCED_MOTION'

export interface PrivateAddress {
  street: string
  houseNumber: string
  city: string
  postalCode: string
}

export interface ProfileMedia {
  mediaId: string
  url: string
}

export interface User {
  userId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  userType: UserType | null
  bio: string | null
  simplifiedBio: string | null
  selfSummary: string | null
  accessibilityPreferences: AccessibilityPreference[]
  profileMedia: ProfileMedia | null
  registrationComplete: boolean
  isPublic: boolean
  privateAddress: PrivateAddress | null
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

export function decodeJwtPayload<T = unknown>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded)) as T
  } catch {
    return null
  }
}

const API_BASE = 'http://127.0.0.1:8080'

interface JwtClaims {
  sub: string
  permissions?: string[]
  exp?: number
  iat?: number
}

interface AccountResponse {
  accountId: string
  userId: string
  authProviders: string[]
}

export async function exchangeRefreshForAccess(): Promise<boolean> {
  const res = await fetch('http://127.0.0.1:8080/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    useAuthStore.getState().setAuth(null, null)
    return false
  }
  const { accessToken, user } = await res.json()
  useAuthStore.getState().setAuth(accessToken, user)
  return true
}

export async function logout(): Promise<void> {
  await fetch('http://127.0.0.1:8080/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  useAuthStore.getState().setAuth(null, null)
}