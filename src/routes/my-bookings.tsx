import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  deleteV1BookingsBookingId,
  getGetV1UsersUserIdBookingsQueryKey,
  getV1BookingsBookingId,
  getV1UsersUserIdBookings,
  postV1BookingsBookingIdAccept,
  postV1BookingsBookingIdAcknowledgeDelivery,
  postV1BookingsBookingIdMarkDelivered,
  postV1BookingsBookingIdRefuse,
} from "../api/mira";
import type {
  BookingStatus,
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../api/model";
import { MyBookings } from "../components/MyBookings";
import type { AllowedAction, BookingDetails } from "../components/BookingCard";
import { get_access_token, useAuthStore } from "../stores/auth";

export const Route = createFileRoute("/my-bookings")({
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

async function getAuthOptions(): Promise<RequestInit> {
  const token = await get_access_token();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
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
    actions.push({ rel: "cancel", href: "", method: "DELETE" });
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
      ? getGetV1UsersUserIdBookingsQueryKey(userId)
      : ["bookings"],
    queryFn: async () => {
      if (!userId) throw new Error("You must be signed in to view bookings.");

      const response = await getV1UsersUserIdBookings(
        userId,
        undefined,
        await getAuthOptions(),
      );

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
    const response = await getV1BookingsBookingId(
      bookingId,
      await getAuthOptions(),
    );

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
    const authOptions = await getAuthOptions();
    const response =
      action.rel === "cancel"
        ? await deleteV1BookingsBookingId(bookingId, authOptions)
        : action.rel === "accept"
          ? await postV1BookingsBookingIdAccept(bookingId, authOptions)
          : action.rel === "refuse"
            ? await postV1BookingsBookingIdRefuse(
                bookingId,
                undefined,
                authOptions,
              )
            : action.rel === "mark-delivered"
              ? await postV1BookingsBookingIdMarkDelivered(
                  bookingId,
                  authOptions,
                )
              : action.rel === "acknowledge-delivery"
                ? await postV1BookingsBookingIdAcknowledgeDelivery(
                    bookingId,
                    authOptions,
                  )
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
