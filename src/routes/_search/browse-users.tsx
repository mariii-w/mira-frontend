import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchBar } from '../../components/SearchBar'
import { Breadcrumb } from '../../components/BreadCrumb'
import { Pagination } from '../../components/Pagination'
import { UserCard } from '../../components/UserCard'
import { useAccessibilityStore } from '../../stores/accessibility'
import { mediaUrl } from '../../lib/mediaUrl'
import { getPublicProfilesCollection } from '../../api/mira'
import type { GetPublicProfilesCollectionParams } from '../../api/model'

// Types

type PublicProfileSummary = {
  userId: string
  username: string
  firstName: string | null
  lastName: string | null
  userType: string | null
  bio: string | null
  simplifiedBio: string | null
  selfSummary: string | null
  accessibilityPreferences: string[]
  profileMedia: { url: string } | null
}

type PublicProfileCollectionResponse = {
  items: PublicProfileSummary[]
  cursor: { limit: number; next: string | null }
}

// Schema

const browseUsersSchema = z.object({
  q: z.string().catch(''),
  from: z.string().uuid().optional().catch(undefined),
})

type BrowseUsersParams = z.infer<typeof browseUsersSchema>

// Route

export const Route = createFileRoute('/_search/browse-users')({
  validateSearch: browseUsersSchema,
  component: BrowseUsersPage,
})

// Helpers — the profiles endpoint supports only free-text + cursor pagination.

function toProfilesParams(params: BrowseUsersParams): GetPublicProfilesCollectionParams {
  const freeQuery = params.q.trim()
  return {
    limit: 20,
    ...(freeQuery ? { 'free-query': freeQuery } : {}),
    ...(params.from ? { from: params.from } : {}),
  }
}

async function fetchPublicProfiles(params: BrowseUsersParams): Promise<PublicProfileCollectionResponse> {
  const response = await getPublicProfilesCollection(toProfilesParams(params))
  if (response.status !== 200) throw new Error('Users could not be loaded.')
  return response.data as unknown as PublicProfileCollectionResponse
}

// Browse Users Page

export function BrowseUsersPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/browse-users' })
  const easyRead = useAccessibilityStore(state => state.easyRead)

  const [pendingQuery, setPendingQuery] = useState(search.q)
  const [prevCursors, setPrevCursors] = useState<(string | undefined)[]>([])

  const profilesQuery = useQuery({
    queryKey: ['public-profiles', search],
    queryFn: () => fetchPublicProfiles(search),
  })

  const profiles = profilesQuery.data?.items ?? []
  const nextCursor = profilesQuery.data?.cursor.next ?? null
  const hasPrev = prevCursors.length > 0

  function commitSearch() {
    setPrevCursors([])
    navigate({ search: { q: pendingQuery, from: undefined } })
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

            {/* Results header */}
            <div>
              <h1 className="font-heading text-h1 font-bold text-foreground">
                {search.q ? `Users matching "${search.q}"` : 'Users'}
              </h1>
              <p className="text-small text-muted mt-1">Showing public profiles</p>
            </div>

            {/* Loading */}
            {profilesQuery.isLoading && (
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
            {profilesQuery.isSuccess && profiles.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-body text-muted">No users found.</p>
              </div>
            )}

            {/* Results list */}
            {profilesQuery.isSuccess && profiles.length > 0 && (
              <>
                <ul role="list" aria-label="User results" className="grid grid-cols-1 lg:grid-cols-2 gap-4 list-none m-0 p-0">
                  {profiles.map((profile) => (
                    <li key={profile.userId}>
                      <UserCard
                        userId={profile.userId}
                        username={profile.username}
                        firstName={profile.firstName}
                        lastName={profile.lastName}
                        userType={profile.userType}
                        bio={(easyRead && profile.simplifiedBio ? profile.simplifiedBio : profile.bio) ?? undefined}
                        selfSummary={profile.selfSummary ?? undefined}
                        profileMediaUrl={profile.profileMedia ? mediaUrl(profile.profileMedia.url) : undefined}
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
    </>
  )
}
