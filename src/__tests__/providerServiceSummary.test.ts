import { describe, expect, it } from 'vitest'
import { summarizeProviderServices } from '../lib/providerServiceSummary'
import type { PublicListingSummary, ServiceTag } from '../api/model'

function tag(overrides: Partial<ServiceTag> = {}): ServiceTag {
  return { tagId: 'tag-1', name: 'Tag', isBarrierefrei: false, isActive: true, ...overrides }
}

function listing(overrides: Partial<PublicListingSummary> = {}): PublicListingSummary {
  return {
    listingId: 'listing-1',
    tags: [],
    title: 'Listing',
    price: 20,
    author: { name: 'Anna', surname: 'Schmidt' },
    publishedAt: null,
    location: { city: 'Berlin', postalCode: '10115', serviceRadiusKm: 10 },
    ...overrides,
  }
}

describe('summarizeProviderServices', () => {
  it('returns zero count and null price for no listings', () => {
    expect(summarizeProviderServices([])).toEqual({ serviceCount: 0, startingPrice: null, topTags: [] })
  })

  it('counts listings and finds the minimum price', () => {
    const result = summarizeProviderServices([
      listing({ listingId: 'l1', price: 30 }),
      listing({ listingId: 'l2', price: 18 }),
      listing({ listingId: 'l3', price: 25 }),
    ])
    expect(result.serviceCount).toBe(3)
    expect(result.startingPrice).toBe(18)
  })

  it('counts a tag at most once per listing even if repeated', () => {
    const repeated = tag({ tagId: 'wifi', name: 'Wi-Fi Setup' })
    const result = summarizeProviderServices([
      listing({ listingId: 'l1', price: 20, tags: [repeated, repeated] }),
    ])
    expect(result.topTags).toEqual([
      { tagId: 'wifi', name: 'Wi-Fi Setup', isBarrierefrei: false, usageCount: 1, minPrice: 20 },
    ])
  })

  it('tracks the minimum price among listings sharing a tag', () => {
    const wifi = tag({ tagId: 'wifi', name: 'Wi-Fi Setup' })
    const result = summarizeProviderServices([
      listing({ listingId: 'l1', price: 30, tags: [wifi] }),
      listing({ listingId: 'l2', price: 22, tags: [wifi] }),
    ])
    expect(result.topTags).toEqual([
      { tagId: 'wifi', name: 'Wi-Fi Setup', isBarrierefrei: false, usageCount: 2, minPrice: 22 },
    ])
  })

  it('sorts tags by usage count descending', () => {
    const common = tag({ tagId: 'common', name: 'Common' })
    const rare = tag({ tagId: 'rare', name: 'Rare' })
    const result = summarizeProviderServices([
      listing({ listingId: 'l1', price: 20, tags: [common, rare] }),
      listing({ listingId: 'l2', price: 20, tags: [common] }),
    ])
    expect(result.topTags.map(t => t.tagId)).toEqual(['common', 'rare'])
  })

  it('breaks usage ties alphabetically by name', () => {
    const zeta = tag({ tagId: 'z', name: 'Zeta Service' })
    const alpha = tag({ tagId: 'a', name: 'Alpha Service' })
    const result = summarizeProviderServices([
      listing({ listingId: 'l1', price: 20, tags: [zeta, alpha] }),
    ])
    expect(result.topTags.map(t => t.name)).toEqual(['Alpha Service', 'Zeta Service'])
  })

  it('caps the result at four tags', () => {
    const tags = Array.from({ length: 6 }, (_, i) => tag({ tagId: `t${i}`, name: `Tag ${i}` }))
    const result = summarizeProviderServices([listing({ listingId: 'l1', price: 20, tags })])
    expect(result.topTags).toHaveLength(4)
  })

  it('preserves the isBarrierefrei flag per tag', () => {
    const accessible = tag({ tagId: 'a11y', name: 'Accessible help', isBarrierefrei: true })
    const result = summarizeProviderServices([listing({ listingId: 'l1', price: 20, tags: [accessible] })])
    expect(result.topTags[0].isBarrierefrei).toBe(true)
  })
})
