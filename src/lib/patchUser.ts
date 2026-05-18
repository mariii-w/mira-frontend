import { useAuthStore } from '../stores/auth'
import { authFetch } from './queryClient'

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

export interface UploadPhotoError {
  field: 'server' | 'file'
  message: string
}

export async function patchUser(payload: PatchUserPayload): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user) {
    throw { field: 'server', message: 'Not logged in.' } satisfies RegisterPatchError
  }

  const res = await authFetch(`/v1/users/${user.userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    if (res.status === 409) {
      throw {
        field: 'username',
        message: 'That username is already taken. Try another one.',
      } satisfies RegisterPatchError
    }
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
  useAuthStore.getState().setUser(updated)
}

export async function uploadProfilePhoto(file: File): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user) {
    throw { field: 'server', message: 'Not logged in.' } satisfies UploadPhotoError
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await authFetch(`/v1/users/${user.userId}/profile-picture`, {
    method: 'PUT',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const detail: string | undefined = body?.detail

    if (res.status === 413) {
      throw { field: 'file', message: detail ?? 'Image is too large. Max 5 MB.' } satisfies UploadPhotoError
    }
    if (res.status === 415) {
      throw { field: 'file', message: detail ?? 'Unsupported image format. Use JPEG or PNG.' } satisfies UploadPhotoError
    }
    if (res.status === 422) {
      throw { field: 'file', message: detail ?? 'Image dimensions are too small. Min 200×200 pixels.' } satisfies UploadPhotoError
    }
    throw { field: 'server', message: detail ?? `Upload failed (${res.status}).` } satisfies UploadPhotoError
  }

  const refresh = await authFetch(`/v1/users/${user.userId}`)
  if (refresh.ok) {
    const updatedUser = await refresh.json()
    useAuthStore.getState().setUser(updatedUser)
  }
}