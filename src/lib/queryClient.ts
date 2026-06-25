import { QueryClient } from "@tanstack/react-query";
import { get_access_token } from "../stores/auth";

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = await get_access_token();
  const headers = new Headers(init.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers, credentials: "include" });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
