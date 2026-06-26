import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../components/InfoPage";
import { INFO_PAGES } from "../../components/infoPages";

export const Route = createFileRoute("/_app/about")({
  component: AboutRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function AboutRoute() {
  return <InfoPage page={INFO_PAGES.about} />;
}
