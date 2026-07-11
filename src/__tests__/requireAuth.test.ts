import { afterEach, describe, expect, it, vi } from "vitest";
import { requireAuth, requireConsumer, requireProvider } from "../lib/requireAuth";
import { ensureAuthInitialized, useAuthStore } from "../stores/auth";
import type { PrivateUserProfileResponse } from "../api/model";
import { UserType } from "../api/model";

vi.mock("../stores/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../stores/auth")>();
  return {
    ...actual,
    ensureAuthInitialized: vi.fn(),
  };
});

vi.mock("@tanstack/react-router", () => ({
  redirect: vi.fn((opts: Record<string, unknown>) => ({ isRedirect: true, ...opts })),
}));

const mockedEnsureAuthInitialized = vi.mocked(ensureAuthInitialized);

function makeUser(
  overrides: Partial<PrivateUserProfileResponse> = {},
): PrivateUserProfileResponse {
  return {
    userId: "user-1",
    username: "mira",
    firstName: "Mira",
    lastName: "Muster",
    userType: UserType.PROVIDER,
    bio: null,
    simplifiedBio: null,
    selfSummary: null,
    accessibilityPreferences: [],
    profileMedia: null,
    registrationComplete: true,
    isPublic: true,
    privateAddress: null,
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
});

describe("requireAuth", () => {
  it("does nothing when a user is already loaded", async () => {
    useAuthStore.getState().setUser(makeUser());

    await expect(requireAuth()).resolves.toBeUndefined();
    expect(mockedEnsureAuthInitialized).not.toHaveBeenCalled();
  });

  it("waits for auth init and lets the request through once a user is set", async () => {
    mockedEnsureAuthInitialized.mockImplementation(async () => {
      useAuthStore.getState().setUser(makeUser());
      return true;
    });

    await expect(requireAuth()).resolves.toBeUndefined();
    expect(mockedEnsureAuthInitialized).toHaveBeenCalled();
  });

  it("redirects to /login when no user is found after init", async () => {
    mockedEnsureAuthInitialized.mockResolvedValue(false);

    await expect(requireAuth()).rejects.toMatchObject({ to: "/login" });
  });
});

describe("requireProvider", () => {
  it("lets providers through", async () => {
    useAuthStore.getState().setUser(makeUser({ userType: UserType.PROVIDER }));

    await expect(requireProvider()).resolves.toBeUndefined();
  });

  it("sends non-providers home", async () => {
    useAuthStore.getState().setUser(makeUser({ userType: UserType.CUSTOMER }));

    await expect(requireProvider()).rejects.toMatchObject({ to: "/" });
  });
});

describe("requireConsumer", () => {
  it("lets customers through", async () => {
    useAuthStore.getState().setUser(makeUser({ userType: UserType.CUSTOMER }));

    await expect(requireConsumer()).resolves.toBeUndefined();
  });

  it("sends providers home instead of letting them book", async () => {
    useAuthStore.getState().setUser(makeUser({ userType: UserType.PROVIDER }));

    await expect(requireConsumer()).rejects.toMatchObject({ to: "/" });
  });
});
