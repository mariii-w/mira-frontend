import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentReturnPage } from "../../../components/PaymentReturnPage";
import { requireAuth } from "../../../lib/requireAuth";

export const Route = createFileRoute("/bookings/payment/success")({
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
