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
  // 1. Exchange refresh cookie for access token
  const refreshRes = await fetch(`${API_BASE}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!refreshRes.ok) {
    useAuthStore.getState().clear()
    return false
  }
  const { accessToken } = await refreshRes.json()

  // 2. Decode JWT to get accountId + permissions
  const claims = decodeJwtPayload<JwtClaims>(accessToken)
  if (!claims?.sub) {
    useAuthStore.getState().clear()
    return false
  }
  useAuthStore.getState().setToken({
    accessToken,
    accountId: claims.sub,
    permissions: claims.permissions ?? [],
  })

  // 3. Get userId from accountId
  const accountRes = await fetch(`${API_BASE}/v1/accounts/${claims.sub}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!accountRes.ok) return false
  const { userId } = (await accountRes.json()) as AccountResponse

  // 4. Fetch full user profile
  const userRes = await fetch(`${API_BASE}/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!userRes.ok) return false
  const user = (await userRes.json()) as User
  useAuthStore.getState().setUser(user)

  return true
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  useAuthStore.getState().clear()
}