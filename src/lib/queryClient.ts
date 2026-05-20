import { QueryClient } from '@tanstack/react-query'
import { useAuthStore, exchangeRefreshForAccess } from '../stores/auth'

export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().accessToken
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res = await fetch(input, { ...init, headers, credentials: 'include' })

  if (res.status === 401) {
    const refreshed = await exchangeRefreshForAccess()
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken
      if (newToken) headers.set('Authorization', `Bearer ${newToken}`)
      res = await fetch(input, { ...init, headers, credentials: 'include' })
    }
  }

  return res
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})