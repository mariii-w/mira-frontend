import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Wrench, Users } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, type ServiceTagOption } from '../components/FilterBar'
import { ServiceCard } from '../components/ServiceCard'
import { ServiceProviderToggle } from '../components/ServiceProviderToggle'
import { Breadcrumb } from '../components/BreadCrumb'
import { Pagination } from '../components/Pagination'
import { FilterDrawer } from '../components/FilterDrawer'

// ─── API types ────────────────────────────────────────────────────────────────

type ServiceTag = {
  tagId: string
  name: string
  isBarrierefrei: boolean
  isActive: boolean
}

type ListingMediaItem = {
  mediaId: string
  position: number
  url: string
  altText: string | null
  altTextStatus: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  createdAt: string
}

type PublicListingSummary = {
  listingId: string
  tags: ServiceTag[]
  title: string
  description: string | null
  price: number
  author: { name: string; surname: string }
  publishedAt: string | null
  location: { city: string; postalCode: string; serviceRadiusKm: number }
  primaryMedia: ListingMediaItem | null
}

type PublicListingCollectionResponse = {
  items: PublicListingSummary[]
  cursor: { limit: number; next: string | null }
}

// ─── URL search params ────────────────────────────────────────────────────────

type SearchParams = {
  q: string
  city: string
  radius: number
  tagIds: string[]
  maxPrice: number
  from: string | undefined
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/search')({
  validateSearch: (raw: Record<string, unknown>): SearchParams => ({
    q: typeof raw.q === 'string' ? raw.q : '',
    city: typeof raw.city === 'string' ? raw.city : '',
    radius: typeof raw.radius === 'number' ? Math.max(1, Math.min(50, raw.radius)) : 20,
    tagIds: Array.isArray(raw.tagIds)
      ? (raw.tagIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [],
    maxPrice: typeof raw.maxPrice === 'number' ? raw.maxPrice : 100,
    from: typeof raw.from === 'string' ? raw.from : undefined,
  }),
  component: SearchPage,
})

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchPublicListings(params: SearchParams): Promise<PublicListingCollectionResponse> {
  const qs = new URLSearchParams({ limit: '20' })
  if (params.city) {
    qs.set('city', params.city)
    qs.set('radiusKm', String(params.radius))
  }
  if (params.maxPrice < 100) qs.set('maxPrice', String(params.maxPrice))
  for (const id of params.tagIds) qs.append('tagIds', id)
  if (params.from) qs.set('from', params.from)

  const res = await fetch(`/v1/public-listings?${qs.toString()}`)
  if (!res.ok) throw new Error('Listings could not be loaded.')
  return res.json()
}

async function fetchServiceTags(): Promise<ServiceTag[]> {
  const res = await fetch('/v1/service-tags')
  if (!res.ok) throw new Error('Tags could not be loaded.')
  return res.json()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function SearchPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/search' })

  // Pending filter state — committed to URL on "Apply" / "Search"
  const [pendingQuery, setPendingQuery] = useState(search.q)
  const [pendingCity, setPendingCity] = useState(search.city)
  const [pendingRadius, setPendingRadius] = useState(search.radius)
  const [pendingTagIds, setPendingTagIds] = useState<string[]>(search.tagIds)
  const [pendingMaxPrice, setPendingMaxPrice] = useState(search.maxPrice)

  // Queries
  const listingsQuery = useQuery({
    queryKey: ['public-listings', search],
    queryFn: () => fetchPublicListings(search),
  })

  const tagsQuery = useQuery({
    queryKey: ['service-tags'],
    queryFn: fetchServiceTags,
    staleTime: 1000 * 60 * 5,
  })

  const listings = listingsQuery.data?.items ?? []
  const nextCursor = listingsQuery.data?.cursor.next ?? null
  const allTags: ServiceTagOption[] = (tagsQuery.data ?? [])
    .filter(t => t.isActive)
    .map(t => ({ tagId: t.tagId, name: t.name }))

  // Pagination history
  const [prevCursors, setPrevCursors] = useState<(string | undefined)[]>([])
  const hasPrev = prevCursors.length > 0

  function commitSearch() {
    setPrevCursors([])
    navigate({
      search: {
        ...search,
        q: pendingQuery,
        city: pendingCity,
        radius: pendingRadius,
        from: undefined,
      },
    })
  }

  function commitFilters() {
    setPrevCursors([])
    navigate({
      search: {
        ...search,
        tagIds: pendingTagIds,
        maxPrice: pendingMaxPrice,
        from: undefined,
      },
    })
  }

  function handleNext() {
    if (!nextCursor) return
    setPrevCursors(prev => [...prev, search.from])
    navigate({ search: { ...search, from: nextCursor } })
  }

  function handlePrev() {
    if (!hasPrev) return
    const stack = prevCursors.slice()
    const from = stack.pop()
    setPrevCursors(stack)
    navigate({ search: { ...search, from } })
  }

  function handleTagToggle(tagId: string) {
    setPendingTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  function clearAllFilters() {
    setPendingTagIds([])
    setPendingMaxPrice(100)
    navigate({
      search: { ...search, tagIds: [], maxPrice: 100, from: undefined },
    })
  }

  // Active filter chips (applied state, not pending)
  const activeTagChips = search.tagIds
    .map(id => allTags.find(t => t.tagId === id))
    .filter((t): t is ServiceTagOption => !!t)

  const hasPriceFilter = search.maxPrice < 100
  const hasActiveFilters = activeTagChips.length > 0 || hasPriceFilter

  const activeCount = (search.tagIds.length > 0 ? 1 : 0) + (hasPriceFilter ? 1 : 0)

  // Breadcrumb
  const breadcrumbLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/search' },
    ...(search.q ? [{ name: search.q, href: `/search?q=${encodeURIComponent(search.q)}` }] : []),
  ]

  // Subtitle line
  const subtitleParts: string[] = []
  if (search.city) subtitleParts.push(`In ${search.city}`)
  if (search.city) subtitleParts.push(`Within ${search.radius} km`)
  subtitleParts.push('Sorted by relevance')

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background">

        {/* ── Search bar row ── */}
        <div className="bg-background px-6 py-3">
          <div className="mx-auto max-w-6xl flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex justify-center lg:block lg:shrink-0 lg:w-64">
              <ServiceProviderToggle
                id="search-toggle"
                labelLeft="Services"
                labelRight="Providers"
                iconLeft={<Wrench />}
                iconRight={<Users />}
                checked={false}
                onCheckedChange={() => {}}
              />
            </div>
            <SearchBar
              className="flex-1"
              placeholder="What are you looking for?"
              value={pendingQuery}
              onChange={(e) => setPendingQuery(e.target.value)}
              city={pendingCity}
              radius={pendingRadius}
              onCityChange={setPendingCity}
              onRadiusChange={setPendingRadius}
              onSearch={commitSearch}
              onKeyDown={(e) => { if (e.key === 'Enter') commitSearch() }}
            />
          </div>
        </div>

        {/* ── Breadcrumb + active filter chips row ── */}
        <div className="bg-background px-6 py-2">
          <div className="mx-auto max-w-6xl flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-20">
            <div className="lg:shrink-0 lg:w-64">
              <Breadcrumb links={breadcrumbLinks} />
            </div>

            {/* Active filter chips */}
            <div className="flex-1 min-w-0">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Active filters">
                {hasPriceFilter && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-small">
                    {search.maxPrice}€/h
                    <button
                      type="button"
                      aria-label="Remove price filter"
                      onClick={() => {
                        setPendingMaxPrice(100)
                        navigate({ search: { ...search, maxPrice: 100, from: undefined } })
                      }}
                      className="text-muted hover:text-foreground transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeTagChips.map(tag => (
                  <span key={tag.tagId} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-small">
                    {tag.name}
                    <button
                      type="button"
                      aria-label={`Remove filter "${tag.name}"`}
                      onClick={() => {
                        const next = search.tagIds.filter(id => id !== tag.tagId)
                        setPendingTagIds(next)
                        navigate({ search: { ...search, tagIds: next, from: undefined } })
                      }}
                      className="text-muted hover:text-foreground transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-small text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Clear all
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6">
        <div className="mx-auto max-w-6xl pt-1 pb-6 lg:py-6 flex gap-20 items-start">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:block shrink-0 w-64">
            <FilterBar
              tags={allTags}
              selectedTagIds={pendingTagIds}
              onTagToggle={handleTagToggle}
              distanceKm={pendingRadius}
              onDistanceChange={setPendingRadius}
              maxPrice={pendingMaxPrice}
              onMaxPriceChange={setPendingMaxPrice}
              onApply={commitFilters}
              resultCount={listingsQuery.isSuccess ? listings.length : undefined}
              activeCount={activeCount}
            />
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Results header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-heading text-h1 font-bold text-foreground">
                  {search.q ? `Services for "${search.q}"` : 'Services'}
                </h1>
                {subtitleParts.length > 0 && (
                  <p className="text-small text-muted mt-1">{subtitleParts.join(' · ')}</p>
                )}
              </div>
              <div className="lg:hidden shrink-0">
                <FilterDrawer
                  tags={allTags}
                  selectedTagIds={pendingTagIds}
                  onTagToggle={handleTagToggle}
                  distanceKm={pendingRadius}
                  onDistanceChange={setPendingRadius}
                  maxPrice={pendingMaxPrice}
                  onMaxPriceChange={setPendingMaxPrice}
                  onApply={commitFilters}
                  resultCount={listingsQuery.isSuccess ? listings.length : undefined}
                  activeCount={activeCount}
                />
              </div>
            </div>

            {/* Loading */}
            {listingsQuery.isLoading && (
              <div role="status" aria-live="polite" className="flex justify-center py-16">
                <p className="text-small text-muted">Loading…</p>
              </div>
            )}

            {/* Error */}
            {listingsQuery.isError && (
              <p role="alert" className="text-small text-red-600">
                {(listingsQuery.error as Error).message}
              </p>
            )}

            {/* Empty */}
            {listingsQuery.isSuccess && listings.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-body text-muted">No services found.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-small text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}

            {/* Results list */}
            {listingsQuery.isSuccess && listings.length > 0 && (
              <>
                <ul role="list" aria-label="Search results" className="flex flex-col gap-4 list-none m-0 p-0">
                  {listings.map((listing, index) => (
                    <li
                      key={listing.listingId}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                    >
                      <ServiceCard
                        link={`#`}
                        pictureLink={listing.primaryMedia?.url ?? undefined}
                        location={listing.location.city}
                        providerFirstName={listing.author.name}
                        providerLastName={listing.author.surname}
                        label={listing.title}
                        description={listing.description ?? undefined}
                        tags={listing.tags}
                        hourRate={listing.price}
                      />
                    </li>
                  ))}
                </ul>

                {(hasPrev || nextCursor) && (
                  <Pagination
                    onPrevious={handlePrev}
                    onNext={handleNext}
                    disablePrevious={!hasPrev}
                    disableNext={!nextCursor}
                    className="mt-2 flex justify-center"
                  />
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </main>
    </>
  )
}
