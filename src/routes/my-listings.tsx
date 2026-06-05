import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { MyListingCard, type MyListingSummary } from '../components/MyListingCard'
import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'

export const Route = createFileRoute('/my-listings')({
  component: MyListingsPage,
})

function CreateServiceButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-accent text-accent font-bold hover:bg-accent/5 active:bg-accent/10 shrink-0"
      trailingIcon={
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-cream shrink-0">
          <Plus size={14} aria-hidden="true" />
        </span>
      }
    >
      Create service
    </Button>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function MyListingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [listings, setListings] = useState<MyListingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    authFetch(`/v1/users/${user.userId}/listings`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load listings.')
        const data = await res.json()
        setListings(data.items)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  const activeCount = listings.filter((l) => l.publicationStatus === 'ACTIVE').length

  function handleCreate() {
    navigate({ to: '/create-listing' })
  }

  function handleEdit(id: string) {
    navigate({ to: '/edit-listing/$listingId', params: { listingId: id } })
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-3xl">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-h1 font-bold text-foreground">My Services</h1>
              <p aria-live="polite" className="text-small text-muted">
                {!loading && <>{activeCount} active
                  {/* TODO: append "· {totalBookings} bookings total" once bookings API is wired up
                       Endpoint candidate: GET /v1/bookings with a filter on the provider's userId */}
                </>}
              </p>
            </div>
            <CreateServiceButton onClick={handleCreate} />
          </div>

          {loading && (
            <div role="status" aria-live="polite" className="flex justify-center py-16">
              <p className="text-small text-muted">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <p role="alert" className="text-small text-red-600">{error}</p>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-body text-muted">You haven't created any services yet.</p>
              <CreateServiceButton onClick={handleCreate} />
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <ul role="list" aria-label="Your services" className="flex flex-col gap-4 list-none m-0 p-0">
              {listings.map((listing) => (
                <li key={listing.listingId}>
                  <MyListingCard listing={listing} onEdit={handleEdit} />
                </li>
              ))}
            </ul>
          )}

        </div>
      </main>
    </>
  )
}
