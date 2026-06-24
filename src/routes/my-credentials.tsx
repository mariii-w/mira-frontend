import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  deleteV1UsersUserIdCredentialsCredentialId,
  getGetV1CredentialsQueryKey,
  getGetV1UsersUserIdCredentialsQueryKey,
  getV1Credentials,
  getV1UsersUserIdCredentials,
  getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId,
  patchV1UsersUserIdCredentialsCredentialId,
  postV1UsersUserIdCredentials,
  postV1UsersUserIdCredentialsCredentialIdVerifications,
} from "../api/mira";
import type { CredentialResponse, CredentialType, CredentialVerificationResponse } from "../api/model";
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

function isTerminalVerification(verification?: CredentialVerificationResponse) {
  return verification?.status === "COMPLETED" || verification?.status === "FAILED";
}

function getVerificationStatusMessage(verification: CredentialVerificationResponse) {
  if (verification.status === "COMPLETED") {
    return verification.result === "APPROVED"
      ? "Credential approved."
      : "Credential verification completed.";
  }

  return "Credential verification failed.";
}

function findCredentialVerification(
  credentials: CredentialResponse[] | undefined,
  credentialId: string,
) {
  return credentials?.find((credential) => credential.credentialId === credentialId)
    ?.latestVerification;
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
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [activeVerification, setActiveVerification] = useState<{
    credentialId: string;
    verificationId: string;
  } | null>(null);

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
    refetchInterval: activeVerification ? 3000 : false,
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
    mutationFn: async ({
      credentialType,
      file,
    }: {
      credentialType: CredentialType;
      file: File;
    }) => {
      setSubmissionStatus("Submitting credential...");
      const submitResponse = await postV1UsersUserIdCredentials(userId ?? "", {
        credentialType,
        file,
      });
      if (submitResponse.status !== 201) {
        return { submitResponse, verificationResponse: null };
      }

      setSubmissionStatus("Credential submitted.");
      const verificationResponse =
        await postV1UsersUserIdCredentialsCredentialIdVerifications(
          userId ?? "",
          submitResponse.data.credentialId,
        );

      if (verificationResponse.status === 202) {
        setSubmissionStatus("Verification started.");
        setActiveVerification({
          credentialId: submitResponse.data.credentialId,
          verificationId: verificationResponse.data.verificationId,
        });
      }

      return { submitResponse, verificationResponse };
    },
    onSuccess: (response) => {
      if (isSuccessStatus(response.submitResponse.status)) {
        setSubmitOpen(false);
        queryClient.invalidateQueries({ queryKey: credentialsQueryKey });
      }
    },
  });

  const verificationQuery = useQuery({
    queryKey: [
      "credential-verification",
      userId,
      activeVerification?.credentialId,
      activeVerification?.verificationId,
    ],
    queryFn: async () => {
      if (!userId || !activeVerification) {
        throw new Error("Missing verification context.");
      }
      const response =
        await getV1UsersUserIdCredentialsCredentialIdVerificationsVerificationId(
          userId,
          activeVerification.credentialId,
          activeVerification.verificationId,
        );
      if (response.status !== 200) {
        throw new Error(
          getErrorDetail(response.data) ?? "Failed to load verification status.",
        );
      }
      return response.data;
    },
    enabled: !!userId && !!activeVerification,
    refetchInterval: activeVerification ? 3000 : false,
  });

  useEffect(() => {
    const verification = verificationQuery.data;
    if (!verification || !isTerminalVerification(verification)) return;

    setSubmissionStatus(getVerificationStatusMessage(verification));
    setActiveVerification(null);
    queryClient.invalidateQueries({ queryKey: credentialsQueryKey });
  }, [credentialsQueryKey, queryClient, verificationQuery.data]);

  useEffect(() => {
    if (!activeVerification) return;

    const verification = findCredentialVerification(
      data?.items,
      activeVerification.credentialId,
    );
    if (!verification || !isTerminalVerification(verification)) return;

    setSubmissionStatus(getVerificationStatusMessage(verification));
    setActiveVerification(null);
  }, [activeVerification, data?.items]);

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
    : submitMutation.data && !isSuccessStatus(submitMutation.data.submitResponse.status)
      ? getErrorDetail(submitMutation.data.submitResponse.data) ??
        "Failed to submit credential."
      : submitMutation.data?.verificationResponse &&
          !isSuccessStatus(submitMutation.data.verificationResponse.status)
        ? getErrorDetail(submitMutation.data.verificationResponse.data) ??
          "Credential submitted, but verification could not be started."
      : null;

  return (
    <>
      <Credentials
        userId={userId ?? ""}
        credentials={data?.items ?? []}
        loading={loading}
        error={queryError ? (queryError as Error).message : null}
        submissionStatus={submissionStatus}
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
