import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./Button";

interface PaymentReturnPageProps {
  status: "success" | "cancelled";
  onBackToBookings: () => void;
}

export function PaymentReturnPage({
  status,
  onBackToBookings,
}: PaymentReturnPageProps) {
  const successful = status === "success";
  const Icon = successful ? CheckCircle2 : XCircle;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
        <Icon
          aria-hidden="true"
          className={successful ? "text-primary" : "text-accent"}
          size={56}
        />
        <h1 className="mt-5 font-heading text-h1 font-bold text-foreground">
          {successful ? "Payment received" : "Payment cancelled"}
        </h1>
        <p className="mt-3 text-body text-muted">
          {successful
            ? "Your payment was submitted. Booking status may take a moment to update while payment is confirmed."
            : "No payment was completed. Your confirmed booking remains available until its payment deadline."}
        </p>
        <Button className="mt-8" size="lg" onClick={onBackToBookings}>
          My bookings
        </Button>
      </main>
    </div>
  );
}
