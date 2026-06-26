import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../components/common/InfoPage";
import { INFO_PAGES } from "../../components/common/infoPages";

export const Route = createFileRoute("/_app/accessibility")({
  component: AccessibilityRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function AccessibilityRoute() {
  return <InfoPage page={INFO_PAGES.accessibility} />;
}
