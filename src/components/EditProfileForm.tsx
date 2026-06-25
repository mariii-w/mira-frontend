import { useRef, type ChangeEvent, type FormEvent } from 'react'
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
  addressLine: string
  postalCode: string
  city: string
  isPublic: boolean
  firstNameError: string | null
  lastNameError: string | null
  usernameError: string | null
  selfSummaryError: string | null
  addressLineError: string | null
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
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onSelfSummaryChange: (value: string) => void
  onAddressLineChange: (value: string) => void
  onPostalCodeChange: (value: string) => void
  onCityChange: (value: string) => void
  onIsPublicChange: (value: boolean) => void
  onFirstNameBlur: () => void
  onLastNameBlur: () => void
  onUsernameBlur: () => void
  onSelfSummaryBlur: () => void
  onAddressLineBlur: () => void
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
  addressLine,
  postalCode,
  city,
  isPublic,
  firstNameError,
  lastNameError,
  usernameError,
  selfSummaryError,
  addressLineError,
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
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onSelfSummaryChange,
  onAddressLineChange,
  onPostalCodeChange,
  onCityChange,
  onIsPublicChange,
  onFirstNameBlur,
  onLastNameBlur,
  onUsernameBlur,
  onSelfSummaryBlur,
  onAddressLineBlur,
  onPostalCodeBlur,
  onCityBlur,
  onSubmit,
  onClose,
  onPhotoSelected,
  onPhotoPopupClose,
  onPhotoSave,
}: EditProfileFormProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)

  function openPhotoPicker() {
    photoInputRef.current?.click()
  }

  return (
    <>
      <main id="main-content">
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <form
            className="relative flex w-full max-w-md flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl my-8"
            onSubmit={onSubmit}
            noValidate
          >
            <button
              type="button"
              aria-label="Schließen"
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-3 pr-10">
              <h1 className="self-start font-heading text-2xl font-bold text-foreground">
                Profil bearbeiten
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
                    aria-label="Profilbild ändern"
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
                <span className="text-small font-medium text-foreground">bearbeiten</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" required>
                Vorname
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
                Nachname
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
                Benutzername
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
              <Label htmlFor="selfSummary">Profil Beschreibung</Label>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addressLine" required>
                Wohnangabe
              </Label>
              <Input
                id="addressLine"
                size="sm"
                value={addressLine}
                onChange={(e) => onAddressLineChange(e.target.value)}
                onBlur={onAddressLineBlur}
                placeholder="Straße und Hausnummer, z. B. Kleiber Weg 5"
                autoComplete="address-line1"
                error={addressLineError}
              />
            </div>

            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode" required>
                  Postleitzahl
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
                  Stadt
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
                Öffentliches Profil
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
                Abbrechen
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                trailingIcon={<Check />}
              >
                Speichern
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
          <div className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl">
            <button
              type="button"
              aria-label="Schließen"
              onClick={onPhotoPopupClose}
              disabled={uploadingPhoto}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h2 className="font-heading text-xl font-bold text-foreground">Profilbild</h2>

            <img
              src={pendingPhotoPreviewUrl}
              alt="Vorschau des neuen Profilbilds"
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
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={uploadingPhoto}
                trailingIcon={<Check />}
                onClick={onPhotoSave}
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
