import { useQuery } from "@tanstack/react-query";
import type { QueryFunctionContext } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  getGetPrivateUserProfileQueryKey,
  getPrivateUserProfile,
} from "../../api/mira";
import type { PrivateUserProfileResponse } from "../../api/model";
import { RegisterDone } from "../../components/RegisterDone";
import { createPageMeta } from "../../lib/headers";
import { useAuthStore } from "../../stores/auth";

export const Route = createFileRoute("/register/done")({
  head: () =>
    createPageMeta({
      title: "Registration Complete",
      description: "Finish Mira registration and continue to your next step.",
      path: "/register/done",
    }),
  component: RegisterDoneRoute,
});

function getAuthedPrivateUserProfileQueryOptions(userId: string | undefined) {
  return {
    queryKey: getGetPrivateUserProfileQueryKey(userId ?? ""),
    enabled: !!userId,
    queryFn: async ({
      signal,
    }: QueryFunctionContext): Promise<PrivateUserProfileResponse> => {
      if (!userId) throw new Error("Not logged in.");

      const response = await getPrivateUserProfile(userId, { signal });
      if (response.status !== 200) throw new Error("Failed to load profile.");

      return response.data;
    },
  };
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterDoneRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const userId = user?.userId;

  const { data } = useQuery(getAuthedPrivateUserProfileQueryOptions(userId));

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  return (
    <RegisterDone
      user={data ?? user}
      onContinue={() =>
        navigate({
          to:
            (data ?? user)?.userType === "PROVIDER"
              ? "/calendar"
              : "/browse-services",
        })
      }
    />
  );
}
