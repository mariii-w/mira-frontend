import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { RegisterLayout } from "../../features/register/RegisterLayout";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register")({
  component: RegisterLayoutRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function RegisterLayoutRoute() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  return (
    <RegisterLayout user={user} pathname={location.pathname}>
      <Outlet />
    </RegisterLayout>
  );
}
