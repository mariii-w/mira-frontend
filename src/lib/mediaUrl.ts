// Origin of the Mira API. Media `url` fields come back as relative paths
// (e.g. "/v1/listing-media/{mediaId}/content"), so they must be resolved
// against the API origin rather than the frontend's. Kept in sync with the
// base URL used by the generated client in src/api/mira.ts.
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

/**
 * Resolves a media `url` returned by the API into a browser-loadable URL.
 * Relative API paths are prefixed with the API origin; absolute URLs
 * (should the backend ever return CDN links) are passed through unchanged.
 */
export function mediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}
