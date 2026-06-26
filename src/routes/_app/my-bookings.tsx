import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  getListMyBookingsQueryKey,
  getBooking,
  listMyBookings,
} from "../../api/mira";
import type {
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../../api/model";
import { MyBookings } from "../../components/MyBookings";
import type { AllowedAction, BookingDetails } from "../../components/BookingCard";
import { executeBookingAction } from "../../lib/bookingActions";
import { useAuthStore } from "../../stores/auth";
import { requireAuth } from "../../lib/requireAuth";
import { createPageMeta } from "../../lib/headers";

export const Route = createFileRoute("/_app/my-bookings")({
  head: () =>
    createPageMeta({
      title: "My Bookings",
      description:
        "Track your Mira booking requests, confirmations, payments, and actions.",
      path: "/my-bookings",
    }),
  beforeLoad: requireAuth,
  component: MyBookingsRoute,
});

function getErrorDetail(
  data: ProblemDetailsResponse | UnauthorizedErrorResponse,
) {
  return "detail" in data ? data.detail : undefined;
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
    queryKey: userId ? getListMyBookingsQueryKey(userId) : ["bookings"],
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

    const allowedActions = response.data.allowedActions.flatMap((action) =>
      action.rel && action.href && action.method
        ? [{ rel: action.rel, href: action.href, method: action.method }]
        : [],
    );

    return { ...response.data, allowedActions };
  }

  async function performBookingAction(
    bookingId: string,
    action: AllowedAction,
  ): Promise<string | null> {
    return executeBookingAction(bookingId, action, (url) =>
      window.location.assign(url),
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
