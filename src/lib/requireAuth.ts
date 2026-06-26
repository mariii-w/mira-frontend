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

// Provider-only routes (listing management, credentials). Sends other
// logged-in users home instead of to login.
export async function requireProvider() {
  await requireAuth();

  if (useAuthStore.getState().user?.userType !== "PROVIDER") {
    throw redirect({ to: "/" });
  }
}

// Consumer-only routes (booking). Providers can view listings but not book.
export async function requireConsumer() {
  await requireAuth();

  if (useAuthStore.getState().user?.userType !== "CUSTOMER") {
    throw redirect({ to: "/" });
  }
}
