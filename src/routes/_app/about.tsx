import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../components/InfoPage";
import { INFO_PAGES } from "../../components/infoPages";
import { createPageMeta } from "../../lib/headers";

export const Route = createFileRoute("/_app/about")({
  head: () =>
    createPageMeta({
      title: "About",
      description: "Learn what Mira is  & who it is for",
      path: "/about",
    }),
  component: AboutRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function AboutRoute() {
  return <InfoPage page={INFO_PAGES.about} />;
}
