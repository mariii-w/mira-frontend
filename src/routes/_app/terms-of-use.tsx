import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../common/InfoPage";
import { INFO_PAGES } from "../../common/infoPages";

export const Route = createFileRoute("/_app/terms-of-use")({
  component: TermsOfUseRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function TermsOfUseRoute() {
  return <InfoPage page={INFO_PAGES.terms} />;
}
