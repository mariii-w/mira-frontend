import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Label } from '../components/Label'
import { Textarea } from '../components/Textarea'
import { Slider } from '../components/Slider'
import { MultiSelect } from '../components/MultiSelect'
import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'
import type { PublicationStatus, VlmStatus } from '../components/MyListingCard'

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute('/edit-listing/$listingId')({
  component: EditListingPage,
})

interface ServiceTag {
  tagId: string
  name: string
  isBarrierefrei: boolean
  isActive: boolean
}

interface ExistingImage {
  mediaId: string
  url: string
  altText?: string | null
  altTextStatus?: VlmStatus
}

interface ListingDetails {
  listingId: string
  title: string
  description: string
  easyDescription?: string | null
  easyDescriptionStatus?: VlmStatus
  price: number
  publicationStatus: PublicationStatus
  tags: Array<{ tagId: string; name: string; isBarrierefrei: boolean; isActive: boolean }>
  location: { city: string; postalCode: string; serviceRadiusKm: number }
  media?: ExistingImage[]
}

function validateTitle(v: string) {
  if (!v.trim()) return 'Required.'
  if (v.trim().length < 3) return 'At least 3 characters.'
  if (v.length > 120) return 'Maximum 120 characters.'
  return null
}
function validateDescription(v: string) {
  if (!v.trim()) return 'Required.'
  if (v.trim().length < 10) return 'At least 10 characters.'
  if (v.length > 2000) return 'Maximum 2000 characters.'
  return null
}
function validatePrice(v: string) {
  if (!v.trim()) return 'Required.'
  const n = Number(v)
  if (isNaN(n) || n < 0) return 'Must be a positive number.'
  return null
}
function validateStreet(v: string) {
  if (!v.trim()) return 'Required.'
  if (v.length > 120) return 'Maximum 120 characters.'
  return null
}
function validateHouseNumber(v: string) {
  if (!v.trim()) return 'Required.'
  if (v.length > 20) return 'Maximum 20 characters.'
  return null
}
function validatePostalCode(v: string) {
  if (!v) return 'Required.'
  if (!/^\d{5}$/.test(v)) return 'Must be exactly 5 digits.'
  return null
}
function validateCity(v: string) {
  if (!v.trim()) return 'Required.'
  if (v.length > 120) return 'Maximum 120 characters.'
  return null
}

const STATUS_LABEL: Record<PublicationStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  DELETED: 'Deleted',
}

export function EditListingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [listing, setListing] = useState<ListingDetails | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [radiusKm, setRadiusKm] = useState(20)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [streetError, setStreetError] = useState<string | null>(null)
  const [houseNumberError, setHouseNumberError] = useState<string | null>(null)
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)
  const [tagError, setTagError] = useState<string | null>(null)

  const [availableTags, setAvailableTags] = useState<ServiceTag[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const vlmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasVlmPending = existingImages.some(
    (img) => img.altTextStatus === 'PENDING' || img.altTextStatus === 'PROCESSING',
  )

  useEffect(() => {
    if (!hasVlmPending) return

    vlmTimerRef.current = setTimeout(async () => {
      try {
        const res = await authFetch(`/v1/listings/${listingId}/media`)
        if (!res.ok) return
        const mediaData = await res.json()
        const items: ExistingImage[] = Array.isArray(mediaData)
          ? mediaData
          : (mediaData?.items ?? mediaData?.uploaded ?? [])
        setExistingImages(items)
      } catch {
        // polling is best-effort
      }
    }, 4000)

    return () => {
      if (vlmTimerRef.current) clearTimeout(vlmTimerRef.current)
    }
  }, [hasVlmPending, listingId])

  useEffect(() => {
    if (!user) return
    Promise.all([
      authFetch(`/v1/users/${user.userId}/listings/${listingId}`),
      authFetch(`/v1/listings/${listingId}/media`),
    ])
      .then(async ([listingRes, mediaRes]) => {
        if (!listingRes.ok) throw new Error('Failed to load listing.')
        const data: ListingDetails = await listingRes.json()
        setListing(data)
        setTitle(data.title)
        setDescription(data.description)
        setPrice(String(data.price))
        setPostalCode(data.location.postalCode)
        setCity(data.location.city)
        setRadiusKm(data.location.serviceRadiusKm)
        setSelectedTagIds(data.tags.map((t) => t.tagId))

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json()
          const items: ExistingImage[] = Array.isArray(mediaData)
            ? mediaData
            : (mediaData?.items ?? mediaData?.uploaded ?? [])
          setExistingImages(items)
        }
      })
      .catch((e: Error) => setLoadError(e.message))
  }, [user, listingId])

  useEffect(() => {
    fetch('/v1/service-tags')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((data) => setAvailableTags(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch((err) => console.error('Failed to load tags:', err))
      .finally(() => setTagsLoading(false))
  }, [])

  const isEditable =
    listing?.publicationStatus === 'DRAFT' || listing?.publicationStatus === 'ACTIVE'
  const isDeleted = listing?.publicationStatus === 'DELETED'
  const status = listing?.publicationStatus
  const totalImages = existingImages.length + newImageFiles.length

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).slice(0, 10 - totalImages)
    setNewImageFiles((prev) => [...prev, ...picked])
    setNewImagePreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removeNewImage(idx: number) {
    URL.revokeObjectURL(newImagePreviews[idx])
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  async function removeExistingImage(mediaId: string) {
    const removed = existingImages.find((img) => img.mediaId === mediaId)
    setExistingImages((prev) => prev.filter((img) => img.mediaId !== mediaId))
    try {
      const res = await authFetch(`/v1/listings/${listingId}/media/${mediaId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        if (removed) setExistingImages((prev) => [...prev, removed])
        setServerError('Failed to delete image. Please try again.')
      }
    } catch {
      if (removed) setExistingImages((prev) => [...prev, removed])
      setServerError('Failed to delete image. Please try again.')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !isEditable) return

    const tErr = validateTitle(title)
    const dErr = validateDescription(description)
    const pErr = validatePrice(price)
    const addressStarted = street.trim() || houseNumber.trim()
    const sErr = addressStarted ? validateStreet(street) : null
    const hErr = addressStarted ? validateHouseNumber(houseNumber) : null
    const pcErr = addressStarted ? validatePostalCode(postalCode) : null
    const cErr = addressStarted ? validateCity(city) : null
    const tagErr = selectedTagIds.length === 0 ? 'Select at least one tag.' : null

    setTitleError(tErr)
    setDescriptionError(dErr)
    setPriceError(pErr)
    setStreetError(sErr)
    setHouseNumberError(hErr)
    setPostalCodeError(pcErr)
    setCityError(cErr)
    setTagError(tagErr)

    if (tErr || dErr || pErr || sErr || hErr || pcErr || cErr || tagErr) return

    setSubmitting(true)
    setServerError(null)

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        tagIds: selectedTagIds,
      }
      if (street.trim() && houseNumber.trim()) {
        body.location = {
          street: street.trim(),
          houseNumber: houseNumber.trim(),
          postalCode,
          city: city.trim(),
          serviceRadiusKm: radiusKm,
        }
      }

      const res = await authFetch(`/v1/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setServerError(err?.detail ?? `Failed to save listing (${res.status}).`)
        setSubmitting(false)
        return
      }

      if (newImageFiles.length > 0) {
        const formData = new FormData()
        newImageFiles.forEach((f) => formData.append('files', f))
        await authFetch(`/v1/listings/${listingId}/media`, { method: 'POST', body: formData })
      }

      await navigate({ to: '/my-listings' })
    } catch (err) {
      setServerError((err as Error).message)
      setSubmitting(false)
    }
  }

  async function callStatusAction(endpoint: string) {
    setActionSubmitting(true)
    setServerError(null)
    try {
      const res = await authFetch(`/v1/listings/${listingId}/${endpoint}`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setServerError(err?.detail ?? `Action failed (${res.status}).`)
        setActionSubmitting(false)
        return
      }
      await navigate({ to: '/my-listings' })
    } catch (err) {
      setServerError((err as Error).message)
      setActionSubmitting(false)
    }
  }

  async function handleDelete() {
    setActionSubmitting(true)
    setServerError(null)
    try {
      const res = await authFetch(`/v1/listings/${listingId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setServerError(err?.detail ?? `Failed to delete listing (${res.status}).`)
        setActionSubmitting(false)
        setDeleteConfirming(false)
        return
      }
      await navigate({ to: '/my-listings' })
    } catch (err) {
      setServerError((err as Error).message)
      setActionSubmitting(false)
      setDeleteConfirming(false)
    }
  }

  if (!listing && !loadError) {
    return (
      <>
        <Navbar />
        <main
          id="main-content"
          className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8"
        >
          <div role="status" aria-live="polite" className="flex justify-center py-16">
            <p className="text-small text-muted">Loading…</p>
          </div>
        </main>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        <Navbar />
        <main
          id="main-content"
          className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8"
        >
          <p role="alert" className="text-small text-red-600">
            {loadError}
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto max-w-2xl flex flex-col gap-8 animate-fade-in-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => navigate({ to: '/my-listings' })}
                aria-label="Back to My Services"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-muted hover:text-foreground shrink-0"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <h1 className="font-heading text-h1 font-bold text-foreground">Edit Listing</h1>
              {status && (
                <span className="text-small font-medium text-muted border border-border/40 rounded-full px-2.5 py-0.5">
                  <span className="sr-only">Status: </span>
                  {STATUS_LABEL[status]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span aria-live="polite" className="text-small text-muted">
                {submitting ? 'Saving…' : ''}
              </span>
              {isEditable && (
                <Button type="submit" variant="primary" size="md" loading={submitting}>
                  Save
                </Button>
              )}
              {status === 'DRAFT' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  loading={actionSubmitting}
                  onClick={() => callStatusAction('publish')}
                >
                  Publish
                </Button>
              )}
              {status === 'ACTIVE' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  loading={actionSubmitting}
                  onClick={() => callStatusAction('pause')}
                >
                  Pause
                </Button>
              )}
              {status === 'PAUSED' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  loading={actionSubmitting}
                  onClick={() => callStatusAction('resume')}
                >
                  Resume
                </Button>
              )}
            </div>
          </div>

          {serverError && (
            <p role="alert" className="text-small text-red-600">
              {serverError}
            </p>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-title" required={isEditable}>
              Title
            </Label>
            <Input
              id="listing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => isEditable && setTitleError(validateTitle(title))}
              maxLength={120}
              placeholder="e.g. PC support and laptop help"
              error={titleError}
              disabled={!isEditable}
              aria-required={isEditable || undefined}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-description" required={isEditable}>
              Description
            </Label>
            <Textarea
              id="listing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => isEditable && setDescriptionError(validateDescription(description))}
              maxLength={2000}
              rows={6}
              placeholder="Describe what you offer, your experience and availability…"
              error={descriptionError}
              disabled={!isEditable}
              aria-required={isEditable || undefined}
            />
          </div>

          {/* Hourly rate */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-price" required={isEditable}>
              Hourly rate (€)
            </Label>
            <Input
              id="listing-price"
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => isEditable && setPriceError(validatePrice(price))}
              placeholder="e.g. 25"
              error={priceError}
              className="max-w-xs"
              disabled={!isEditable}
              aria-required={isEditable || undefined}
            />
          </div>

          {/* Images */}
          {!isDeleted && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label>Images</Label>
                <span aria-live="polite" className="text-small text-muted">
                  {totalImages}/10
                </span>
              </div>
              <div className="flex flex-wrap gap-3" role="list" aria-label="Listing images">
                {existingImages.map((img, i) => (
                  <div
                    key={img.mediaId}
                    role="listitem"
                    className="relative w-36 h-36 rounded-xl overflow-hidden border border-border/30 shrink-0"
                  >
                    <img
                      src={img.url}
                      alt={img.altTextStatus === 'COMPLETED' && img.altText ? img.altText : ''}
                      className="w-full h-full object-cover"
                    />
                    {(img.altTextStatus === 'PENDING' || img.altTextStatus === 'PROCESSING') && (
                      <span
                        aria-label="Generating description…"
                        className="absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.mediaId)}
                      aria-label={img.altTextStatus === 'COMPLETED' && img.altText ? `Remove image: ${img.altText}` : `Remove image ${i + 1}`}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-charcoal/70 text-cream flex items-center justify-center hover:bg-charcoal transition-colors"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((url, i) => (
                  <div
                    key={url}
                    role="listitem"
                    className="relative w-36 h-36 rounded-xl overflow-hidden border border-border/30 shrink-0 animate-scale-in"
                  >
                    <img src={url} alt={`New image ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      aria-label={`Remove image ${i + 1}`}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-charcoal/70 text-cream flex items-center justify-center hover:bg-charcoal transition-colors"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {totalImages < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-36 h-36 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted hover:border-primary hover:text-primary transition-colors shrink-0"
                  >
                    <Plus size={28} aria-hidden="true" />
                    <span className="text-small font-medium text-center leading-tight px-2">
                      Add new image
                    </span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                aria-hidden="true"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Location */}
          <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
            <legend className="font-heading font-bold text-body text-foreground float-left w-full mb-0">
              Location
            </legend>
            {isEditable && (
              <p className="text-small text-muted -mt-2">
                Street and house number are not shown for privacy. Fill them in to update the
                address or service radius.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-street">Street</Label>
                <Input
                  id="listing-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onBlur={() => streetError && setStreetError(validateStreet(street))}
                  placeholder="Street name"
                  error={streetError}
                  disabled={!isEditable}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-house">No.</Label>
                <Input
                  id="listing-house"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  onBlur={() =>
                    houseNumberError && setHouseNumberError(validateHouseNumber(houseNumber))
                  }
                  placeholder="12a"
                  error={houseNumberError}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-postal">Postal code</Label>
                <Input
                  id="listing-postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() =>
                    postalCodeError && setPostalCodeError(validatePostalCode(postalCode))
                  }
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="12345"
                  error={postalCodeError}
                  disabled={!isEditable}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-city">City</Label>
                <Input
                  id="listing-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => cityError && setCityError(validateCity(city))}
                  placeholder="Berlin"
                  error={cityError}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Service radius</Label>
              <Slider
                label="Service radius"
                min={10}
                max={200}
                step={5}
                value={radiusKm}
                unit="km"
                onChange={setRadiusKm}
                disabled={!isEditable}
              />
            </div>
          </fieldset>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="listing-tags" required={isEditable}>
              Tags
            </Label>
            <MultiSelect
              id="listing-tags"
              options={availableTags
                .filter((t) => t.isActive)
                .map((t) => ({
                  id: t.tagId,
                  label: t.name,
                  badge: t.isBarrierefrei ? 'barrierefrei' : undefined,
                  variant: t.isBarrierefrei ? ('accent' as const) : ('default' as const),
                }))}
              value={selectedTagIds}
              onChange={(ids) => {
                if (isEditable) {
                  setSelectedTagIds(ids)
                  setTagError(null)
                }
              }}
              placeholder="Select tags…"
              loading={tagsLoading}
              aria-label="Service tags"
              aria-describedby={tagError ? 'listing-tags-error' : undefined}
              aria-required={isEditable}
            />
            {tagError && (
              <p id="listing-tags-error" role="alert" className="text-small text-red-600">
                {tagError}
              </p>
            )}
          </div>

          {/* Danger zone */}
          {!isDeleted && (
            <div className="border-t border-border/30 pt-6">
              {!deleteConfirming ? (
                <Button
                  type="button"
                  variant="accent"
                  size="md"
                  onClick={() => setDeleteConfirming(true)}
                >
                  Delete listing
                </Button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
                  <p role="alert" className="text-small text-foreground">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="accent"
                      size="md"
                      loading={actionSubmitting}
                      onClick={handleDelete}
                    >
                      Yes, delete
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setDeleteConfirming(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pb-8" />
        </form>
      </main>
    </>
  )
}
