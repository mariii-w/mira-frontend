import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getGetPublicListingQueryKey,
  getGetPublicProfileListingsQueryKey,
  getGetAvailabilityQueryKey,
  getGetPublicProfileCredentialsQueryKey,
  getPublicListing,
  getPublicProfileCredentials,
  getPublicProfileListings,
  getAvailability,
} from "../../../api/mira";
import { ListingDetailPage } from "../../../components/ListingDetailPage";
import { useAccessibilityStore } from "../../../stores/accessibility";

export const Route = createFileRoute("/_app/listings/$listingId/")({
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

  const { data: publicCredentialsData } = useQuery({
    queryKey: getGetPublicProfileCredentialsQueryKey(queryAuthorId),
    queryFn: async () => {
      const response = await getPublicProfileCredentials(queryAuthorId);

      if (response.status === 404) {
        return { items: [] };
      }

      if (response.status !== 200) {
        throw new Error(response.data.detail ?? "Failed to load provider credentials.");
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

  return (
    <ListingDetailPage
      listing={listing}
      loading={isLoading}
      error={error ? (error as Error).message : null}
      description={description ?? undefined}
      availableToday={availableToday}
      nextAvailableDate={nextAvailableDate}
      otherListings={otherListings}
      publicVerifiedCredentials={publicCredentialsData?.items ?? []}
      onBookNow={() =>
        navigate({ to: "/listings/$listingId/book", params: { listingId } })
      }
    />
  );
}
