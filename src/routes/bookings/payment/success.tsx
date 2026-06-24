import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentReturnPage } from "../../../components/PaymentReturnPage";

export const Route = createFileRoute("/bookings/payment/success")({
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
