import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getGetPublicProfileListingsQueryKey,
  getGetAvailabilityQueryKey,
  getGetPublicProfileCredentialsQueryKey,
  getPublicProfileCredentials,
  getPublicProfileListings,
  getAvailability,
  useCreateChat,
  useGetPublicListing,
} from "../../../api/mira";
import type { PublicListingDetails } from "../../../api/model";
import { ListingDetailPage } from "../../../components/features/listings/ListingDetailPage";
import { useAccessibilityStore } from "../../../stores/accessibility";
import { useAuthStore } from "../../../stores/auth";
import { createPageMeta } from "../../../lib/headers";

export const Route = createFileRoute("/_app/listings/$listingId/")({
  head: () =>
      createPageMeta({
        title: "Service Details",
        description:
            "View a Mira service listing with provider information, availability, and booking options.",
      }),
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

export function canStartListingChat(listing?: PublicListingDetails): boolean {
  return !!listing?._links?.chat;
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
    data: listingResponse,
    isLoading,
    error,
  } = useGetPublicListing(listingId);

  const listing =
      listingResponse?.status === 200 ? listingResponse.data : undefined;

  const authorId = listing?.author?.userId;
  const queryAuthorId = authorId ?? "";

  const { data: otherListingsData } = useQuery({
    queryKey: getGetPublicProfileListingsQueryKey(queryAuthorId, { limit: 5 }),
    queryFn: async () => {
      const response = await getPublicProfileListings(queryAuthorId, {
        limit: 5,
      });

      // A 404 means the author has no publicly eligible profile (not public yet,
      // or registration incomplete) — treat that as "no other listings" rather
      // than an error, since the viewed listing itself doesn't depend on that flag.
      if (response.status === 404) {
        return { items: [] };
      }

      if (response.status !== 200) {
        throw new Error(
            response.data.detail ?? "Failed to load other listings.",
        );
      }

      return response.data;
    },
    enabled: !!authorId,
  });

  const { data: publicCredentialsData } = useQuery({
    queryKey: getGetPublicProfileCredentialsQueryKey(queryAuthorId),
    queryFn: async () => {
      const response = await getPublicProfileCredentials(queryAuthorId);

      if (response.status === 404) {
        return { items: [] };
      }

      if (response.status !== 200) {
        throw new Error(
            response.data.detail ?? "Failed to load provider credentials.",
        );
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
        throw new Error(response.data?.detail ?? "Failed to load availability.");
      }

      return response.data;
    },
  });

  const description = listing
      ? easyRead && listing.easyDescription
          ? listing.easyDescription
          : listing.description
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

  // Only consumers can book; providers can still view the listing.
  const isProvider = useAuthStore((s) => s.user?.userType) === "PROVIDER";

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
      error={
        error ? (error instanceof Error ? error.message : error.detail) : null
      }
      description={description ?? undefined}
      availableToday={availableToday}
      nextAvailableDate={nextAvailableDate}
      otherListings={otherListings}
      publicVerifiedCredentials={publicCredentialsData?.items ?? []}
      onBookNow={() =>
        navigate({ to: "/listings/$listingId/book", params: { listingId } })
      }
      canBook={!isProvider}
      onMessage={handleMessage}
      canMessage={!isOwnListing && canStartListingChat(listing)}
      messagePending={createChat.isPending}
      messageError={messageError}
    />
  );
}
