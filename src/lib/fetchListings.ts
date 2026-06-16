import { authFetch } from './queryClient'

export interface Tag {
  tagId: string
  name: string
  isBarrierefrei: boolean
  isActive: boolean
}

export interface Author {
  name: string
  surname: string
}

export interface Location {
  city: string
  postalCode: string
  serviceRadiusKm: number
}

export interface PrimaryMedia {
  mediaId: string
  url: string
  altText: string
}

export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ModerationStatus = 'VISIBLE' | 'HIDDEN' | 'PENDING'

export interface Listing {
  listingId: string
  tags: Tag[]
  title: string
  description: string
  price: number
  publicationStatus: PublicationStatus
  moderationStatus: ModerationStatus
  author: Author
  publishedAt: string | null
  location: Location
  primaryMedia: PrimaryMedia | null
}

export interface Cursor {
  limit: number
  next: string | null
}

export interface ListingsResponse {
  items: Listing[]
  cursor: Cursor
}

export interface FetchUserError {
  field: 'server' | 'username'
  message: string
}

export async function fetchUserPrivateListings(id: string): Promise<ListingsResponse> {
  const res = await authFetch(`/v1/users/${id}/listings`)

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

  return res.json() as Promise<ListingsResponse>
}

export async function fetchUserPublicListings(id: string): Promise<ListingsResponse> {
  const res = await authFetch(`/v1/public-profiles/${id}/listings`)

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

  return res.json() as Promise<ListingsResponse>
}

