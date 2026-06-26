import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../components/Home";
import { createPageMeta } from "../../lib/headers";

export const Route = createFileRoute("/_app/")({
  head: () =>
    createPageMeta({
      title: "Home",
      description: "Discover trusted local services and providers on Mira.",
      path: "/",
    }),
  component: Home,
});
