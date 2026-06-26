import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  getGetAvailabilityQueryKey,
  getGetPublicProfileCredentialsQueryKey,
  getAvailability,
  useGetPublicListing,
  getPublicProfileCredentials,
  createBooking,
} from "../../../api/mira";
import type {
  CreateBookingRequest,
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../../../api/model";
import { BookingPage } from "../../../components/features/bookings/BookingPage";
import { requireConsumer } from "../../../lib/requireAuth";
import { createPageMeta } from "../../../lib/headers";

export const Route = createFileRoute("/_app/listings/$listingId_/book")({
  head: () =>
    createPageMeta({
      title: "Book Service",
      description: "Choose a time and request a Mira service booking.",
    }),
  beforeLoad: requireConsumer,
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
    queryKey: getGetAvailabilityQueryKey(listingId, {
      from: toLocalDate(from),
      to: toLocalDate(to),
    }),
    queryFn: async () => {
      const response = await getAvailability(listingId, {
        from: toLocalDate(from),
        to: toLocalDate(to),
      });

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to fetch availability",
        );
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: listingResponse } = useGetPublicListing(listingId);
  const listing = listingResponse?.status === 200 ? listingResponse.data : undefined;

  const authorId = listing?.author?.userId ?? "";
  const { data: publicCredentialsData } = useQuery({
    queryKey: getGetPublicProfileCredentialsQueryKey(authorId),
    queryFn: async () => {
      const response = await getPublicProfileCredentials(authorId);

      if (response.status === 404) {
        return { items: [] };
      }

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load provider credentials.",
        );
      }

      return response.data;
    },
    enabled: !!authorId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (booking: CreateBookingRequest) => {
      const response = await createBooking(booking);

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
      publicVerifiedCredentials={publicCredentialsData?.items ?? []}
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
      onBack={() =>
        navigate({ to: "/listings/$listingId", params: { listingId } })
      }
      onCreateBooking={(booking) => bookingMutation.mutate(booking)}
    />
  );
}
