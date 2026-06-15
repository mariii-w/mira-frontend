import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { patchUserProfile } from "../../api/mira";
import type { PatchUserProfileRequest } from "../../api/model";
import {
  RegisterAddress,
  type RegisterAddressSubmitValues,
} from "../../components/RegisterAddress";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/address")({
  component: RegisterAddressRoute,
});

function getErrorMessage(status: number, detail?: string) {
  if (status === 400)
    return detail ?? "Some fields are invalid. Please check your input.";
  if (status === 503) {
    return detail
      ? `${detail}. Try again in a moment, or clear the bio field and continue.`
      : "A backend service is temporarily unavailable. Try again later.";
  }
  return detail ?? `Unexpected error (${status}). Please try again.`;
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterAddressRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue(values: RegisterAddressSubmitValues) {
    if (!user) throw new Error("Not logged in.");

    const payload: PatchUserProfileRequest = {
      privateAddress: values,
    };

    const response = await patchUserProfile(user.userId, payload);

    if (response.status !== 200) {
      throw new Error(getErrorMessage(response.status, response.data.detail));
    }

    setUser(response.data);
    await navigate({ to: "/register/about" });
  }

  return (
    <RegisterAddress
      initialValues={user}
      onBack={() => navigate({ to: "/register/name" })}
      onContinue={handleContinue}
    />
  );
}
