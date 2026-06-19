import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreateListing,
  type CreateListingFormValues,
  type ServiceTag,
} from "../components/CreateListing";
import {
  getServiceTags,
  createListing,
  uploadListingMedia,
} from "../api/mira";

export const Route = createFileRoute("/create-listing")({
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
        if (!cancelled) setAvailableTags(response.data.items);
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
    const response = await createListing({
      title: values.title,
      description: values.description,
      price: values.price,
      tagIds: values.tagIds,
      location: values.location,
    });

    if (response.status !== 201) {
      throw new Error(
        response.data.detail ??
          `Failed to create listing (${response.status}).`,
      );
    }

    if (values.imageFiles.length > 0) {
      const mediaResponse = await uploadListingMedia(
        response.data.listingId,
        {
          files: values.imageFiles,
        },
      );

      if (mediaResponse.status !== 200) {
        throw new Error(
          mediaResponse.data.detail ??
            `Failed to upload listing media (${mediaResponse.status}).`,
        );
      }
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
