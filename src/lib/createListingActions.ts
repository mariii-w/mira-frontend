interface CreateListingActionDependencies<TValues> {
  createDraft: (values: TValues) => Promise<string>;
  publishDraft: (listingId: string) => Promise<void>;
  onComplete: () => Promise<void>;
}

export function createListingActions<TValues>({
  createDraft,
  publishDraft,
  onComplete,
}: CreateListingActionDependencies<TValues>) {
  let draftId: string | null = null;

  async function ensureDraft(values: TValues): Promise<string> {
    if (!draftId) {
      draftId = await createDraft(values);
    }
    return draftId;
  }

  return {
    async save(values: TValues) {
      await ensureDraft(values);
      await onComplete();
    },

    async publish(values: TValues) {
      const listingId = await ensureDraft(values);

      try {
        await publishDraft(listingId);
      } catch {
        throw new Error(
          "Service was saved as a draft, but could not be published.",
        );
      }

      await onComplete();
    },
  };
}
