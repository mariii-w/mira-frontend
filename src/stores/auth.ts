import { create } from 'zustand'

export type UserType = 'CUSTOMER' | 'PROVIDER'
export type AccessibilityPreference = 'EASY_LANGUAGE' | 'REDUCED_MOTION'

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

const API_BASE = ''

interface JwtClaims {
  sub: string
  user_id: string
  scp?: string[]
  type?: string
  exp?: number
  iat?: number
}


export async function exchangeRefreshForAccess(): Promise<boolean> {
  const refreshRes = await fetch(`${API_BASE}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!refreshRes.ok) {
    useAuthStore.getState().clear()
    return false
  }
  const { accessToken } = await refreshRes.json()

  const claims = decodeJwtPayload<JwtClaims>(accessToken)
  if (!claims?.sub || !claims.user_id) {
    useAuthStore.getState().clear()
    return false
  }
  useAuthStore.getState().setToken({
    accessToken,
    accountId: claims.sub,
    permissions: claims.scp ?? [],
  })

  const userRes = await fetch(`${API_BASE}/v1/users/${claims.user_id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!userRes.ok) {
    useAuthStore.getState().clear()
    return false
  }
  const user = (await userRes.json()) as User
  useAuthStore.getState().setUser(user)

  return true
}

export async function logout(): Promise<void> {
  const token = useAuthStore.getState().accessToken
  try {
    await fetch(`${API_BASE}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  } finally {
    useAuthStore.getState().clear()
  }
}