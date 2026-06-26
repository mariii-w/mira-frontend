import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { patchUserProfile } from "../../api/mira";
import type {
  PatchUserProfileRequest,
  ProblemDetailsResponse,
} from "../../api/model";
import {
  RegisterRole,
  type RegisterRoleSubmitError,
  type RegisterRoleSubmitValues,
} from "../../features/register/RegisterRole";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/role")({
  component: RegisterRoleRoute,
});

function getSubmitError(
  status: number,
  data: ProblemDetailsResponse | unknown,
): RegisterRoleSubmitError {
  const detail =
    typeof data === "object" && data !== null && "detail" in data
      ? String(data.detail)
      : undefined;

  return {
    field: "server",
    message: detail ?? `Unexpected error (${status}). Please try again.`,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterRoleRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue(values: RegisterRoleSubmitValues) {
    if (!user) {
      throw {
        field: "server",
        message: "Not logged in.",
      } satisfies RegisterRoleSubmitError;
    }

    const payload: PatchUserProfileRequest = values;
    const response = await patchUserProfile(user.userId, payload);

    if (response.status !== 200) {
      throw getSubmitError(response.status, response.data);
    }

    setUser(response.data);
    await navigate({ to: "/register/name" });
  }

  return (
    <RegisterRole
      currentUserType={user?.userType ?? null}
      onContinue={handleContinue}
    />
  );
}
