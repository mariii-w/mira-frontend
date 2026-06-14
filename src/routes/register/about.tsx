import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { patchUserProfile } from "../../api/mira";
import type { PatchUserProfileRequest } from "../../api/model";
import {
  RegisterAbout,
  type RegisterAboutSubmitValues,
} from "../../components/RegisterAbout";
import { get_access_token, useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/about")({
  component: RegisterAboutRoute,
});

function getErrorMessage(status: number, detail?: string) {
  if (status === 409) return "That username is already taken. Try another one.";
  if (status === 400)
    return detail ?? "Some fields are invalid. Please check your input.";
  if (status === 503) {
    return detail
      ? `${detail}. Try again in a moment, or clear the bio field and continue.`
      : "A backend service is temporarily unavailable. Try again later.";
  }
  return detail ?? `Unexpected error (${status}). Please try again.`;
}

async function getAuthOptions(): Promise<RequestInit> {
  const token = await get_access_token();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterAboutRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue(values: RegisterAboutSubmitValues) {
    if (!user) throw new Error("Not logged in.");

    const payload: PatchUserProfileRequest = {
      ...(values.bio ? { bio: values.bio } : {}),
      ...(values.selfSummary ? { selfSummary: values.selfSummary } : {}),
    };

    if (Object.keys(payload).length > 0) {
      const response = await patchUserProfile(
        user.userId,
        payload,
        await getAuthOptions(),
      );

      if (response.status !== 200) {
        throw new Error(getErrorMessage(response.status, response.data.detail));
      }

      setUser(response.data);
    }

    await navigate({ to: "/register/photo" });
  }

  return (
    <RegisterAbout
      initialValues={user}
      onBack={() => navigate({ to: "/register/address" })}
      onContinue={handleContinue}
    />
  );
}
