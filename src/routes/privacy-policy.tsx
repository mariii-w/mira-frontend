import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../components/InfoPage";
import { INFO_PAGES } from "../components/infoPages";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function PrivacyPolicyRoute() {
  return <InfoPage page={INFO_PAGES.privacy} />;
}
