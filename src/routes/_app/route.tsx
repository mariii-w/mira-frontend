import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "../../components/common/layout/AppShell";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
