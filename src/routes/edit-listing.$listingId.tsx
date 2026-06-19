import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  EditListing,
  type EditListingDetails,
  type EditListingFormValues,
  type EditListingImage,
  type EditListingServiceTag,
  type EditListingStatusAction,
} from "../components/EditListing";
import {
  deleteListing,
  deleteListingMedia,
  getServiceTags,
  getAuthorListing,
  updateListing,
  uploadListingMedia,
  pauseListing,
  publishListing,
  resumeListing,
} from "../api/mira";
import { useAuthStore } from "../stores/auth";
import type { ProblemDetailsResponse } from "../api/model";

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute("/edit-listing/$listingId")({
  component: EditListingPage,
});

function getProblemDetail(data: unknown): string | undefined {
  return (data as Partial<ProblemDetailsResponse> | null)?.detail;
}

function toEditListingDetails(listing: EditListingDetails): EditListingDetails {
  return {
    ...listing,
    media: listing.media ?? [],
  };
}

export function EditListingPage() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;
  const [listing, setListing] = useState<EditListingDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<EditListingServiceTag[]>(
    [],
  );
  const [tagsLoading, setTagsLoading] = useState(true);

  const refreshListing = useCallback(async (): Promise<EditListingDetails> => {
    if (!userId) throw new Error("You must be signed in to edit this listing.");

    const response = await getAuthorListing(
      userId,
      listingId,
    );

    if (response.status !== 200) {
      throw new Error(
        getProblemDetail(response.data) ?? "Failed to load listing.",
      );
    }

    return toEditListingDetails(response.data);
  }, [listingId, userId]);

  const handleRefreshMedia = useCallback(async (): Promise<
    EditListingImage[]
  > => {
    const nextListing = await refreshListing();
    setListing(nextListing);
    return nextListing.media ?? [];
  }, [refreshListing]);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      if (!userId) return;

      try {
        const nextListing = await refreshListing();
        if (!cancelled) setListing(nextListing);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      }
    }

    void loadListing();

    return () => {
      cancelled = true;
    };
  }, [refreshListing, userId]);

  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      setTagsLoading(true);

      try {
        const response = await getServiceTags();
        if (!cancelled && response.status === 200) {
          setAvailableTags(response.data ?? []);
        }
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

  async function handleSubmit(values: EditListingFormValues) {
    const updateResponse = await updateListing(
      listingId,
      {
        title: values.title,
        description: values.description,
        price: values.price,
        tagIds: values.tagIds,
        location: values.location,
      },
    );

    if (updateResponse.status !== 200) {
      throw new Error(
        getProblemDetail(updateResponse.data) ??
          `Failed to save listing (${updateResponse.status}).`,
      );
    }

    if (values.imageFiles.length > 0) {
      const mediaResponse = await uploadListingMedia(
        listingId,
        { files: values.imageFiles },
      );

      if (mediaResponse.status !== 200) {
        throw new Error(
          getProblemDetail(mediaResponse.data) ??
            `Failed to upload listing media (${mediaResponse.status}).`,
        );
      }
    }

    await navigate({ to: "/my-listings" });
  }

  async function handleRemoveImage(mediaId: string) {
    const response = await deleteListingMedia(
      listingId,
      mediaId,
    );

    if (response.status !== 204) {
      throw new Error(
        getProblemDetail(response.data) ??
          "Failed to delete image. Please try again.",
      );
    }
  }

  async function handleStatusAction(action: EditListingStatusAction) {
    const actionMap = {
      publish: publishListing,
      pause: pauseListing,
      resume: resumeListing,
    };
    const response = await actionMap[action](listingId);

    if (response.status !== 200) {
      throw new Error(
        getProblemDetail(response.data) ??
          `Action failed (${response.status}).`,
      );
    }

    await navigate({ to: "/my-listings" });
  }

  async function handleDelete() {
    const response = await deleteListing(listingId);

    if (response.status !== 204) {
      throw new Error(
        getProblemDetail(response.data) ??
          `Failed to delete listing (${response.status}).`,
      );
    }

    await navigate({ to: "/my-listings" });
  }

  return (
    <EditListing
      listing={listing}
      loadError={loadError}
      availableTags={availableTags}
      tagsLoading={tagsLoading}
      onBack={() => navigate({ to: "/my-listings" })}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      onRemoveImage={handleRemoveImage}
      onStatusAction={handleStatusAction}
      onRefreshMedia={handleRefreshMedia}
    />
  );
}
