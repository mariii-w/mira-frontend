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
} from "../../components/features/register/RegisterRole";
import { createPageMeta } from "../../lib/headers";
import { exchangeRefreshForAccess, useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/role")({
  head: () =>
    createPageMeta({
      title: "Choose Account Type",
      description:
        "Choose whether you want to use Mira as a customer or provider.",
      path: "/register/role",
    }),
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
    if (!user || !user.userId) {
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
    // userType drives the backend's CAN_CREATE_LISTING permission, which is baked
    // into the access token at issuance time — force a refresh now so the new
    // permission is usable immediately, without requiring a full page reload.
    await exchangeRefreshForAccess();
    await navigate({ to: "/register/name" });
  }

  return (
    <RegisterRole
      currentUserType={user?.userType ?? null}
      onContinue={handleContinue}
    />
  );
}
