import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { patchUserProfile } from "../../api/mira";
import type { PatchUserProfileRequest } from "../../api/model";
import {
  RegisterName,
  type RegisterNameSubmitError,
  type RegisterNameSubmitValues,
} from "../../components/RegisterName";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/name")({
  component: RegisterNameRoute,
});

function getSubmitError(
  status: number,
  detail?: string,
): RegisterNameSubmitError {
  if (status === 409) {
    return {
      field: "username",
      message: "That username is already taken. Try another one.",
    };
  }
  if (status === 400)
    return {
      field: "server",
      message: detail ?? "Some fields are invalid. Please check your input.",
    };
  if (status === 503) {
    return {
      field: "server",
      message: detail
        ? `${detail}. Try again in a moment, or clear the bio field and continue.`
        : "A backend service is temporarily unavailable. Try again later.",
    };
  }
  return {
    field: "server",
    message: detail ?? `Unexpected error (${status}). Please try again.`,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterNameRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue(values: RegisterNameSubmitValues) {
    if (!user) throw new Error("Not logged in.");

    const payload: PatchUserProfileRequest = values;

    const response = await patchUserProfile(user.userId, payload);

    if (response.status !== 200) {
      throw getSubmitError(response.status, response.data.detail);
    }

    setUser(response.data);
    await navigate({ to: "/register/address" });
  }

  return (
    <RegisterName
      initialValues={user}
      onBack={() => navigate({ to: "/register/role" })}
      onContinue={handleContinue}
    />
  );
}
