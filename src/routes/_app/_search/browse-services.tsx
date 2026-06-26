import { createFileRoute } from "@tanstack/react-router";
import { SearchServicesPage } from "../../../components/search/pages/SearchServicesPage.tsx";
import { browseServicesSearchSchema } from "../../../components/search/searchSchemas";
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
