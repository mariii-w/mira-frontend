import { create } from "zustand";
import {
  getPrivateUserProfile,
  postAuthLogout,
  postAuthRefresh,
} from "../api/mira";
import type { PrivateUserProfileResponse } from "../api/model";

export type User = PrivateUserProfileResponse;

interface AuthState {
  accessToken: string | null;
  accountId: string | null;
  permissions: string[];
  user: User | null;
  setToken: (data: {
    accessToken: string;
    accountId: string;
    permissions: string[];
  }) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  accountId: null,
  permissions: [],
  user: null,
  setToken: ({ accessToken, accountId, permissions }) =>
    set({ accessToken, accountId, permissions }),
  setUser: (user) => set({ user }),
  clear: () =>
    set({ accessToken: null, accountId: null, permissions: [], user: null }),
}));

export function decodeJwtPayload<T = unknown>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as T;
  } catch {
    return null;
  }
}

interface JwtClaims {
  sub: string;
  user_id: string;
  scp?: string[];
  type?: string;
  exp?: number;
  iat?: number;
}

let accessTokenRequest: Promise<string | null> | null = null;

//TODO: add cookie check
function isAccessTokenUsable(token: string | null): boolean {
  if (!token) return false;

  const claims = decodeJwtPayload<JwtClaims>(token);
  if (!claims?.exp) return true;

  const expiresAtMs = claims.exp * 1000;
  const refreshSkewMs = 30_000;
  return expiresAtMs - refreshSkewMs > Date.now();
}

export async function get_access_token(
  forceRefresh = false,
): Promise<string | null> {
  const cachedToken = useAuthStore.getState().accessToken;
  if (!forceRefresh && isAccessTokenUsable(cachedToken)) return cachedToken;

  if (!accessTokenRequest) {
    accessTokenRequest = postAuthRefresh({
      credentials: "include",
    })
      .then((refreshRes) => {
        if (refreshRes.status !== 200) {
          useAuthStore.getState().clear();
          return null;
        }

        const { accessToken } = refreshRes.data;
        const claims = decodeJwtPayload<JwtClaims>(accessToken);
        if (!claims?.sub || !claims.user_id) {
          useAuthStore.getState().clear();
          return null;
        }

        useAuthStore.getState().setToken({
          accessToken,
          accountId: claims.sub,
          permissions: claims.scp ?? [],
        });

        return accessToken;
      })
      .finally(() => {
        accessTokenRequest = null;
      });
  }

  return accessTokenRequest;
}

export async function exchangeRefreshForAccess(): Promise<boolean> {
  const accessToken = await get_access_token(true);
  if (!accessToken) return false;
  const claims = decodeJwtPayload<JwtClaims>(accessToken);
  if (!claims?.sub || !claims.user_id) {
    useAuthStore.getState().clear();
    return false;
  }
  useAuthStore.getState().setToken({
    accessToken,
    accountId: claims.sub,
    permissions: claims.scp ?? [],
  });

  const userRes = await getPrivateUserProfile(claims.user_id);
  if (userRes.status !== 200) {
    useAuthStore.getState().clear();
    return false;
  }
  useAuthStore.getState().setUser(userRes.data);

  return true;
}

export async function logout(): Promise<void> {
  try {
    await postAuthLogout({ credentials: "include" });
  } finally {
    useAuthStore.getState().clear();
  }
}
