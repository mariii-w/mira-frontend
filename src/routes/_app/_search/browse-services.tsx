import { createFileRoute } from "@tanstack/react-router";
import { SearchServicesPage } from "../../../components/features/search/SearchServicesPage.tsx";
import { browseServicesSearchSchema } from "../../../components/features/search/searchSchemas";
import { createPageMeta } from "../../../lib/headers";

export const Route = createFileRoute("/_app/_search/browse-services")({
  head: () =>
    createPageMeta({
      title: "Browse Services",
      description: "Browse and filter Mira service listings by keyword & type",
      path: "/browse-services",
    }),
  validateSearch: browseServicesSearchSchema,
  component: SearchServicesPage,
});
