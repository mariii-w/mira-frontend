import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "../../components/common/layout/Footer";
import { Navbar } from "../../components/common/layout/Navbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
