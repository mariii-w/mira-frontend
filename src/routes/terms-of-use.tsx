import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../components/InfoPage";
import { INFO_PAGES } from "../components/infoPages";

export const Route = createFileRoute("/terms-of-use")({
  component: TermsOfUseRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function TermsOfUseRoute() {
  return <InfoPage page={INFO_PAGES.terms} />;
}
