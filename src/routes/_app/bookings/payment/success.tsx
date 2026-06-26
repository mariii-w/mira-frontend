import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentReturnPage } from "../../../../components/features/payments/PaymentReturnPage";
import { requireAuth } from "../../../../lib/requireAuth";
import { createPageMeta } from "../../../../lib/headers";

export const Route = createFileRoute("/_app/bookings/payment/success")({
  head: () =>
    createPageMeta({
      title: "Payment Successful",
      description: "The payment was successfull",
      path: "/bookings/payment/success",
    }),
  beforeLoad: requireAuth,
  component: PaymentSuccessRoute,
});

// eslint-disable-next-line react-refresh/only-export-components
function PaymentSuccessRoute() {
  const navigate = useNavigate();

  return (
    <PaymentReturnPage
      status="success"
      onBackToBookings={() => navigate({ to: "/my-bookings" })}
    />
  );
}
