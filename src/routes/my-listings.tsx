import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  getGetAuthorListingsQueryKey,
  getAuthorListings,
} from "../api/mira";
import type {
  GetAuthorListingsParams,
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../api/model";
import { MyListings, type StatusFilter } from "../components/MyListings";
import type { MyListingSummary } from "../components/MyListingCard";
import { useAuthStore } from "../stores/auth";
import { requireProvider } from "../lib/requireAuth";
import { usePageTitle } from "../lib/usePageTitle";

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute("/my-listings")({
  beforeLoad: requireProvider,
  component: MyListingsRoute,
});

function getErrorDetail(
  data: ProblemDetailsResponse | UnauthorizedErrorResponse,
) {
  return "detail" in data ? data.detail : undefined;
}

function getListingParams(
  statusFilter: StatusFilter,
  currentFrom: string | null,
): GetAuthorListingsParams {
  return {
    limit: 20,
    ...(currentFrom ? { from: currentFrom } : {}),
    ...(statusFilter !== "ALL" ? { publicationStatus: statusFilter } : {}),
  };
}

function getStatusCounts(listings: MyListingSummary[]) {
  const counts: Partial<Record<StatusFilter, number>> = {
    ALL: listings.length,
  };

  for (const listing of listings) {
    counts[listing.publicationStatus] =
      (counts[listing.publicationStatus] ?? 0) + 1;
  }

  return counts;
}

export function MyListingsRoute() {
  usePageTitle('My Services')
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;

  const [currentFrom, setCurrentFrom] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const params = getListingParams(statusFilter, currentFrom);

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: userId
      ? getGetAuthorListingsQueryKey(userId, params)
      : ["my-listings"],
    queryFn: async () => {
      if (!userId) throw new Error("You must be signed in to view services.");

      const response = await getAuthorListings(
        userId,
        params,
      );

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load listings.",
        );
      }

      return response.data;
    },
    enabled: !!userId,
    refetchOnMount: "always",
  });

  const { data: countsData } = useQuery({
    queryKey: userId
      ? getGetAuthorListingsQueryKey(userId, { limit: 100 })
      : ["my-listings", "counts"],
    queryFn: async () => {
      if (!userId) throw new Error("You must be signed in to view services.");

      const response = await getAuthorListings(
        userId,
        { limit: 100 },
      );

      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load listings.",
        );
      }

      return response.data;
    },
    enabled: !!userId,
    refetchOnMount: "always",
  });

  const hasPrev = prevCursors.length > 0;
  const nextCursor = data?.cursor?.next ?? null;

  function handleFilterChange(value: StatusFilter) {
    if (value === statusFilter) return;
    setPrevCursors([]);
    setCurrentFrom(null);
    setStatusFilter(value);
  }

  function handleNext() {
    if (!nextCursor) return;
    setPrevCursors((prev) => [...prev, currentFrom]);
    setCurrentFrom(nextCursor);
  }

  function handlePrev() {
    if (!hasPrev) return;
    const stack = prevCursors.slice();
    const from = stack.pop() ?? null;
    setPrevCursors(stack);
    setCurrentFrom(from);
  }

  return (
    <MyListings
      listings={data?.items ?? []}
      statusFilter={statusFilter}
      statusCounts={getStatusCounts(countsData?.items ?? [])}
      loading={loading}
      error={queryError ? (queryError as Error).message : null}
      hasPreviousPage={hasPrev}
      hasNextPage={!!nextCursor}
      onStatusFilterChange={handleFilterChange}
      onCreate={() => navigate({ to: "/create-listing" })}
      onEdit={(listingId) =>
        navigate({
          to: "/edit-listing/$listingId",
          params: { listingId },
        })
      }
      onNextPage={handleNext}
      onPreviousPage={handlePrev}
    />
  );
}
