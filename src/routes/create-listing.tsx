import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreateListing,
  type CreateListingFormValues,
} from "../components/CreateListing";
import {
  getServiceTags,
  getCreateListingUrl,
  publishListing,
} from "../api/mira";
import { authFetch, type FetchResponse } from "../lib/authFetch";
import { createListingActions } from "../lib/createListingActions";
import { requireProvider } from "../lib/requireAuth";
import type {
  ListingDetails,
  ProblemDetailsResponse,
  ServiceTag,
} from "../api/model";

export const Route = createFileRoute("/create-listing")({
  beforeLoad: requireProvider,
  component: CreateListingPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function CreateListingPage() {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState<ServiceTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [actions] = useState(() =>
    createListingActions<CreateListingFormValues>({
      createDraft,
      publishDraft,
      onComplete: async () => {
        await navigate({ to: "/my-listings" });
      },
    }),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      setTagsLoading(true);

      try {
        const response = await getServiceTags();
        if (!cancelled) setAvailableTags(response.data ?? []);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        if (!cancelled) setTagsLoading(false);
      }
    }

    void loadTags();

    return () => {
      cancelled = true;
    };
  }, []);

  async function createDraft(values: CreateListingFormValues): Promise<string> {
    // POST /v1/listings is multipart: a JSON `listing` part + `files`.
    // The generated createListing serialises the listing part as text/plain,
    // which the backend's @RequestPart rejects, so we build the FormData here
    // with the listing part typed application/json and post it via authFetch
    // (which attaches the bearer token). Do NOT set Content-Type — the browser
    // adds the multipart boundary.
    const formData = new FormData();
    formData.append(
      "listing",
      new Blob(
        [
          JSON.stringify({
            title: values.title,
            description: values.description,
            price: values.price,
            tagIds: values.tagIds,
            location: values.location,
          }),
        ],
        { type: "application/json" },
      ),
    );
    for (const file of values.imageFiles) {
      formData.append("files", file);
    }

    const response = await authFetch<
      FetchResponse<ListingDetails | ProblemDetailsResponse>
    >(getCreateListingUrl(), { method: "POST", body: formData });

    if (response.status !== 201) {
      throw new Error(
        problemDetail(response.data) ??
          `Failed to create listing (${response.status}).`,
      );
    }

    return (response.data as ListingDetails).listingId;
  }

  async function publishDraft(listingId: string): Promise<void> {
    const response = await publishListing(listingId);

    if (response.status !== 200) {
      throw new Error(
        problemDetail(response.data) ??
          `Failed to publish listing (${response.status}).`,
      );
    }
  }

  return (
    <CreateListing
      availableTags={availableTags}
      tagsLoading={tagsLoading}
      onBack={() => navigate({ to: "/my-listings" })}
      onSave={actions.save}
      onPublish={actions.publish}
    />
  );
}

function problemDetail(data: unknown): string | undefined {
  return (data as Partial<ProblemDetailsResponse> | null)?.detail;
}
