import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentReturnPage } from "../../../components/PaymentReturnPage";

export const Route = createFileRoute("/bookings/payment/cancelled")({
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
