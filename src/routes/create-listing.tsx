import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Label } from '../components/Label'
import { Textarea } from '../components/Textarea'
import { Slider } from '../components/Slider'
import { MultiSelect } from '../components/MultiSelect'
import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'

export const Route = createFileRoute('/create-listing')({
  component: CreateListingPage,
})

interface ServiceTag {
  tagId: string
  name: string
  isBarrierefrei: boolean
  isActive: boolean
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

// eslint-disable-next-line react-refresh/only-export-components
export function CreateListingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [radiusKm, setRadiusKm] = useState(20)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

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

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/v1/service-tags')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`${res.status}`)))
      .then((data) => { setAvailableTags(Array.isArray(data) ? data : (data?.items ?? [])) })
      .catch((err) => console.error('Failed to load tags:', err))
      .finally(() => setTagsLoading(false))
  }, [])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).slice(0, 10 - imageFiles.length)
    setImageFiles((prev) => [...prev, ...picked])
    setImagePreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(imagePreviews[idx])
    setImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !user) return

    const tErr = validateTitle(title)
    const dErr = validateDescription(description)
    const pErr = validatePrice(price)
    const sErr = validateStreet(street)
    const hErr = validateHouseNumber(houseNumber)
    const pcErr = validatePostalCode(postalCode)
    const cErr = validateCity(city)
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
      const formData = new FormData()
      formData.append(
        'listing',
        new Blob(
          [JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            price: Number(price),
            tagIds: selectedTagIds,
            location: {
              street: street.trim(),
              houseNumber: houseNumber.trim(),
              postalCode,
              city: city.trim(),
              serviceRadiusKm: radiusKm,
            },
          })],
          { type: 'application/json' },
        ),
      )
      imageFiles.forEach((f) => formData.append('files', f))

      const res = await authFetch('/v1/listings', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? `Failed to create listing (${res.status}).`)
      }

      navigate({ to: '/my-listings' })
    } catch (err) {
      setServerError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto max-w-2xl flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="font-heading text-h1 font-bold text-foreground">New Listing</h1>
            <div className="flex items-center gap-3">
              {submitting && (
                <span aria-live="polite" className="text-small text-muted">
                  Service is being saved…
                </span>
              )}
              <Button type="button" variant="ghost" size="md">
                Preview
              </Button>
              <Button type="submit" variant="primary" size="md" loading={submitting}>
                Save
              </Button>
            </div>
          </div>

          {serverError && (
            <p role="alert" className="text-small text-red-600">{serverError}</p>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-title" required>Title</Label>
            <Input
              id="listing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleError(validateTitle(title))}
              maxLength={120}
              placeholder="e.g. PC support and laptop help"
              error={titleError}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-description" required>Description</Label>
            <Textarea
              id="listing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setDescriptionError(validateDescription(description))}
              maxLength={2000}
              rows={6}
              placeholder="Describe what you offer, your experience and availability…"
              error={descriptionError}
            />
          </div>

          {/* Hourly rate */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing-price" required>Hourly rate (€)</Label>
            <Input
              id="listing-price"
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => setPriceError(validatePrice(price))}
              placeholder="e.g. 25"
              error={priceError}
              className="max-w-xs"
            />
          </div>

          {/* Images */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label>Images</Label>
              <span aria-live="polite" className="text-small text-muted">
                {imageFiles.length}/10
              </span>
            </div>
            <div className="flex flex-wrap gap-3" role="list" aria-label="Uploaded images">
              {imagePreviews.map((url, i) => (
                <div
                  key={url}
                  role="listitem"
                  className="relative w-36 h-36 rounded-xl overflow-hidden border border-border/30 shrink-0"
                >
                  <img src={url} alt={`Uploaded image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-charcoal/70 text-cream flex items-center justify-center hover:bg-charcoal transition-colors"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {imageFiles.length < 10 && (
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

          {/* Location */}
          <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
            <legend className="font-heading font-bold text-body text-foreground float-left w-full mb-0">
              Location
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-street" required>Street</Label>
                <Input
                  id="listing-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onBlur={() => setStreetError(validateStreet(street))}
                  placeholder="Street name"
                  error={streetError}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-house" required>No.</Label>
                <Input
                  id="listing-house"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  onBlur={() => setHouseNumberError(validateHouseNumber(houseNumber))}
                  placeholder="12a"
                  error={houseNumberError}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-postal" required>Postal code</Label>
                <Input
                  id="listing-postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setPostalCodeError(validatePostalCode(postalCode))}
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="12345"
                  error={postalCodeError}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-city" required>City</Label>
                <Input
                  id="listing-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setCityError(validateCity(city))}
                  placeholder="Berlin"
                  error={cityError}
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
                defaultValue={20}
                unit="km"
                onChange={setRadiusKm}
              />
            </div>
          </fieldset>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="listing-tags" required>Tags</Label>
            <MultiSelect
              id="listing-tags"
              options={availableTags
                .filter((t) => t.isActive)
                .map((t) => ({
                  id: t.tagId,
                  label: t.name,
                  badge: t.isBarrierefrei ? 'barrierefrei' : undefined,
                  variant: t.isBarrierefrei ? 'accent' : 'default',
                }))}
              value={selectedTagIds}
              onChange={(ids) => { setSelectedTagIds(ids); setTagError(null) }}
              placeholder="Select tags…"
              loading={tagsLoading}
              aria-label="Service tags"
              aria-describedby={tagError ? 'listing-tags-error' : undefined}
              aria-required
            />
            {tagError && (
              <p id="listing-tags-error" role="alert" className="text-small text-red-600">{tagError}</p>
            )}
          </div>

          <div className="pb-8" />

        </form>
      </main>
    </>
  )
}
