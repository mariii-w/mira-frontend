import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wrench, Users } from 'lucide-react'
import { Navbar } from '../../components/Navbar'
import { SearchBar } from '../../components/SearchBar'
import { ServiceUserToggle } from '../../components/ServiceUserToggle'
import { Breadcrumb } from '../../components/BreadCrumb'
import { Pagination } from '../../components/Pagination'
import { UserCard } from '../../components/UserCard'
import { useAccessibilityStore } from '../../stores/accessibility'

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

// Helpers

function toBrowseUsersQuery(params: BrowseUsersParams): URLSearchParams {
  const queryParams = new URLSearchParams({ limit: '20' })
  const freeQuery = params.q.trim()
  if (freeQuery) queryParams.set('q', freeQuery)
  if (params.from) queryParams.set('from', params.from)
  return queryParams
}

async function fetchPublicProfiles(params: BrowseUsersParams): Promise<PublicProfileCollectionResponse> {
  const response = await fetch(`/v1/public-profiles?${toBrowseUsersQuery(params)}`)
  if (!response.ok) throw new Error('Users could not be loaded.')
  return response.json()
}

// Browse Users Page

export function BrowseUsersPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/browse-users' })
  const navigateToRoute = useNavigate()
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
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background">

        {/* ── Search bar row ── */}
        <div className="bg-background px-6 py-3">
          <div className="mx-auto max-w-6xl flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex justify-center lg:block lg:shrink-0 lg:w-64">
              <ServiceUserToggle
                id="browse-toggle"
                labelLeft="Services"
                labelRight="Users"
                iconLeft={<Wrench />}
                iconRight={<Users />}
                checked={true}
                onCheckedChange={(checked) => { if (!checked) navigateToRoute({ to: '/browse-services', search: { q: search.q, city: '', tagIds: [], from: undefined } }) }}
              />
            </div>
            <SearchBar
              className="flex-1"
              placeholder="Search for a user…"
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
              <p className="text-small text-muted mt-1">Sorted by relevance</p>
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
                <ul role="list" aria-label="User results" className="flex flex-col gap-4 list-none m-0 p-0">
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
                        profileMediaUrl={profile.profileMedia?.url}
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
      </main>
    </>
  )
}
