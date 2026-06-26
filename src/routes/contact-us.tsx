import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../components/InfoPage";
import { INFO_PAGES } from "../components/infoPages";
import { createPageMeta } from "../lib/headers";

export const Route = createFileRoute("/contact-us")({
  head: () =>
    createPageMeta({
      title: "Contact Us",
      description:
        "Contact the Mira team about support, feedback, accessibility or reports.",
      path: "/contact-us",
    }),
  component: ContactUsRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function ContactUsRoute() {
  return <InfoPage page={INFO_PAGES.contact} />;
}
