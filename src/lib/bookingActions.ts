import {
  acceptBooking,
  acknowledgeDelivery,
  cancelBooking,
  createCheckoutSession,
  markDelivered,
  refuseBooking,
} from "../api/mira";

export interface BookingAction {
  rel: string;
  href: string;
  method: string;
}

function problemDetail(data: unknown): string | undefined {
  return typeof data === "object" && data !== null && "detail" in data
    ? String(data.detail)
    : undefined;
}

export async function executeBookingAction(
  bookingId: string,
  action: BookingAction,
  redirectToCheckout: (url: string) => void,
): Promise<string | null> {
  if (action.rel === "pay") {
    const response = await createCheckoutSession(bookingId);
    if (response.status !== 200) {
      return (
        problemDetail(response.data) ??
        "Payment checkout could not be started."
      );
    }

    const checkoutUrl = response.data.checkoutUrl;
    if (!checkoutUrl) return "Payment checkout could not be started.";

    redirectToCheckout(checkoutUrl);
    return null;
  }

  const response =
    action.rel === "cancel"
      ? await cancelBooking(bookingId)
      : action.rel === "accept"
        ? await acceptBooking(bookingId)
        : action.rel === "refuse"
          ? await refuseBooking(bookingId)
          : action.rel === "mark-delivered"
            ? await markDelivered(bookingId)
            : action.rel === "acknowledge-delivery"
              ? await acknowledgeDelivery(bookingId)
              : null;

  if (!response) return "This booking action is not supported yet.";
  if (response.status >= 200 && response.status < 300) return null;

  return (
    problemDetail(response.data) ?? "Something went wrong. Please try again."
  );
}
