import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  getListMyBookingsQueryKey,
  getBooking,
  listMyBookings,
  acceptBooking,
  acknowledgeDelivery,
  cancelBooking,
  markDelivered,
  refuseBooking,
} from "../../api/mira";
import type {
  BookingStatus,
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../../api/model";
import { MyBookings } from "../../components/MyBookings";
import type { AllowedAction, BookingDetails } from "../../components/BookingCard";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/_app/my-bookings")({
  component: MyBookingsRoute,
});

function getErrorDetail(
  data: ProblemDetailsResponse | UnauthorizedErrorResponse,
) {
  return "detail" in data ? data.detail : undefined;
}

function getUnknownErrorDetail(data: unknown): string | undefined {
  return typeof data === "object" && data !== null && "detail" in data
    ? String(data.detail)
    : undefined;
}

function buildAllowedActions(
  status: BookingStatus,
  isProvider: boolean,
): AllowedAction[] {
  const actions: AllowedAction[] = [];

  if (isProvider && status === "PENDING") {
    actions.push(
      { rel: "accept", href: "", method: "POST" },
      { rel: "refuse", href: "", method: "POST" },
    );
  }

  if (isProvider && status === "PAID") {
    actions.push({ rel: "mark-delivered", href: "", method: "POST" });
  }

  if (!isProvider && status === "AWAITING_CONFIRMATION") {
    actions.push({ rel: "acknowledge-delivery", href: "", method: "POST" });
  }

  if (!isProvider && ["PENDING", "CONFIRMED", "PAID"].includes(status)) {
    actions.push({ rel: "cancel", href: "", method: "POST" });
  }

  return actions;
}

// eslint-disable-next-line react-refresh/only-export-components
function MyBookingsRoute() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;
  const isProvider = user?.userType === "PROVIDER";

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: userId
      ? getListMyBookingsQueryKey(userId)
      : ["bookings"],
    queryFn: async () => {
      if (!userId) throw new Error("You must be signed in to view bookings.");

      const response = await listMyBookings(userId);

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load bookings.",
        );
      }

      return response.data;
    },
    enabled: !!userId,
  });

  async function loadBookingDetails(
    bookingId: string,
  ): Promise<BookingDetails | null> {
    const response = await getBooking(bookingId);

    if (response.status !== 200) return null;

    return {
      ...response.data,
      paidAt: null,
      allowedActions: buildAllowedActions(response.data.status, isProvider),
    };
  }

  async function performBookingAction(
    bookingId: string,
    action: AllowedAction,
  ): Promise<string | null> {
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
      getUnknownErrorDetail(response.data) ??
      "Something went wrong. Please try again."
    );
  }

  return (
    <MyBookings
      bookings={data?.items ?? []}
      isProvider={isProvider}
      loading={loading}
      error={queryError ? (queryError as Error).message : null}
      onActionComplete={() => void refetch()}
      loadBookingDetails={loadBookingDetails}
      performBookingAction={performBookingAction}
    />
  );
}
