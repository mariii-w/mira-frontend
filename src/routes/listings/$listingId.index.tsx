import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getGetPublicListingQueryKey,
  getGetPublicProfileListingsQueryKey,
  getGetAvailabilityQueryKey,
  getPublicListing,
  getPublicProfileListings,
  getAvailability,
} from "../../api/mira";
import { ListingDetailPage } from "../../components/ListingDetailPage";
import { useAccessibilityStore } from "../../stores/accessibility";

export const Route = createFileRoute("/listings/$listingId/")({
  component: ListingDetailRoute,
});

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// eslint-disable-next-line react-refresh/only-export-components
function ListingDetailRoute() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const easyRead = useAccessibilityStore((s) => s.easyRead);
  const today = toLocalDate(new Date());

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
    queryKey: getGetAvailabilityQueryKey(listingId, { from: today, to: today }),
    queryFn: async () => {
      const response = await getAvailability(listingId, { from: today, to: today });

      if (response.status !== 200) {
        throw new Error(response.data.detail ?? "Failed to load availability.");
      }

      return response.data;
    },
  });

  const description = listing
    ? (easyRead && listing.easyDescription ? listing.easyDescription : listing.description)
    : undefined;

  const availableToday = availability?.days.some(
    (day) => day.date === today && day.freeWindows.length > 0,
  );

  const otherListings = (otherListingsData?.items ?? []).filter(
    (item) => item.listingId !== listingId,
  );

  return (
    <ListingDetailPage
      listing={listing}
      loading={isLoading}
      error={error ? (error as Error).message : null}
      description={description ?? undefined}
      availableToday={availableToday}
      otherListings={otherListings}
      onBookNow={() =>
        navigate({ to: "/listings/$listingId/book", params: { listingId } })
      }
    />
  );
}
