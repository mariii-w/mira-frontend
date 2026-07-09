import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EditProfileForm } from "../../components/features/profiles/EditProfileForm";
import { useAuthStore } from "../../stores/auth";
import {
    patchUser,
    uploadProfilePhoto,
    type PatchUserPayload,
    type RegisterPatchError,
    type UploadPhotoError,
} from "../../lib/patchUser";
import { mediaUrl } from "../../lib/mediaUrl";
import { createPageMeta } from "../../lib/headers";

export const Route = createFileRoute("/_app/profile/$userId/edit")({
    head: () =>
        createPageMeta({
            title: "Edit Profile",
            description:
                "Update your Mira profile, address, summary, and profile photo.",
        }),
    component: EditProfilePage,
});

function validateName(value: string, label: string): string | null {
    const v = value.trim();
    if (!v) return `${label} is required.`;
    if (v.length > 100) return `${label} must be 100 characters or fewer.`;
    if (!/^[A-Za-zÄÖÜäöü](?:[^0-9]*[^0-9\s])?$/.test(v)) {
        return `${label} must not contain digits or start/end with a space.`;
    }
    return null;
}

function validateUsername(value: string): string | null {
    if (!value) return "Username is required.";
    if (value.length < 3) return "Username must be at least 3 characters.";
    if (value.length > 50) return "Username must be 50 characters or fewer.";
    if (!/^[a-z0-9_]+$/.test(value)) {
        return "Username may only contain lowercase letters, digits, and underscores.";
    }
    return null;
}

function validatePostalCode(value: string): string | null {
    if (!value) return "Postal code is required.";
    if (!/^[0-9]{5}$/.test(value)) return "Postal code must be exactly 5 digits.";
    return null;
}

function validateCity(value: string): string | null {
    if (!value.trim()) return "City is required.";
    if (value.length > 100) return "City must be 100 characters or fewer.";
    if (!/^[A-Za-zÄÖÜäöüß\s-]+$/.test(value.trim())) {
        return "City must not contain digits or special characters.";
    }
    return null;
}

function validateSelfSummary(value: string): string | null {
    if (value.length > 200) return "Profile description must be 200 characters or fewer.";
    return null;
}

function validateStreet(value: string): string | null {
    if (!value.trim()) return "Street is required.";
    if (value.length > 100) return "Street must be 100 characters or fewer.";
    if (!/^[A-Za-zÄÖÜäöüß\s]+$/.test(value.trim())) {
        return "Street must not contain digits or special characters.";
    }
    return null;
}

function validateHouseNumber(value: string): string | null {
    if (!value.trim()) return "House number is required.";
    if (value.length > 10) return "House number must be 10 characters or fewer.";
    if (!/^[0-9]+[a-zA-Z]?$/.test(value.trim())) {
        return "House number must be a number, optionally followed by a letter (e.g. 43a).";
    }
    return null;
}

function validatePhotoFile(file: File): string | null {
    if (file.size > 5 * 1024 * 1024) {
        return "Image is too large. Max 5 MB.";
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
        return "Unsupported format. Use JPG or PNG.";
    }

    return null;
}

// eslint-disable-next-line react-refresh/only-export-components
function EditProfilePage() {
    const { userId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((s) => s.user);
    const isOwner = currentUser?.userId === userId;

    useEffect(() => {
        if (currentUser && !isOwner) {
            navigate({ to: "/profile/$userId", params: { userId } });
        }
    }, [currentUser, isOwner, navigate, userId]);

    function closeToProfile() {
        navigate({ to: "/profile/$userId", params: { userId } });
    }

    const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
    const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
    const [username, setUsername] = useState(currentUser?.username ?? "");
    const [selfSummary, setSelfSummary] = useState(
        currentUser?.selfSummary ?? "",
    );

    const [street, setStreet] = useState(
        currentUser?.privateAddress?.street ?? "",
    );
    const [houseNumber, setHouseNumber] = useState(
        currentUser?.privateAddress?.houseNumber ?? "",
    );

    const [postalCode, setPostalCode] = useState(
        currentUser?.privateAddress?.postalCode ?? "",
    );
    const [city, setCity] = useState(currentUser?.privateAddress?.city ?? "");
    const [isPublic, setIsPublic] = useState(currentUser?.isPublic ?? true);

    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [selfSummaryError, setSelfSummaryError] = useState<string | null>(null);
    const [streetError, setStreetError] = useState<string | null>(null);
    const [houseNumberError, setHouseNumberError] = useState<string | null>(null);
    const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
    const [cityError, setCityError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const [pendingPhoto, setPendingPhoto] = useState<{
        file: File;
        previewUrl: string;
    } | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";

        if (!file) return;

        const validationError = validatePhotoFile(file);

        if (validationError) {
            setPhotoError(validationError);
            return;
        }

        setPhotoError(null);
        setPendingPhoto({ file, previewUrl: URL.createObjectURL(file) });
    }

    function closePhotoPopup() {
        if (uploadingPhoto) return;

        if (pendingPhoto) {
            URL.revokeObjectURL(pendingPhoto.previewUrl);
        }

        setPendingPhoto(null);
        setPhotoError(null);
    }

    async function handlePhotoSave() {
        if (!pendingPhoto || uploadingPhoto) return;

        setUploadingPhoto(true);
        setPhotoError(null);

        try {
            await uploadProfilePhoto(pendingPhoto.file);
            URL.revokeObjectURL(pendingPhoto.previewUrl);
            setPendingPhoto(null);

            await queryClient.invalidateQueries({ queryKey: ["user", userId] });
            await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        } catch (e) {
            setPhotoError((e as UploadPhotoError).message);
        } finally {
            setUploadingPhoto(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (submitting) return;

        const fnErr = validateName(firstName, 'First name');
        const lnErr = validateName(lastName, 'Last name');
        const unErr = validateUsername(username);
        const ssErr = validateSelfSummary(selfSummary);
        const sErr = validateStreet(street);
        const hErr = validateHouseNumber(houseNumber);
        const pErr = validatePostalCode(postalCode);
        const cErr = validateCity(city);

        setFirstNameError(fnErr);
        setLastNameError(lnErr);
        setUsernameError(unErr);
        setSelfSummaryError(ssErr);
        setStreetError(sErr);
        setHouseNumberError(hErr);
        setPostalCodeError(pErr);
        setCityError(cErr);

        if (fnErr || lnErr || unErr || ssErr || sErr || hErr || pErr || cErr) return;

        setSubmitting(true);
        setServerError(null);

        const payload: PatchUserPayload = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username,
            privateAddress: {
                street: street.trim(),
                houseNumber: houseNumber.trim(),
                postalCode,
                city: city.trim(),
            },
            selfSummary: selfSummary.trim(),
            isPublic,
        };

        try {
            await patchUser(payload);

            await queryClient.invalidateQueries({ queryKey: ["user", userId] });
            await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
            await queryClient.invalidateQueries({ queryKey: ["listings", userId] });

            closeToProfile();
        } catch (e) {
            const err = e as RegisterPatchError;

            if (err.field === "username") {
                setUsernameError(err.message);
            } else {
                setServerError(err.message);
            }

            setSubmitting(false);
        }
    }

    if (!currentUser || !isOwner) return null;

    return (
        <EditProfileForm
            firstName={firstName}
            lastName={lastName}
            username={username}
            selfSummary={selfSummary}
            street={street}
            houseNumber={houseNumber}
            postalCode={postalCode}
            city={city}
            isPublic={isPublic}
            firstNameError={firstNameError}
            lastNameError={lastNameError}
            usernameError={usernameError}
            selfSummaryError={selfSummaryError}
            streetError={streetError}
            houseNumberError={houseNumberError}
            postalCodeError={postalCodeError}
            cityError={cityError}
            serverError={serverError}
            submitting={submitting}
            userFirstName={currentUser.firstName ?? ""}
            userLastName={currentUser.lastName ?? ""}
            userPictureUrl={
                currentUser?.profileMedia
                    ? mediaUrl(currentUser.profileMedia.url)
                    : undefined
            }
            pendingPhotoPreviewUrl={pendingPhoto?.previewUrl}
            uploadingPhoto={uploadingPhoto}
            photoError={photoError}
            fileError={photoError}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onUsernameChange={setUsername}
            onSelfSummaryChange={setSelfSummary}
            onStreetChange={setStreet}
            onHouseNumberChange={setHouseNumber}
            onPostalCodeChange={setPostalCode}
            onCityChange={setCity}
            onIsPublicChange={setIsPublic}
            onFirstNameBlur={() => setFirstNameError(validateName(firstName, 'First name'))}
            onLastNameBlur={() => setLastNameError(validateName(lastName, 'Last name'))}
            onUsernameBlur={() => setUsernameError(validateUsername(username))}
            onSelfSummaryBlur={() =>
                setSelfSummaryError(validateSelfSummary(selfSummary))
            }
            onStreetBlur={() => setStreetError(validateStreet(street))}
            onHouseNumberBlur={() =>
                setHouseNumberError(validateHouseNumber(houseNumber))
            }
            onPostalCodeBlur={() =>
                setPostalCodeError(validatePostalCode(postalCode))
            }
            onCityBlur={() => setCityError(validateCity(city))}
            onSubmit={handleSubmit}
            onClose={closeToProfile}
            onPhotoSelected={handlePhotoSelected}
            onPhotoPopupClose={closePhotoPopup}
            onPhotoSave={handlePhotoSave}
        />
    );
}
