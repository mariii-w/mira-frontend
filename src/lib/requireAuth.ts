import { redirect } from "@tanstack/react-router";
import { ensureAuthInitialized, useAuthStore } from "../stores/auth";

// Use as a route's `beforeLoad`. Waits for auth to settle, then
// redirects anonymous visitors to /login.
export async function requireAuth() {
  if (!useAuthStore.getState().user) {
    await ensureAuthInitialized();
  }

  if (!useAuthStore.getState().user) {
    throw redirect({ to: "/login", search: { error: undefined } });
  }
}
