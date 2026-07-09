import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getPrivateUserProfile, uploadProfilePicture } from "../../api/mira";
import type { ProblemDetailsResponse } from "../../api/model";
import {
  RegisterPhoto,
  type RegisterPhotoSubmitError,
} from "../../components/features/register/RegisterPhoto";
import { createPageMeta } from "../../lib/headers";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/photo")({
  head: () =>
    createPageMeta({
      title: "Profile Photo",
      description: "Upload or skip a profile photo for your Mira account.",
      path: "/register/photo",
    }),
  component: RegisterPhotoRoute,
});

function getDetail(data: ProblemDetailsResponse | unknown): string | undefined {
  return typeof data === "object" && data !== null && "detail" in data
    ? String(data.detail)
    : undefined;
}

function getUploadError(
  status: number,
  detail?: string,
): RegisterPhotoSubmitError {
  if (status === 413) {
    return {
      field: "file",
      message: detail ?? "Image is too large. Max 5 MB.",
    };
  }
  if (status === 415) {
    return {
      field: "file",
      message: detail ?? "Unsupported image format. Use JPG or PNG.",
    };
  }
  if (status === 422) {
    return {
      field: "file",
      message: detail ?? "Image dimensions are too small. Min 200x200 pixels.",
    };
  }
  return {
    field: "server",
    message: detail ?? `Upload failed (${status}). Please try again.`,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterPhotoRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue(file: File | null) {
    if (!user?.userId) throw new Error("Not logged in.");

    if (file) {
      const response = await uploadProfilePicture(user.userId, { file });

      if (response.status !== 200) {
        throw getUploadError(response.status, getDetail(response.data));
      }

      const refresh = await getPrivateUserProfile(user.userId);
      if (refresh.status === 200) setUser(refresh.data);
    }

    await navigate({ to: "/register/done" });
  }

  return (
    <RegisterPhoto
      initialValues={user}
      onBack={() => navigate({ to: "/register/about" })}
      onContinue={handleContinue}
    />
  );
}
