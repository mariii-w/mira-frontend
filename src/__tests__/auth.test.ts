import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrivateUserProfileResponse } from "../api/model";
import {
  getPrivateUserProfile,
  postAuthLogout,
  postAuthRefresh,
} from "../api/mira";
import {
  exchangeRefreshForAccess,
  get_access_token,
  logout,
  useAuthStore,
} from "../stores/auth";

vi.mock("../api/mira", () => ({
  getPrivateUserProfile: vi.fn(),
  postAuthLogout: vi.fn(),
  postAuthRefresh: vi.fn(),
}));

const mockedPostAuthRefresh = vi.mocked(postAuthRefresh);
const mockedGetPrivateUserProfile = vi.mocked(getPrivateUserProfile);
const mockedPostAuthLogout = vi.mocked(postAuthLogout);

function makeJwt(claims: Record<string, unknown>) {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

function makeUser(userId: string): PrivateUserProfileResponse {
  return {
    userId,
    username: null,
    firstName: null,
    lastName: null,
    userType: null,
    bio: null,
    simplifiedBio: null,
    selfSummary: null,
    accessibilityPreferences: [],
    profileMedia: null,
    registrationComplete: false,
    isPublic: false,
    privateAddress: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
});

describe("auth store", () => {
  it("refreshes the access token through Orval", async () => {
    const token = makeJwt({
      sub: "account-1",
      user_id: "user-1",
      scp: ["profile:read"],
    });
    mockedPostAuthRefresh.mockResolvedValue({
      data: { accessToken: token },
      status: 200,
      headers: new Headers(),
    });

    await expect(get_access_token(true)).resolves.toBe(token);

    expect(mockedPostAuthRefresh).toHaveBeenCalledWith({
      credentials: "include",
    });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: token,
      accountId: "account-1",
      permissions: ["profile:read"],
    });
  });

  it("loads the private profile through Orval after refreshing", async () => {
    const token = makeJwt({ sub: "account-1", user_id: "user-1" });
    const user = makeUser("user-1");
    mockedPostAuthRefresh.mockResolvedValue({
      data: { accessToken: token },
      status: 200,
      headers: new Headers(),
    });
    mockedGetPrivateUserProfile.mockResolvedValue({
      data: user,
      status: 200,
      headers: new Headers(),
    });

    await expect(exchangeRefreshForAccess()).resolves.toBe(true);

    expect(mockedGetPrivateUserProfile).toHaveBeenCalledWith("user-1");
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("logs out through Orval and clears local auth state", async () => {
    const token = makeJwt({ sub: "account-1", user_id: "user-1" });
    useAuthStore.getState().setToken({
      accessToken: token,
      accountId: "account-1",
      permissions: [],
    });
    mockedPostAuthLogout.mockResolvedValue({
      data: undefined,
      status: 204,
      headers: new Headers(),
    });

    await logout();

    expect(mockedPostAuthLogout).toHaveBeenCalledWith({
      credentials: "include",
    });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      accountId: null,
      permissions: [],
      user: null,
    });
  });
});
