import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  getGetV1PublicListingsListingIdQueryKey,
  getV1PublicListingsListingId,
  postV1Bookings,
} from "../../api/mira";
import type {
  CreateBookingRequest,
  ProblemDetailsResponse,
  ProviderAvailabilityResponse,
  UnauthorizedErrorResponse,
} from "../../api/model";
import { BookingPage } from "../../components/BookingPage";
import { authFetch } from "../../lib/queryClient";
import { get_access_token } from "../../stores/auth";

export const Route = createFileRoute("/listings/$listingId/book")({
  component: BookingRoute,
});

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function getErrorDetail(
  data: ProblemDetailsResponse | UnauthorizedErrorResponse,
) {
  return "detail" in data ? data.detail : undefined;
}

async function getAuthOptions(): Promise<RequestInit> {
  const token = await get_access_token();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// eslint-disable-next-line react-refresh/only-export-components
function BookingRoute() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);

  const { data: availability } = useQuery({
    queryKey: ["listing-availability", listingId, year, month],
    queryFn: async () => {
      const res = await authFetch(
        `/v1/listings/${listingId}/availability?from=${toLocalDate(from)}&to=${toLocalDate(to)}`,
        await getAuthOptions(),
      );
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json() as Promise<ProviderAvailabilityResponse>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: listing } = useQuery({
    queryKey: getGetV1PublicListingsListingIdQueryKey(listingId),
    queryFn: async () => {
      const response = await getV1PublicListingsListingId(listingId);

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load listing.",
        );
      }

      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const bookingMutation = useMutation({
    mutationFn: async (booking: CreateBookingRequest) => {
      const response = await postV1Bookings(booking, await getAuthOptions());

      if (response.status !== 201) {
        throw new Error(getErrorDetail(response.data) ?? "Booking failed");
      }

      return response.data;
    },
    onSuccess: () => navigate({ to: "/my-bookings" }),
  });

  return (
    <BookingPage
      listingId={listingId}
      year={year}
      month={month}
      availability={availability}
      listing={listing}
      bookingPending={bookingMutation.isPending}
      bookingError={
        bookingMutation.isError
          ? (bookingMutation.error as Error).message
          : null
      }
      onMonthChange={(nextYear, nextMonth) => {
        setYear(nextYear);
        setMonth(nextMonth);
      }}
      onBack={() => navigate({ to: "/" })}
      onCreateBooking={(booking) => bookingMutation.mutate(booking)}
    />
  );
}
