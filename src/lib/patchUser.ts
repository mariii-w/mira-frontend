import {
  getPrivateUserProfile,
  patchUserProfile,
  uploadProfilePicture,
} from "../api/mira";
import type {
  PatchUserProfileRequest,
  ProblemDetailsResponse,
} from "../api/model";
import { useAuthStore } from "../stores/auth";

export type UserType = "CUSTOMER" | "PROVIDER";
export type AccessibilityPreference = "EASY_LANGUAGE" | "REDUCED_MOTION";

export interface PatchAddressPayload {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
}

export interface PatchUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  userType?: UserType;
  privateAddress?: PatchAddressPayload;
  bio?: string;
  selfSummary?: string;
  isPublic?: boolean;
  accessibilityPreferences?: AccessibilityPreference[];
}

export interface RegisterPatchError {
  field: "server" | "username";
  message: string;
}

export interface UploadPhotoError {
  field: "server" | "file";
  message: string;
}

function getDetail(data: ProblemDetailsResponse | unknown): string | undefined {
  return typeof data === "object" && data !== null && "detail" in data
    ? String(data.detail)
    : undefined;
}

export async function patchUser(payload: PatchUserPayload): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw {
      field: "server",
      message: "Not logged in.",
    } satisfies RegisterPatchError;
  }

  const res = await patchUserProfile(
    user.userId,
    payload satisfies PatchUserProfileRequest,
  );

  if (res.status !== 200) {
    if (res.status === 409) {
      throw {
        field: "username",
        message: "That username is already taken. Try another one.",
      } satisfies RegisterPatchError;
    }
    const detail = getDetail(res.data);
    if (res.status === 400) {
      throw {
        field: "server",
        message: detail ?? "Some fields are invalid. Please check your input.",
      } satisfies RegisterPatchError;
    }
    if (res.status === 503) {
      throw {
        field: "server",
        message: detail
          ? `${detail}. Try again in a moment, or clear the bio field and continue.`
          : "A backend service is temporarily unavailable. Try again later.",
      } satisfies RegisterPatchError;
    }
    throw {
      field: "server",
      message: detail ?? `Unexpected error (${res.status}). Please try again.`,
    } satisfies RegisterPatchError;
  }

  useAuthStore.getState().setUser(res.data);
}

export async function uploadProfilePhoto(file: File): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw {
      field: "server",
      message: "Not logged in.",
    } satisfies UploadPhotoError;
  }

  const res = await uploadProfilePicture(user.userId, { file });

  if (res.status !== 200) {
    const detail = getDetail(res.data);

    if (res.status === 413) {
      throw {
        field: "file",
        message: detail ?? "Image is too large. Max 5 MB.",
      } satisfies UploadPhotoError;
    }
    if (res.status === 415) {
      throw {
        field: "file",
        message: detail ?? "Unsupported image format. Use JPG or PNG.",
      } satisfies UploadPhotoError;
    }
    if (res.status === 422) {
      throw {
        field: "file",
        message:
          detail ?? "Image dimensions are too small. Min 200×200 pixels.",
      } satisfies UploadPhotoError;
    }
    throw {
      field: "server",
      message: detail ?? `Upload failed (${res.status}). Please try again.`,
    } satisfies UploadPhotoError;
  }

  const refresh = await getPrivateUserProfile(user.userId);
  if (refresh.status === 200) {
    useAuthStore.getState().setUser(refresh.data);
  }
}
