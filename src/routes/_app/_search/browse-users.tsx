import { createFileRoute } from "@tanstack/react-router";
import { SearchUsersPage } from "../../../components/search/pages/SearchUsersPage.tsx";
import { browseUsersSearchSchema } from "../../../components/search/searchSchemas";
import { createPageMeta } from "../../../lib/headers";

export const Route = createFileRoute("/_app/_search/browse-users")({
  head: () =>
    createPageMeta({
      title: "Browse Users",
      description:
        "Browse Mira users and providers by profile type, keyword and location.",
      path: "/browse-users",
    }),
  validateSearch: browseUsersSearchSchema,
  component: SearchUsersPage,
});
