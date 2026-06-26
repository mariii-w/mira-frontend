import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreateListing,
  type CreateListingFormValues,
} from "../../components/CreateListing";
import { getServiceTags, getCreateListingUrl } from "../../api/mira";
import { authFetch } from "../../lib/authFetch";
import type { ServiceTag } from "../../api/model";

export const Route = createFileRoute("/_app/create-listing")({
  component: CreateListingPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function CreateListingPage() {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState<ServiceTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

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

  async function handleSubmit(values: CreateListingFormValues) {
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

    const response = await authFetch<{ status: number; data: { detail?: string } }>(
      getCreateListingUrl(),
      { method: "POST", body: formData },
    );

    if (response.status !== 201) {
      throw new Error(
        response.data.detail ??
          `Failed to create listing (${response.status}).`,
      );
    }

    await navigate({ to: "/my-listings" });
  }

  return (
    <CreateListing
      availableTags={availableTags}
      tagsLoading={tagsLoading}
      onBack={() => navigate({ to: "/my-listings" })}
      onSubmit={handleSubmit}
    />
  );
}
