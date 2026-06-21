import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Check, X } from 'lucide-react'
import * as Switch from '../components/Switch'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Label } from '../components/Label'
import { Textarea } from '../components/Textarea'
import { AvatarIcon } from '../components/AvatarIcon'
import { useAuthStore } from '../stores/auth'
import {
  patchUser,
  uploadProfilePhoto,
  type PatchUserPayload,
  type RegisterPatchError,
  type UploadPhotoError,
} from '../lib/patchUser'
import { profileMediaUrl } from '../lib/media'

export const Route = createFileRoute('/profile/$userId/edit')({
  component: EditProfilePage,
})

function validateName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Required.'
  if (v.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöü](?:[^0-9]*[^0-9\s])?$/.test(v)) {
    return 'No digits. Must not start or end with a space.'
  }
  return null
}

function validateUsername(value: string): string | null {
  if (!value) return 'Required.'
  if (value.length < 3) return 'Minimum 3 characters.'
  if (value.length > 50) return 'Maximum 50 characters.'
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Only lowercase letters, digits, and underscores.'
  }
  return null
}

function validatePostalCode(value: string): string | null {
  if (!value) return 'Required.'
  if (!/^[0-9]{5}$/.test(value)) return 'Must be exactly 5 digits.'
  return null
}

function validateCity(value: string): string | null {
  if (!value.trim()) return 'Required.'
  if (value.length > 100) return 'Maximum 100 characters.'
  if (!/^[A-Za-zÄÖÜäöüß\s-]+$/.test(value.trim())) {
    return 'No digits or special characters.'
  }
  return null
}

function validateSelfSummary(value: string): string | null {
  if (value.length > 200) return 'Maximum 200 characters.'
  return null
}

// "Kleiber Weg 5" -> { street: 'Kleiber Weg', houseNumber: '5' }
function parseAddressLine(value: string): { street: string; houseNumber: string } | null {
  const match = value.trim().match(/^(.+?)\s+(\d+\s*[a-zA-Z]?)$/)
  if (!match) return null
  return { street: match[1].trim(), houseNumber: match[2].replace(/\s+/g, '') }
}

function validateAddressLine(value: string): string | null {
  if (!value.trim()) return 'Required.'
  if (!parseAddressLine(value)) return 'Bitte Straße und Hausnummer angeben, z. B. "Kleiber Weg 5".'
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function EditProfilePage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.userId === userId

  // Only the profile owner can edit it — bounce everyone else back.
  useEffect(() => {
    if (currentUser && !isOwner) {
      navigate({ to: '/profile/$userId', params: { userId } })
    }
  }, [currentUser, isOwner, navigate, userId])

  function closeToProfile() {
    navigate({ to: '/profile/$userId', params: { userId } })
  }

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '')
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '')
  const [username, setUsername] = useState(currentUser?.username ?? '')
  const [selfSummary, setSelfSummary] = useState(currentUser?.selfSummary ?? '')
  const [addressLine, setAddressLine] = useState(
    currentUser?.privateAddress
      ? `${currentUser.privateAddress.street} ${currentUser.privateAddress.houseNumber}`.trim()
      : '',
  )
  const [postalCode, setPostalCode] = useState(currentUser?.privateAddress?.postalCode ?? '')
  const [city, setCity] = useState(currentUser?.privateAddress?.city ?? '')
  const [isPublic, setIsPublic] = useState(currentUser?.isPublic ?? true)

  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [selfSummaryError, setSelfSummaryError] = useState<string | null>(null)
  const [addressLineError, setAddressLineError] = useState<string | null>(null)
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; previewUrl: string } | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  function openPhotoPicker() {
    photoInputRef.current?.click()
  }

  function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again later
    if (!file) return
    setPhotoError(null)
    setPendingPhoto({ file, previewUrl: URL.createObjectURL(file) })
  }

  function closePhotoPopup() {
    if (uploadingPhoto) return
    if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.previewUrl)
    setPendingPhoto(null)
    setPhotoError(null)
  }

  async function handlePhotoSave() {
    if (!pendingPhoto || uploadingPhoto) return
    setUploadingPhoto(true)
    setPhotoError(null)
    try {
      await uploadProfilePhoto(pendingPhoto.file)
      URL.revokeObjectURL(pendingPhoto.previewUrl)
      setPendingPhoto(null)
    } catch (e) {
      setPhotoError((e as UploadPhotoError).message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const fnErr = validateName(firstName)
    const lnErr = validateName(lastName)
    const unErr = validateUsername(username)
    const ssErr = validateSelfSummary(selfSummary)
    const alErr = validateAddressLine(addressLine)
    const pErr = validatePostalCode(postalCode)
    const cErr = validateCity(city)

    setFirstNameError(fnErr)
    setLastNameError(lnErr)
    setUsernameError(unErr)
    setSelfSummaryError(ssErr)
    setAddressLineError(alErr)
    setPostalCodeError(pErr)
    setCityError(cErr)

    if (fnErr || lnErr || unErr || ssErr || alErr || pErr || cErr) return

    const parsedAddress = parseAddressLine(addressLine)
    if (!parsedAddress) {
      setAddressLineError(validateAddressLine(addressLine))
      return
    }

    setSubmitting(true)
    setServerError(null)

    const payload: PatchUserPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      privateAddress: {
        street: parsedAddress.street,
        houseNumber: parsedAddress.houseNumber,
        postalCode,
        city: city.trim(),
      },
      selfSummary: selfSummary.trim(),
      isPublic,
    }

    try {
      await patchUser(payload)
      closeToProfile()
    } catch (e) {
      const err = e as RegisterPatchError
      if (err.field === 'username') {
        setUsernameError(err.message)
      } else {
        setServerError(err.message)
      }
      setSubmitting(false)
    }
  }

  if (!currentUser || !isOwner) return null

  return (
    <>
      <Navbar />
      <main id="main-content">
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeToProfile()
          }}
        >
          <form
            className="relative flex w-full max-w-md flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl my-8"
            onSubmit={handleSubmit}
            noValidate
          >
            <button
              type="button"
              aria-label="Schließen"
              onClick={closeToProfile}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-3 pr-10">
              <h1 className="self-start font-heading text-2xl font-bold text-foreground">Profil bearbeiten</h1>
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <AvatarIcon
                    size={112}
                    firstName={currentUser.firstName ?? ''}
                    lastName={currentUser.lastName ?? ''}
                    picture={profileMediaUrl(currentUser.profileMedia)}
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
                    onChange={handlePhotoSelected}
                  />
                </div>
                <span className="text-small font-medium text-foreground">bearbeiten</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" required>Vorname</Label>
              <Input
                id="firstName"
                size="sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setFirstNameError(validateName(firstName))}
                autoComplete="given-name"
                error={firstNameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" required>Nachname</Label>
              <Input
                id="lastName"
                size="sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setLastNameError(validateName(lastName))}
                autoComplete="family-name"
                error={lastNameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" required>Benutzername</Label>
              <Input
                id="username"
                size="sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setUsernameError(validateUsername(username))}
                autoComplete="username"
                error={usernameError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="selfSummary">Profil Beschreibung</Label>
              <Textarea
                id="selfSummary"
                value={selfSummary}
                onChange={(e) => setSelfSummary(e.target.value)}
                onBlur={() => setSelfSummaryError(validateSelfSummary(selfSummary))}
                maxLength={200}
                rows={4}
                error={selfSummaryError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addressLine" required>Wohnangabe</Label>
              <Input
                id="addressLine"
                size="sm"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                onBlur={() => setAddressLineError(validateAddressLine(addressLine))}
                placeholder="Straße und Hausnummer, z. B. Kleiber Weg 5"
                autoComplete="address-line1"
                error={addressLineError}
              />
            </div>

            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode" required>Postleitzahl</Label>
                <Input
                  id="postalCode"
                  size="sm"
                  inputMode="numeric"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setPostalCodeError(validatePostalCode(postalCode))}
                  autoComplete="postal-code"
                  error={postalCodeError}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city" required>Stadt</Label>
                <Input
                  id="city"
                  size="sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setCityError(validateCity(city))}
                  autoComplete="address-level2"
                  error={cityError}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label htmlFor="isPublic" className="text-small font-medium text-foreground cursor-pointer">
                Öffentliches Profil
              </label>
              <Switch.Root
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-grey-olive/40 data-[state=checked]:bg-primary transition-colors duration-150"
              >
                <Switch.Thumb className="block h-5 w-5 rounded-full bg-surface shadow translate-x-0.5 data-[state=checked]:translate-x-[22px] transition-transform duration-150" />
              </Switch.Root>
            </div>

            {serverError && (
              <p role="alert" className="text-small text-red-600">{serverError}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Button type="button" variant="ghost" size="md" onClick={closeToProfile}>
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

      {pendingPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePhotoPopup()
          }}
        >
          <div className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-linen border border-border p-6 shadow-xl">
            <button
              type="button"
              aria-label="Schließen"
              onClick={closePhotoPopup}
              disabled={uploadingPhoto}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-foreground hover:bg-foreground/5 transition-colors duration-150 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h2 className="font-heading text-xl font-bold text-foreground">Profilbild</h2>

            <img
              src={pendingPhoto.previewUrl}
              alt="Vorschau des neuen Profilbilds"
              className="size-48 self-center rounded-full object-cover border border-border"
            />

            {photoError && (
              <p role="alert" className="text-small text-red-600">{photoError}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Button type="button" variant="ghost" size="md" onClick={closePhotoPopup} disabled={uploadingPhoto}>
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={uploadingPhoto}
                trailingIcon={<Check />}
                onClick={handlePhotoSave}
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
