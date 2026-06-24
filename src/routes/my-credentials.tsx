import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  deleteV1UsersUserIdCredentialsCredentialId,
  getGetV1CredentialsQueryKey,
  getGetV1UsersUserIdCredentialsQueryKey,
  getV1Credentials,
  getV1UsersUserIdCredentials,
  patchV1UsersUserIdCredentialsCredentialId,
  postV1UsersUserIdCredentials,
} from "../api/mira";
import type { CredentialType } from "../api/model";
import { Credentials } from "../components/Credentials";
import { SubmitCredentialModal } from "../components/SubmitCredentialModal";
import { useAuthStore } from "../stores/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute("/my-credentials")({
  component: MyCredentialsRoute,
});

function getErrorDetail(data: unknown): string | undefined {
  return typeof data === "object" && data !== null && "detail" in data
    ? String((data as { detail?: unknown }).detail)
    : undefined;
}

function isSuccessStatus(status: number) {
  return status >= 200 && status < 300;
}

export function MyCredentialsRoute() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<
    string | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const credentialsQueryKey = userId
    ? getGetV1UsersUserIdCredentialsQueryKey(userId)
    : ["my-credentials"];

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: credentialsQueryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error("You must be signed in to view credentials.");
      }
      const response = await getV1UsersUserIdCredentials(userId);
      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load credentials.",
        );
      }
      return response.data;
    },
    enabled: !!userId,
    refetchOnMount: "always",
  });

  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: getGetV1CredentialsQueryKey(),
    queryFn: async () => {
      const response = await getV1Credentials();
      if (response.status !== 200) {
        throw new Error("Failed to load credential types.");
      }
      return response.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({
      credentialType,
      file,
    }: {
      credentialType: CredentialType;
      file: File;
    }) => postV1UsersUserIdCredentials(userId ?? "", { credentialType, file }),
    onSuccess: (response) => {
      if (isSuccessStatus(response.status)) {
        setSubmitOpen(false);
        queryClient.invalidateQueries({ queryKey: credentialsQueryKey });
      }
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({
      credentialId,
      isVisible,
    }: {
      credentialId: string;
      isVisible: boolean;
    }) =>
      patchV1UsersUserIdCredentialsCredentialId(userId ?? "", credentialId, {
        isVisible,
      }),
    onMutate: ({ credentialId }) => setUpdatingVisibilityId(credentialId),
    onSettled: () => setUpdatingVisibilityId(null),
    onSuccess: (response) => {
      if (isSuccessStatus(response.status)) {
        queryClient.invalidateQueries({ queryKey: credentialsQueryKey });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (credentialId: string) =>
      deleteV1UsersUserIdCredentialsCredentialId(userId ?? "", credentialId),
    onMutate: (credentialId: string) => setDeletingId(credentialId),
    onSettled: () => setDeletingId(null),
    onSuccess: (response) => {
      if (isSuccessStatus(response.status)) {
        queryClient.invalidateQueries({ queryKey: credentialsQueryKey });
      }
    },
  });

  const submitErrorMessage = submitMutation.isError
    ? "Failed to submit credential."
    : submitMutation.data && !isSuccessStatus(submitMutation.data.status)
      ? getErrorDetail(submitMutation.data.data) ??
        "Failed to submit credential."
      : null;

  return (
    <>
      <Credentials
        userId={userId ?? ""}
        credentials={data?.items ?? []}
        loading={loading}
        error={queryError ? (queryError as Error).message : null}
        updatingVisibilityId={updatingVisibilityId}
        deletingId={deletingId}
        onAddCredential={() => setSubmitOpen(true)}
        onVisibilityChange={(credentialId, isVisible) =>
          visibilityMutation.mutate({ credentialId, isVisible })
        }
        onDelete={(credentialId) => deleteMutation.mutate(credentialId)}
      />
      <SubmitCredentialModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        credentialTypes={catalogData?.items ?? []}
        catalogLoading={catalogLoading}
        isSubmitting={submitMutation.isPending}
        errorMessage={submitErrorMessage}
        onSubmit={(credentialType, file) =>
          submitMutation.mutate({ credentialType, file })
        }
      />
    </>
  );
}
