import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getPrivateUserProfile, getGetAuthLoginGoogleUrl } from "../api/mira";
import { LoginCallback } from "../features/auth/LoginCallback";
import {
  decodeJwtPayload,
  get_access_token,
  useAuthStore,
  type User,
} from "../stores/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: LoginRoute,
});

interface JwtClaims {
  sub: string;
  user_id: string;
  scp?: string[];
}

async function completeLogin(): Promise<User | null> {
  const accessToken = await get_access_token(true);
  if (!accessToken) return null;

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

  const userResponse = await getPrivateUserProfile(claims.user_id);

  if (userResponse.status !== 200) {
    useAuthStore.getState().clear();
    return null;
  }

  useAuthStore.getState().setUser(userResponse.data);
  return userResponse.data;
}

// eslint-disable-next-line react-refresh/only-export-components
function LoginRoute() {
  const navigate = useNavigate();
  const { error } = Route.useSearch();

  useEffect(() => {
    if (error) return;

    completeLogin().then((user) => {
      if (!user) {
        navigate({ to: "/" });
        return;
      }
      if (user && !user.registrationComplete) {
        navigate({ to: "/register" });
      } else {
        navigate({ to: "/" });
      }
    });
  }, [error, navigate]);

  return <LoginCallback error={error} retryHref={getGetAuthLoginGoogleUrl()} />;
}
