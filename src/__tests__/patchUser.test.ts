import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  PrivateUserProfileResponse,
  ProfileMediaResponse,
} from "../api/model";
import {
  getPrivateUserProfile,
  patchUserProfile,
  uploadProfilePicture,
} from "../api/mira";
import { patchUser, uploadProfilePhoto } from "../lib/patchUser";
import { useAuthStore } from "../stores/auth";

vi.mock("../api/mira", () => ({
  getPrivateUserProfile: vi.fn(),
  patchUserProfile: vi.fn(),
  uploadProfilePicture: vi.fn(),
}));

const mockedPatchUserProfile = vi.mocked(patchUserProfile);
const mockedUploadProfilePicture = vi.mocked(uploadProfilePicture);
const mockedGetPrivateUserProfile = vi.mocked(getPrivateUserProfile);

function makeJwt(claims: Record<string, unknown>) {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

function makeUser(
  overrides: Partial<PrivateUserProfileResponse> = {},
): PrivateUserProfileResponse {
  return {
    userId: "user-1",
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
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
});

describe("patchUser", () => {
  it("updates the profile through Orval and stores the response user", async () => {
    const token = makeJwt({
      sub: "account-1",
      user_id: "user-1",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    const initialUser = makeUser();
    const updatedUser = makeUser({ firstName: "Mira" });
    useAuthStore.getState().setToken({
      accessToken: token,
      accountId: "account-1",
      permissions: [],
    });
    useAuthStore.getState().setUser(initialUser);
    mockedPatchUserProfile.mockResolvedValue({
      data: updatedUser,
      status: 200,
      headers: new Headers(),
    });

    await patchUser({ firstName: "Mira" });

    expect(mockedPatchUserProfile).toHaveBeenCalledWith(
      "user-1",
      { firstName: "Mira" },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(useAuthStore.getState().user).toEqual(updatedUser);
  });

  it("uploads the profile photo through Orval and refreshes the stored user", async () => {
    const token = makeJwt({
      sub: "account-1",
      user_id: "user-1",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    const profileMedia: ProfileMediaResponse = {
      mediaId: "media-1",
      url: "/profile.jpg",
      altText: null,
      altTextStatus: "PENDING",
      mimeType: "image/jpeg",
      size: 1024,
      width: 200,
      height: 200,
      createdAt: "2026-06-14T12:00:00Z",
    };
    const updatedUser = makeUser({ profileMedia });
    const file = new File(["image"], "profile.jpg", { type: "image/jpeg" });
    useAuthStore.getState().setToken({
      accessToken: token,
      accountId: "account-1",
      permissions: [],
    });
    useAuthStore.getState().setUser(makeUser());
    mockedUploadProfilePicture.mockResolvedValue({
      data: profileMedia,
      status: 200,
      headers: new Headers(),
    });
    mockedGetPrivateUserProfile.mockResolvedValue({
      data: updatedUser,
      status: 200,
      headers: new Headers(),
    });

    await uploadProfilePhoto(file);

    expect(mockedUploadProfilePicture).toHaveBeenCalledWith(
      "user-1",
      { file },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(mockedGetPrivateUserProfile).toHaveBeenCalledWith("user-1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(useAuthStore.getState().user).toEqual(updatedUser);
  });
});
