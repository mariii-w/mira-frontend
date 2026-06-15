import { get_access_token } from "../stores/auth";

export type FetchResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

function isRefreshRequest(input: RequestInfo | URL): boolean {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname
        : input.url;

  const pathname = new URL(url, window.location.origin).pathname;
  return pathname === "/auth/refresh" || pathname === "/v1/auth/refresh";
}

function hasAuthorization(headers?: HeadersInit): boolean {
  return new Headers(headers).has("Authorization");
}

function addAuthorizationHeader(
  headers: HeadersInit | undefined,
  token: string,
): HeadersInit {
  if (headers instanceof Headers) {
    const nextHeaders = new Headers(headers);
    nextHeaders.set("Authorization", `Bearer ${token}`);
    return nextHeaders;
  }

  if (Array.isArray(headers)) {
    return [...headers, ["Authorization", `Bearer ${token}`]];
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

async function getRequestInit(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<RequestInit | undefined> {
  if (isRefreshRequest(input)) return init;

  const token = await get_access_token();
  if (!token) return init;

  if (hasAuthorization(init?.headers)) return init;

  return {
    ...init,
    headers: addAuthorizationHeader(init?.headers, token),
  };
}

export async function authFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const requestInit = await getRequestInit(input, init);
  const res = await fetch(input, requestInit);
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  return { data, status: res.status, headers: res.headers } as T;
}
