import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getGetPublicListingQueryKey,
  getGetPublicProfileListingsQueryKey,
  getGetAvailabilityQueryKey,
  getPublicListing,
  getPublicProfileListings,
  getAvailability,
  useCreateChat,
} from "../../api/mira";
import { ListingDetailPage } from "../../components/ListingDetailPage";
import { useAccessibilityStore } from "../../stores/accessibility";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/listings/$listingId/")({
  component: ListingDetailRoute,
});

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// eslint-disable-next-line react-refresh/only-export-components
function ListingDetailRoute() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const easyRead = useAccessibilityStore((s) => s.easyRead);
  const currentUserId = useAuthStore((s) => s.user?.userId);
  const [messageError, setMessageError] = useState<string | null>(null);
  const createChat = useCreateChat();
  const today = toLocalDate(new Date());
  // 30-day lookahead, comfortably under the API's 31-day range limit.
  const availabilityRangeEnd = toLocalDate(addDays(new Date(), 29));

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: getGetPublicListingQueryKey(listingId),
    queryFn: async () => {
      const response = await getPublicListing(listingId);

      if (response.status !== 200) {
        throw new Error(response.data.detail ?? "Failed to load listing.");
      }

      return response.data;
    },
  });

  const authorId = listing?.author.userId;
  const queryAuthorId = authorId ?? "";

  const { data: otherListingsData } = useQuery({
    queryKey: getGetPublicProfileListingsQueryKey(queryAuthorId, { limit: 5 }),
    queryFn: async () => {
      const response = await getPublicProfileListings(queryAuthorId, { limit: 5 });

      // A 404 means the author has no publicly eligible profile (not public yet,
      // or registration incomplete) — treat that as "no other listings" rather
      // than an error, since the viewed listing itself doesn't depend on that flag.
      if (response.status === 404) {
        return { items: [] };
      }

      if (response.status !== 200) {
        throw new Error(response.data.detail ?? "Failed to load other listings.");
      }

      return response.data;
    },
    enabled: !!authorId,
  });

  const { data: availability } = useQuery({
    queryKey: getGetAvailabilityQueryKey(listingId, {
      from: today,
      to: availabilityRangeEnd,
    }),
    queryFn: async () => {
      const response = await getAvailability(listingId, {
        from: today,
        to: availabilityRangeEnd,
      });

      if (response.status !== 200) {
        throw new Error(response.data.detail ?? "Failed to load availability.");
      }

      return response.data;
    },
  });

  const description = listing
    ? (easyRead && listing.easyDescription ? listing.easyDescription : listing.description)
    : undefined;

  const nextAvailableDay = [...(availability?.days ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((day) => day.freeWindows.length > 0);
  const availableToday = nextAvailableDay?.date === today;
  const nextAvailableDate = nextAvailableDay?.date;

  const otherListings = (otherListingsData?.items ?? []).filter(
    (item) => item.listingId !== listingId,
  );

  const isOwnListing = !!currentUserId && authorId === currentUserId;

  function handleMessage() {
    setMessageError(null);
    createChat.mutate(
      { data: { listingId } },
      {
        onSuccess: (response) => {
          if (response.status === 200 || response.status === 201) {
            navigate({ to: "/chat", search: { cid: response.data.cid } });
          } else {
            setMessageError(response.data.detail ?? "Couldn't start the chat.");
          }
        },
        onError: () => setMessageError("Couldn't start the chat. Try again."),
      },
    );
  }

  return (
    <ListingDetailPage
      listing={listing}
      loading={isLoading}
      error={error ? (error as Error).message : null}
      description={description ?? undefined}
      availableToday={availableToday}
      nextAvailableDate={nextAvailableDate}
      otherListings={otherListings}
      onBookNow={() =>
        navigate({ to: "/listings/$listingId/book", params: { listingId } })
      }
      onMessage={handleMessage}
      canMessage={!isOwnListing}
      messagePending={createChat.isPending}
      messageError={messageError}
    />
  );
}
