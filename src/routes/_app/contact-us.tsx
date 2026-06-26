import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../common/InfoPage";
import { INFO_PAGES } from "../../common/infoPages";

export const Route = createFileRoute("/_app/contact-us")({
  component: ContactUsRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function ContactUsRoute() {
  return <InfoPage page={INFO_PAGES.contact} />;
}
