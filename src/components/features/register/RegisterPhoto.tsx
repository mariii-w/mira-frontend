import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import type { PrivateUserProfileResponse } from "../../../api/model";
import { AvatarIcon } from "../../common/ui/AvatarIcon";
import { Button } from "../../common/ui/Button";
import { mediaUrl } from "../../../lib/mediaUrl";

export interface RegisterPhotoSubmitError {
  field: "server" | "file";
  message: string;
}

interface RegisterPhotoProps {
  initialValues: PrivateUserProfileResponse | null;
  onBack: () => void;
  onContinue: (file: File | null) => Promise<void>;
}

const MAX_BYTES = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (file.size > MAX_BYTES) return "Image is too large. Max 5 MB.";
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return "Unsupported format. Use JPG or PNG.";
  }
  return null;
}

function isSubmitError(value: unknown): value is RegisterPhotoSubmitError {
  return (
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    "message" in value
  );
}

export function RegisterPhoto({
  initialValues,
  onBack,
  onContinue,
}: RegisterPhotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const previewUrl =
    localPreviewUrl ??
    (initialValues?.profileMedia ? mediaUrl(initialValues.profileMedia.url) : null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    const validationError = validateFile(picked);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(picked);
    setLocalPreviewUrl(URL.createObjectURL(picked));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onContinue(file);
    } catch (e) {
      setError(
        isSubmitError(e) || e instanceof Error
          ? e.message
          : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <header className="flex flex-col gap-2">
        <h2
          id="register-step-heading"
          className="font-heading text-3xl font-bold text-foreground"
        >
          Add a profile photo
        </h2>
        <p className="text-small text-muted">
          Optional, but profiles with photos get faster responses. You can
          always add one later.
        </p>
      </header>

      <div className="flex items-center gap-6 py-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile preview"
            className="h-25 w-25 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <AvatarIcon
            firstName={initialValues?.firstName ?? ""}
            lastName={initialValues?.lastName ?? ""}
            size={100}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            leadingIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose photo
          </Button>
          <input
            ref={fileInputRef}
            id="profile-photo-input"
            type="file"
            accept="image/jpeg,image/png"
            aria-label="Choose photo"
            aria-describedby={["photo-hint", error ? "photo-error" : undefined].filter(Boolean).join(" ")}
            className="sr-only"
            onChange={handleFileChange}
          />
          <p id="photo-hint" className="text-small text-muted">JPG or PNG, max 5 MB.</p>
        </div>
      </div>

      {error && (
        <p id="photo-error" role="alert" className="text-small text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          leadingIcon={<ArrowLeft />}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting}
          trailingIcon={<ArrowRight />}
        >
          Finish
        </Button>
      </div>
    </form>
  );
}
