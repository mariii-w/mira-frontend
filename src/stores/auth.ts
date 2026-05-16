import { create } from 'zustand'

export interface User {
  name: string
  email: string
  emailVerified: boolean
  registrationComplete: boolean
  userType: 'CUSTOMER' | 'PROVIDER'
}

interface AuthState {
  accessToken: string | null
  user: User | null
  setAuth: (accessToken: string | null, user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
}))

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