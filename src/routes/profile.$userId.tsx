import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ProfilePageContent } from '../components/ProfilePageContent'
import { ProfilePageLoading, ProfilePageError } from '../components/ProfilePageLoadingError'
import {type ServiceCardEditProps } from '../components/ServiceCardEdit.tsx'
import { type ServiceCardProps } from '../components/ServiceCard'
import { ensureAuthInitialized, useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import { mediaUrl } from "../lib/mediaUrl";

import {
  getPrivateUserProfile,
  getPublicProfile,
  getAuthorListings,
  getPublicProfileListings,
} from "../api/mira";
import type {
  MyListingCollectionResponse,
  MyListingSummary,
  PublicListingCollectionResponse,
  PublicListingSummary,
} from '../api/model'


/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute('/profile/$userId')({
  component: ProfilePage
})

type ProfileProps = {
  isProvider?: boolean
  isVerified?: boolean
  userId: string
}

function ProfilePage()  {
  const { userId } = Route.useParams()
  return <Profile userId={userId} />
}

function Profile({ isProvider, isVerified = false, userId }: ProfileProps) {
    const [, setActiveTab] = useState('account')
    const navigate = useNavigate()
    const currentUser = useAuthStore((s) => s.user)
    const isOwner = currentUser?.userId === userId

    // Wait for auth to settle before fetching, so logged-out visitors aren't stuck loading forever.
    const [authReady, setAuthReady] = useState(false)
    useEffect(() => {
        void ensureAuthInitialized().finally(() => setAuthReady(true))
    }, [])

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
        enabled: authReady,
    })
    const pictureUrl = user?.profileMedia ? mediaUrl(user.profileMedia.url) : user?.profileMedia ? mediaUrl(user.profileMedia.url) : undefined;
    const isProviderType = user?.userType === 'PROVIDER'
    isProvider = isProviderType

    const { data: listingsResponse } = useQuery<
      MyListingCollectionResponse | PublicListingCollectionResponse
    >({
        queryKey: ['listings', userId, isOwner],
        queryFn: async () => {
            if (isOwner && isProviderType) {
                const response = await getAuthorListings(userId)
                if (response.status !== 200) throw response.data
                return response.data
            }

            if (isProviderType) {
                const response = await getPublicProfileListings(userId)
                if (response.status !== 200) throw response.data
                return response.data
            }

            return { items: [], cursor: { limit: 0, next: null } }
        },
        enabled: isProviderType,
    })

    if (isLoading) return <ProfilePageLoading />
    if (error) return <ProfilePageError />

    const userDescription = user?.selfSummary ?? 'No description provided.'
    const userFirstName = user?.firstName ?? ''
    const userLastName = user?.lastName ?? ''

    const city = user
      ? 'privateAddress' in user
        ? user.privateAddress?.city ?? ''
        : user.city ?? ''
      : ''

    const serviceListings: ServiceCardEditProps[] = isOwner && isProviderType
      ? ((listingsResponse?.items ?? []) as MyListingSummary[]).map((listing) => ({
          link: `/service/${listing.listingId}`,
          pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
          label: listing.title,
          description: listing.description,
          status: listing.publicationStatus === 'DRAFT' ? 'draft' : 'active'
        }))
      : []

    const publicServiceListings: ServiceCardProps[] = !isOwner && isProviderType
      ? ((listingsResponse?.items ?? []) as PublicListingSummary[]).map((listing) => ({
          link: `/service/${listing.listingId}`,
          pictureLink: listing.primaryMedia?.url || './pic/ServiceExample1.png',
          location: `${listing.location.city}${listing.location.postalCode ? ', ' + listing.location.postalCode : ''}`,
          providerFirstName: listing.author.name,
          providerLastName: listing.author.surname,
          varified: false,
          label: listing.title,
          description: listing.description,
          tags: listing.tags,
          hourRate: listing.price,
          distance: listing.location.serviceRadiusKm,
        }))
      : []

    return(
        <>
        <ProfilePageContent
          userId={userId}
          isProvider={isProvider}
          isVerified={isVerified}
          isOwner={isOwner}
          userFirstName={userFirstName}
          userLastName={userLastName}
          userDescription={userDescription}
          city={city}
          pictureUrl={pictureUrl}
          serviceListings={serviceListings}
          publicServiceListings={publicServiceListings}
          onEditClick={() => navigate({ to: '/profile/$userId/edit', params: { userId } })}
          onActiveTabChange={setActiveTab}
        />
        <Outlet />
        </>
    )
}