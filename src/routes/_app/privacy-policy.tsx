import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../common/InfoPage";
import { INFO_PAGES } from "../../common/infoPages";

export const Route = createFileRoute("/_app/privacy-policy")({
  component: PrivacyPolicyRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function PrivacyPolicyRoute() {
  return <InfoPage page={INFO_PAGES.privacy} />;
}
