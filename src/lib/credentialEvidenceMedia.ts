import { getGetCredentialEvidenceMediaContentUrl } from "../api/mira";
import { getRequestInit } from "./authFetch";

/**
 * Fetches the private evidence image for a credential and returns a local
 * object URL. This endpoint requires bearer auth (unlike public listing
 * media, which is unauthenticated and just loaded via `mediaUrl()`), and it
 * streams binary image bytes rather than JSON, so it can't go through the
 * generated `authFetch` mutator as-is. Reuses `authFetch`'s own
 * token-attachment logic instead of duplicating it.
 */
export async function fetchCredentialEvidenceMediaUrl(
  userId: string,
  credentialId: string,
): Promise<string> {
  const url = getGetCredentialEvidenceMediaContentUrl(userId, credentialId);
  const requestInit = await getRequestInit(url);

  const res = await fetch(url, requestInit);
  if (!res.ok) {
    throw new Error("Failed to load document.");
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
