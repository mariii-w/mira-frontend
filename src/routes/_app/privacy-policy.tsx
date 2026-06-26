import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "../../components/common/InfoPage";
import { INFO_PAGES } from "../../components/common/infoPages";
import { createPageMeta } from "../../lib/headers";

export const Route = createFileRoute("/_app/privacy-policy")({
  head: () =>
    createPageMeta({
      title: "Privacy Policy",
      description:
        "Understand how Mira handles profile, listing, booking, and credential data.",
      path: "/privacy-policy",
    }),
  component: PrivacyPolicyRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function PrivacyPolicyRoute() {
  return <InfoPage page={INFO_PAGES.privacy} />;
}
