import type { PublicListingSummary } from '../api/model'

export type ProviderServiceTagSummary = {
  tagId: string
  name: string
  usageCount: number
  isBarrierefrei: boolean
  minPrice: number
}

export type ProviderServiceSummary = {
  serviceCount: number
  startingPrice: number | null
  topTags: ProviderServiceTagSummary[]
}

const MAX_TAGS = 4

export function summarizeProviderServices(listings: PublicListingSummary[]): ProviderServiceSummary {
  const serviceCount = listings.length
  const startingPrice = serviceCount === 0 ? null : Math.min(...listings.map(listing => listing.price))

  const tagsById = new Map<string, ProviderServiceTagSummary>()

  for (const listing of listings) {
    const seenInListing = new Set<string>()
    for (const tag of listing.tags) {
      if (seenInListing.has(tag.tagId)) continue
      seenInListing.add(tag.tagId)

      const existing = tagsById.get(tag.tagId)
      if (!existing) {
        tagsById.set(tag.tagId, {
          tagId: tag.tagId,
          name: tag.name,
          isBarrierefrei: tag.isBarrierefrei,
          usageCount: 1,
          minPrice: listing.price,
        })
      } else {
        existing.usageCount += 1
        existing.minPrice = Math.min(existing.minPrice, listing.price)
      }
    }
  }

  const topTags = [...tagsById.values()]
    .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name))
    .slice(0, MAX_TAGS)

  return { serviceCount, startingPrice, topTags }
}
