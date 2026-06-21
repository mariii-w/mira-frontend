import type { ProfileMedia } from '../stores/auth'

// Appends the mediaId as a cache-busting query param, since the backend serves every photo from the same fixed URL and the browser would otherwise keep showing the old cached image after a new upload.
export function profileMediaUrl(media: ProfileMedia | null | undefined): string | undefined {
  if (!media) return undefined
  return `${media.url}?v=${media.mediaId}`
}
