import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentReturnPage } from "../../../../components/features/payments/PaymentReturnPage";
import { requireAuth } from "../../../../lib/requireAuth";
import { createPageMeta } from "../../../../lib/headers";

export const Route = createFileRoute("/_app/bookings/payment/cancelled")({
  head: () =>
    createPageMeta({
      title: "Payment Cancelled",
      description: "Payment didnt work",
      path: "/bookings/payment/cancelled",
    }),
  beforeLoad: requireAuth,
  component: PaymentCancelledRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function PaymentCancelledRoute() {
  const navigate = useNavigate();

  return (
    <PaymentReturnPage
      status="cancelled"
      onBackToBookings={() => navigate({ to: "/my-bookings" })}
    />
  );
}
