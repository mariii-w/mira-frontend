import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { PrivateProfilePage } from '../components/PrivateProfilePage'
import { PublicProfilePage } from '../components/PublicProfilePage'
import { ProfilePageLoading, ProfilePageError } from '../components/ProfilePageLoadingError'
import { type ServiceCardProps } from '../components/ServiceCard'
import { useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import { mediaUrl } from '../lib/mediaUrl'

import {
  getPrivateUserProfile,
  getPublicProfile,
  getAuthorListings,
  getPublicProfileListings,
  getPublicProfileCredentials,
} from '../api/mira'
import type {
  MyListingCollectionResponse,
  MyListingSummary,
  PublicListingCollectionResponse,
  PublicListingSummary,
  PublicProfileResponse,
  VerifiedCredentialResponse,
} from '../api/model'

export const Route = createFileRoute('/profile/$userId')({
  component: ProfilePage,
})

/* eslint-disable react-refresh/only-export-components */
function ProfilePage() {
  const { userId } = Route.useParams()
  return <Profile userId={userId} />
}

function Profile({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.userId === userId

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId, isOwner],
    queryFn: async () => {
      if (isOwner) {
        const response = await getPrivateUserProfile(userId)
        if (response.status !== 200) throw response.data
        return response.data
      }
      const response = await getPublicProfile(userId)
      if (response.status !== 200) throw response.data
      return response.data
    },
  })

  const isProviderType = user?.userType === 'PROVIDER'

  const { data: listingsResponse } = useQuery<
    MyListingCollectionResponse | PublicListingCollectionResponse
  >({
    queryKey: ['listings', userId, isOwner, isProviderType],
    queryFn: async () => {
      if (!isProviderType) return { items: [], cursor: { limit: 0, next: null } }
      if (isOwner) {
        const response = await getAuthorListings(userId)
        if (response.status !== 200) throw response.data
        return response.data
      }
      const response = await getPublicProfileListings(userId)
      if (response.status !== 200) throw response.data
      return response.data
    },
    enabled: !!user && isProviderType,
  })

  const { data: credentialsResponse } = useQuery({
    queryKey: ['public-credentials', userId],
    queryFn: async () => {
      const response = await getPublicProfileCredentials(userId)
      if (response.status !== 200) return []
      return response.data.items
    },
    enabled: !isOwner && !!user,
  })

  if (isLoading) return <ProfilePageLoading />
  if (error) return <ProfilePageError />

  const pictureUrl = user?.profileMedia ? mediaUrl(user.profileMedia.url) : undefined
  const userFirstName = user?.firstName ?? ''
  const userLastName = user?.lastName ?? ''
  const selfSummary = user?.selfSummary ?? ''
  const city = user
    ? 'privateAddress' in user
      ? user.privateAddress?.city ?? ''
      : user.city ?? ''
    : ''

  if (isOwner) {
    const ownerListings: MyListingSummary[] = isProviderType
      ? ((listingsResponse?.items ?? []) as MyListingSummary[])
          .filter((l) => l.publicationStatus === 'ACTIVE')
          .slice(0, 5)
      : []

    return (
      <>
        <PrivateProfilePage
          userFirstName={userFirstName}
          userLastName={userLastName}
          selfSummary={selfSummary}
          bio={user?.bio ?? null}
          city={city}
          pictureUrl={pictureUrl}
          isProvider={isProviderType}
          ownerListings={ownerListings}
          onEditClick={() => navigate({ to: '/profile/$userId/edit', params: { userId } })}
          onEditListing={(listingId) => navigate({ to: '/edit-listing/$listingId', params: { listingId } })}
        />
        <Outlet />
      </>
    )
  }

  const credentials: VerifiedCredentialResponse[] = credentialsResponse ?? []
  const publicProfile = user as PublicProfileResponse | undefined
  const verified = publicProfile?.verified ?? false

  const publicServiceListings: ServiceCardProps[] = isProviderType
    ? ((listingsResponse?.items ?? []) as PublicListingSummary[]).map((listing) => ({
        link: `/listings/${listing.listingId}`,
        pictureLink: listing.primaryMedia ? mediaUrl(listing.primaryMedia.url) : undefined,
        pictureAltText: listing.primaryMedia?.altText,
        pictureAltTextStatus: listing.primaryMedia?.altTextStatus,
        location: `${listing.location.city}${listing.location.postalCode ? ', ' + listing.location.postalCode : ''}`,
        providerFirstName: listing.author.name,
        providerLastName: listing.author.surname,
        varified: verified,
        label: listing.title,
        description: listing.description,
        tags: listing.tags,
        hourRate: listing.price,
      }))
    : []

  return (
    <>
      <PublicProfilePage
        userFirstName={userFirstName}
        userLastName={userLastName}
        username={user?.username ?? ''}
        selfSummary={selfSummary}
        bio={user?.bio ?? null}
        simplifiedBio={user?.simplifiedBio ?? null}
        city={city}
        pictureUrl={pictureUrl}
        isProvider={isProviderType}
        verified={verified}
        credentials={credentials}
        publicServiceListings={publicServiceListings}
      />
      <Outlet />
    </>
  )
}
