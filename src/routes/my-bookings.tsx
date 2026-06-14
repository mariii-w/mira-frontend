import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  getGetV1UsersUserIdBookingsQueryKey,
  getV1UsersUserIdBookings,
} from "../api/mira";
import type {
  ProblemDetailsResponse,
  UnauthorizedErrorResponse,
} from "../api/model";
import { MyBookings } from "../components/MyBookings";
import { get_access_token, useAuthStore } from "../stores/auth";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookingsRoute,
});

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
function MyBookingsRoute() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;

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

  return (
    <MyBookings
      bookings={data?.items ?? []}
      isProvider={user?.userType === "PROVIDER"}
      loading={loading}
      error={queryError ? (queryError as Error).message : null}
      onActionComplete={() => void refetch()}
    />
  );
}
