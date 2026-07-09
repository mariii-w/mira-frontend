import { get_access_token } from "../stores/auth";

export type FetchResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

type CachedGetResponse = {
  etag: string;
  data: unknown;
};

// In-memory only, per page load - not persisted.
const etagCache = new Map<string, CachedGetResponse>();

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function isGetRequest(init?: RequestInit): boolean {
  return (init?.method ?? "GET").toUpperCase() === "GET";
}

function withIfNoneMatch(init: RequestInit | undefined, etag: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("If-None-Match", etag);
  return { ...init, headers };
}

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

export async function getRequestInit(
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
  let requestInit = await getRequestInit(input, init);

  const url = requestUrl(input);
  const isGet = isGetRequest(requestInit);
  const cached = isGet ? etagCache.get(url) : undefined;

  if (cached) {
    requestInit = withIfNoneMatch(requestInit, cached.etag);
  }

  const res = await fetch(input, requestInit);

  // Not modified - reuse the cached data instead of an empty body.
  if (res.status === 304 && cached) {
    return { data: cached.data, status: res.status, headers: res.headers } as T;
  }

  // 412 (If-Match conflict, e.g. schedule PUT) is body-less by design, same as 204/304.
  const noContent = [204, 205, 304, 412].includes(res.status);
  const body = noContent ? null : await res.text();

  if (!noContent && !body) {
    throw new Error(
      `Request to ${url} returned ${res.status} with an empty body`,
    );
  }

  const data = body ? JSON.parse(body) : {};

  if (isGet && res.status === 200) {
    const etag = res.headers.get("ETag");
    if (etag) {
      etagCache.set(url, { etag, data });
    } else {
      etagCache.delete(url);
    }
  }

  return { data, status: res.status, headers: res.headers } as T;
}
