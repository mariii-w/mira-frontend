import { authFetch } from './queryClient'
import type { User } from '../stores/auth'

export interface FetchUserError {
  field: 'server' | 'username'
  message: string
}

export async function fetchUser(id: string): Promise<User> {
  const res = await authFetch(`/v1/users/${id}`)

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

export async function fetchPublicUser(id: string): Promise<User> {
  const res = await authFetch(`/v1/public-profiles/${id}`)

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
