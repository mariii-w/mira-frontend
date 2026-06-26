import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../common/InfoPage";
import { INFO_PAGES } from "../../common/infoPages";

export const Route = createFileRoute("/_app/accessibility")({
  component: AccessibilityRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function AccessibilityRoute() {
  return <InfoPage page={INFO_PAGES.accessibility} />;
}
