import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../components/common/InfoPage";
import { INFO_PAGES } from "../../components/common/infoPages";

export const Route = createFileRoute("/_app/terms-of-use")({
  component: TermsOfUseRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function TermsOfUseRoute() {
  return <InfoPage page={INFO_PAGES.terms} />;
}
