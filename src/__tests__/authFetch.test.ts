import { afterEach, describe, expect, it, vi } from "vitest";
import { authFetch } from "../lib/authFetch";
import { get_access_token } from "../stores/auth";

vi.mock("../stores/auth", () => ({
  get_access_token: vi.fn(),
}));

const mockedGetAccessToken = vi.mocked(get_access_token);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("authFetch", () => {
  it("does not request an access token for generated refresh requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ accessToken: "token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await authFetch("http://localhost:8081/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    expect(mockedGetAccessToken).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8081/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
  });
});
