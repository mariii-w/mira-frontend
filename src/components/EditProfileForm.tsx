import { useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Check, X } from 'lucide-react'
import * as Switch from './Switch'
import { Button } from './Button'
import { Input } from './Input'
import { Label } from './Label'
import { Textarea } from './Textarea'
import { AvatarIcon } from './AvatarIcon'

type EditProfileFormProps = {
  firstName: string
  lastName: string
  username: string
  selfSummary: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  isPublic: boolean
  firstNameError: string | null
  lastNameError: string | null
  usernameError: string | null
  selfSummaryError: string | null
  streetError: string | null
  houseNumberError: string | null
  postalCodeError: string | null
  cityError: string | null
  serverError: string | null
  submitting: boolean
  userFirstName: string
  userLastName: string
  userPictureUrl?: string
  pendingPhotoPreviewUrl?: string
  uploadingPhoto: boolean
  photoError: string | null
  fileError: string | null
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onSelfSummaryChange: (value: string) => void
  onStreetChange: (value: string) => void
  onHouseNumberChange: (value: string) => void
  onPostalCodeChange: (value: string) => void
  onCityChange: (value: string) => void
  onIsPublicChange: (value: boolean) => void
  onFirstNameBlur: () => void
  onLastNameBlur: () => void
  onUsernameBlur: () => void
  onSelfSummaryBlur: () => void
  onStreetBlur: () => void
  onHouseNumberBlur: () => void
  onPostalCodeBlur: () => void
  onCityBlur: () => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onPhotoSelected: (e: ChangeEvent<HTMLInputElement>) => void
  onPhotoPopupClose: () => void
  onPhotoSave: () => void
}

export function EditProfileForm({
  firstName,
  lastName,
  username,
  selfSummary,
  street,
  houseNumber,
  postalCode,
  city,
  isPublic,
  firstNameError,
  lastNameError,
  usernameError,
  selfSummaryError,
  streetError,
  houseNumberError,
  postalCodeError,
  cityError,
  serverError,
  submitting,
  userFirstName,
  userLastName,
  userPictureUrl,
  pendingPhotoPreviewUrl,
  uploadingPhoto,
  photoError,
  fileError,
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onSelfSummaryChange,
  onStreetChange,
  onHouseNumberChange,
  onPostalCodeChange,
  onCityChange,
  onIsPublicChange,
  onFirstNameBlur,
  onLastNameBlur,
  onUsernameBlur,
  onSelfSummaryBlur,
  onStreetBlur,
  onHouseNumberBlur,
  onPostalCodeBlur,
  onCityBlur,
  onSubmit,
  onClose,
  onPhotoSelected,
  onPhotoPopupClose,
  onPhotoSave,
}: EditProfileFormProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  function openPhotoPicker() {
    photoInputRef.current?.click()
  }

  function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null)
  }

  function makeTrapHandler(containerRef: React.RefObject<HTMLElement | null>) {
    return (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return
      const els = getFocusable(container)
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
  }

  // Focus trap for main form
  useEffect(() => {
    const form = formRef.current
    if (!form) return
    const trigger = document.activeElement as HTMLElement
    getFocusable(form)[0]?.focus()
    const handler = makeTrapHandler(formRef)
    form.addEventListener('keydown', handler)
    return () => {
      form.removeEventListener('keydown', handler)
      trigger?.focus()
    }
  }, [])

  // Focus trap for photo popup
  useEffect(() => {
    if (!pendingPhotoPreviewUrl) return
    const popup = popupRef.current
    if (!popup) return
    getFocusable(popup)[0]?.focus()
    const handler = makeTrapHandler(popupRef)
    popup.addEventListener('keydown', handler)
    return () => popup.removeEventListener('keydown', handler)
  }, [pendingPhotoPreviewUrl])

  return (
    <>
      <main id="main-content">
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-charcoal/50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <form
            ref={formRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-heading"
            className="relative flex w-full max-w-md flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl my-8"
            onSubmit={onSubmit}
            noValidate
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-3 pr-10">
              <h1 id="edit-profile-heading" className="self-start font-heading text-2xl font-bold text-foreground">
                Edit profile
              </h1>
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <AvatarIcon
                    size={112}
                    firstName={userFirstName}
                    lastName={userLastName}
                    picture={userPictureUrl}
                  />
                  <button
                    type="button"
                    aria-label="Change profile picture"
                    onClick={openPhotoPicker}
                    className="absolute -bottom-1 -right-3 inline-flex size-9 items-center justify-center rounded-full bg-charcoal text-cream border-2 border-linen"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={onPhotoSelected}
                  />
                </div>
                <span className="text-small font-medium text-foreground">Change Photo</span>
              </div>
              {fileError && (
                <p role="alert" className="text-small text-red-600 text-center">
                  {fileError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" required>
                First name
              </Label>
              <Input
                id="firstName"
                size="sm"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                onBlur={onFirstNameBlur}
                autoComplete="given-name"
                error={firstNameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" required>
                Last name
              </Label>
              <Input
                id="lastName"
                size="sm"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                onBlur={onLastNameBlur}
                autoComplete="family-name"
                error={lastNameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" required>
                Username
              </Label>
              <Input
                id="username"
                size="sm"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                onBlur={onUsernameBlur}
                autoComplete="username"
                error={usernameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="selfSummary">Profile description</Label>
              <Textarea
                id="selfSummary"
                value={selfSummary}
                onChange={(e) => onSelfSummaryChange(e.target.value)}
                onBlur={onSelfSummaryBlur}
                maxLength={200}
                rows={4}
                error={selfSummaryError}
              />
            </div>

            <div className="grid grid-cols-[1fr_8rem] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="street" required>
                  Street
                </Label>
                <Input
                  id="street"
                  size="sm"
                  value={street}
                  onChange={(e) => onStreetChange(e.target.value)}
                  onBlur={onStreetBlur}
                  autoComplete="address-line1"
                  error={streetError}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="houseNumber" required>
                  House no.
                </Label>
                <Input
                  id="houseNumber"
                  size="sm"
                  value={houseNumber}
                  onChange={(e) => onHouseNumberChange(e.target.value)}
                  onBlur={onHouseNumberBlur}
                  autoComplete="address-line2"
                  error={houseNumberError}
                />
              </div>
            </div>

            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode" required>
                  Postal code
                </Label>
                <Input
                  id="postalCode"
                  size="sm"
                  inputMode="numeric"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => onPostalCodeChange(e.target.value.replace(/\D/g, ''))}
                  onBlur={onPostalCodeBlur}
                  autoComplete="postal-code"
                  error={postalCodeError}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city" required>
                  City
                </Label>
                <Input
                  id="city"
                  size="sm"
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  onBlur={onCityBlur}
                  autoComplete="address-level2"
                  error={cityError}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="isPublic"
                className="text-small font-medium text-foreground cursor-pointer"
              >
                Public profile
              </label>
              <Switch.Root
                id="isPublic"
                checked={isPublic}
                onCheckedChange={onIsPublicChange}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-grey-olive/40 data-[state=checked]:bg-primary transition-colors duration-150"
              >
                <Switch.Thumb className="block h-5 w-5 rounded-full bg-surface shadow translate-x-0.5 data-[state=checked]:translate-x-[22px] transition-transform duration-150" />
              </Switch.Root>
            </div>

            {serverError && (
              <p role="alert" className="text-small text-red-600">
                {serverError}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                trailingIcon={<Check />}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </main>

      {pendingPhotoPreviewUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onPhotoPopupClose()
          }}
        >
          <div
            ref={popupRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-popup-heading"
            className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onPhotoPopupClose}
              disabled={uploadingPhoto}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h2 id="photo-popup-heading" className="font-heading text-xl font-bold text-foreground">Profile picture</h2>

            <img
              src={pendingPhotoPreviewUrl}
              alt="Preview of new profile picture"
              className="size-48 self-center rounded-full object-cover border border-border"
            />

            {photoError && (
              <p role="alert" className="text-small text-red-600">
                {photoError}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onPhotoPopupClose}
                disabled={uploadingPhoto}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={uploadingPhoto}
                trailingIcon={<Check />}
                onClick={onPhotoSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
