import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { EditProfileForm } from '../components/EditProfileForm'
import { useAuthStore } from '../stores/auth'
import {
  patchUser,
  uploadProfilePhoto,
  type PatchUserPayload,
  type RegisterPatchError,
  type UploadPhotoError,
} from '../lib/patchUser'
import { mediaUrl } from "../lib/mediaUrl";

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

  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; previewUrl: string } | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

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
    <EditProfileForm
      firstName={firstName}
      lastName={lastName}
      username={username}
      selfSummary={selfSummary}
      addressLine={addressLine}
      postalCode={postalCode}
      city={city}
      isPublic={isPublic}
      firstNameError={firstNameError}
      lastNameError={lastNameError}
      usernameError={usernameError}
      selfSummaryError={selfSummaryError}
      addressLineError={addressLineError}
      postalCodeError={postalCodeError}
      cityError={cityError}
      serverError={serverError}
      submitting={submitting}
      userFirstName={currentUser.firstName ?? ''}
      userLastName={currentUser.lastName ?? ''}
      userPictureUrl={currentUser?.profileMedia ? mediaUrl(currentUser?.profileMedia?.url) : undefined}
      pendingPhotoPreviewUrl={pendingPhoto?.previewUrl}
      uploadingPhoto={uploadingPhoto}
      photoError={photoError}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onUsernameChange={setUsername}
      onSelfSummaryChange={setSelfSummary}
      onAddressLineChange={setAddressLine}
      onPostalCodeChange={setPostalCode}
      onCityChange={setCity}
      onIsPublicChange={setIsPublic}
      onFirstNameBlur={() => setFirstNameError(validateName(firstName))}
      onLastNameBlur={() => setLastNameError(validateName(lastName))}
      onUsernameBlur={() => setUsernameError(validateUsername(username))}
      onSelfSummaryBlur={() => setSelfSummaryError(validateSelfSummary(selfSummary))}
      onAddressLineBlur={() => setAddressLineError(validateAddressLine(addressLine))}
      onPostalCodeBlur={() => setPostalCodeError(validatePostalCode(postalCode))}
      onCityBlur={() => setCityError(validateCity(city))}
      onSubmit={handleSubmit}
      onClose={closeToProfile}
      onPhotoSelected={handlePhotoSelected}
      onPhotoPopupClose={closePhotoPopup}
      onPhotoSave={handlePhotoSave}
    />
  )
}
