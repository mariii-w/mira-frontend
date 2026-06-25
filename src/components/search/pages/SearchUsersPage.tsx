import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle.ts'
import { useQueries, useQuery } from '@tanstack/react-query'
import { SearchBar } from '../SearchBar.tsx'
import { Breadcrumb } from '../../BreadCrumb.tsx'
import { Pagination } from '../../Pagination.tsx'
import { UserCard } from '../cards/UserCard.tsx'
import { UserTypeFilter } from '../UserTypeFilter.tsx'
import { useAccessibilityStore } from '../../../stores/accessibility.ts'
import { getPublicListings, getPublicProfilesCollection } from '../../../api/mira.ts'
import { summarizeProviderServices } from '../../../lib/providerServiceSummary.ts'
import type { GetPublicProfilesCollectionParams, PublicListingSummary, PublicProfileCollectionResponse } from '../../../api/model'
import type { ProviderServiceSummary } from '../../../lib/providerServiceSummary.ts'
import type { BrowseUsersSearch, UserRoleFilter } from '../searchSchemas.ts'

const routeApi = getRouteApi('/_search/browse-users')
const LISTINGS_PAGE_SIZE = 500

// Helpers — the profiles endpoint supports only free-text + cursor pagination.

function toProfilesParams(params: BrowseUsersSearch): GetPublicProfilesCollectionParams {
  const freeQuery = params.q.trim()
  return {
    limit: 20,
    ...(freeQuery ? { 'free-query': freeQuery } : {}),
    ...(params.from ? { from: params.from } : {}),
  }
}

async function fetchPublicProfiles(params: BrowseUsersSearch): Promise<PublicProfileCollectionResponse> {
  const response = await getPublicProfilesCollection(toProfilesParams(params))
  if (response.status !== 200) throw new Error('Users could not be loaded.')
  return response.data
}

async function fetchAllProviderListings(userId: string): Promise<PublicListingSummary[]> {
  const items: PublicListingSummary[] = []
  // Guards against infinite loops if the backend ever returns a repeated cursor.next value (e.g., a cycle).
  const seenCursors = new Set<string>()
  let from: string | undefined

  for (;;) {
    const response = await getPublicListings({ userId, limit: LISTINGS_PAGE_SIZE, ...(from ? { from } : {}) })
    if (response.status !== 200) throw new Error('Provider services could not be loaded.')

    items.push(...response.data.items)
    const next = response.data.cursor?.next ?? null
    if (!next || seenCursors.has(next)) break

    seenCursors.add(next)
    from = next
  }

  return items
}

// Browse Users Page

export function SearchUsersPage() {
  usePageTitle('Browse Users')
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: '/browse-users' })
  const easyRead = useAccessibilityStore(state => state.easyRead)

  const [pendingQuery, setPendingQuery] = useState(search.q)
  const [prevCursors, setPrevCursors] = useState<(string | undefined)[]>([])

  const profilesQuery = useQuery({
    queryKey: ['public-profiles', { q: search.q, from: search.from }],
    queryFn: () => fetchPublicProfiles(search),
  })

  const profiles = profilesQuery.data?.items ?? []
  const providers = profiles.filter(profile => profile.userType === 'PROVIDER')
  const consumers = profiles.filter(profile => profile.userType !== 'PROVIDER')
  const visibleProfiles = search.role === 'providers'
    ? providers
    : search.role === 'consumers'
      ? consumers
      : profiles
  const nextCursor = profilesQuery.data?.cursor.next ?? null
  const hasPrev = prevCursors.length > 0

  // Enrichment is fetched for every provider on the current page, regardless of the
  // selected role tab — switching tabs is a client-side filter with no refetch, so
  // prefetching everyone up front keeps tab switching instant with no loading state.
  const enrichmentQueries = useQueries({
    queries: providers.map(provider => ({
      queryKey: ['provider-listings', provider.userId],
      queryFn: () => fetchAllProviderListings(provider.userId),
    })),
  })
  const enrichmentPending = enrichmentQueries.some(query => query.isPending)
  const cardsLoading = profilesQuery.isLoading || (profilesQuery.isSuccess && enrichmentPending)
  const resultsReady = profilesQuery.isSuccess && !enrichmentPending

  const providerSummaries = new Map<string, ProviderServiceSummary>()
  providers.forEach((provider, index) => {
    const listings = enrichmentQueries[index].data
    if (listings) providerSummaries.set(provider.userId, summarizeProviderServices(listings))
  })

  function commitSearch() {
    setPrevCursors([])
    navigate({ search: { q: pendingQuery, role: search.role, from: undefined } })
  }

  function handleRoleChange(role: UserRoleFilter) {
    navigate({ search: { ...search, role } })
  }

  function handleNext() {
    if (!nextCursor) return
    setPrevCursors(prev => [...prev, search.from])
    navigate({ search: { ...search, from: nextCursor } })
  }

  function handlePrev() {
    if (!hasPrev) return
    const stack = prevCursors.slice()
    const previousCursor = stack.pop()
    setPrevCursors(stack)
    navigate({ search: { ...search, from: previousCursor } })
  }

  const breadcrumbLinks = [
    { name: 'Home', href: '/' },
    { name: 'Users', href: '/browse-users' },
    ...(search.q ? [{ name: search.q, href: `/browse-users?q=${encodeURIComponent(search.q)}` }] : []),
  ]

  return (
    <>
      {/* ── Search bar row ── */}
      <div className="bg-background px-6 py-3">
        <div className="mx-auto max-w-6xl">
            <SearchBar
              placeholder="Search by name or username…"
              showLocation={false}
              value={pendingQuery}
              onChange={(e) => setPendingQuery(e.target.value)}
              onSearch={commitSearch}
              onKeyDown={(e) => { if (e.key === 'Enter') commitSearch() }}
            />
        </div>
      </div>

        {/* ── Breadcrumb row ── */}
        <div className="bg-background px-6 py-2">
          <div className="mx-auto max-w-6xl flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-20">
            <div className="lg:shrink-0 lg:w-64">
              <Breadcrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6">
          <div className="mx-auto max-w-6xl pt-1 pb-6 lg:py-6 flex flex-col gap-4">

            {profilesQuery.isSuccess ? (
              <UserTypeFilter
                selected={search.role}
                providerCount={providers.length}
                consumerCount={consumers.length}
                onChange={handleRoleChange}
              />
            ) : (
              <div>
                <h1 className="font-heading text-h1 font-bold text-foreground">Users</h1>
                <p className="text-body text-foreground mt-1">Showing public profiles</p>
              </div>
            )}

            <main
              id="main-content"
              tabIndex={-1}
              aria-label="Users"
              className="flex flex-col gap-4 focus-visible:outline-none"
            >
            {/* Loading */}
            {cardsLoading && (
              <div role="status" aria-live="polite" className="flex justify-center py-16">
                <p className="text-small text-muted">Loading…</p>
              </div>
            )}

            {/* Error */}
            {profilesQuery.isError && (
              <p role="alert" className="text-small text-red-600">
                {(profilesQuery.error as Error).message}
              </p>
            )}

            {/* Empty */}
            {resultsReady && profiles.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-body text-muted">No users found.</p>
              </div>
            )}

            {resultsReady && profiles.length > 0 && visibleProfiles.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-body text-muted">
                  {search.role === 'providers'
                    ? 'No providers on this page.'
                    : 'No consumers on this page.'}
                </p>
              </div>
            )}

            {/* Results list */}
            {resultsReady && visibleProfiles.length > 0 && (
                <ul role="list" className="grid grid-cols-1 lg:grid-cols-2 gap-4 list-none m-0 p-0">
                  {visibleProfiles.map((profile, index) => (
                    <li
                      key={profile.userId}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                    >
                      <UserCard profile={profile} easyRead={easyRead} providerSummary={providerSummaries.get(profile.userId)} />
                    </li>
                  ))}
                </ul>
            )}

            {resultsReady && profiles.length > 0 && (hasPrev || nextCursor) && (
              <Pagination
                onPrevious={handlePrev}
                onNext={handleNext}
                disablePrevious={!hasPrev}
                disableNext={!nextCursor}
                className="mt-2 flex justify-center"
              />
            )}
            </main>

          </div>
        </div>
    </>
  )
}
