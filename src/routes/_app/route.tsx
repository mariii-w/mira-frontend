import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
