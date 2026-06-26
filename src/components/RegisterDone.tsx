import { ArrowRight } from "lucide-react";
import type { PrivateUserProfileResponse } from "../api/model";
import { AvatarIcon } from "../common/ui/AvatarIcon";
import { Button } from "../common/ui/Button";
import { mediaUrl } from "../lib/mediaUrl";

interface RegisterDoneProps {
  user: PrivateUserProfileResponse | null;
  onFindServices: () => void;
}

export function RegisterDone({ user, onFindServices }: RegisterDoneProps) {
  const firstName = user?.firstName ?? "there";

  return (
    <section
      className="flex flex-col items-center justify-center gap-6 py-12 text-center"
      aria-labelledby="register-step-heading"
    >
      {user?.profileMedia?.url ? (
        <img
          src={mediaUrl(user.profileMedia.url)}
          alt="Your profile photo"
          className="h-30 w-30 rounded-full object-cover border-2 border-border"
        />
      ) : (
        <AvatarIcon
          firstName={user?.firstName ?? ""}
          lastName={user?.lastName ?? ""}
          picture={user?.profileMedia?.url ?? undefined}
          size={120}
        />
      )}

      <div className="flex flex-col gap-2 max-w-md">
        <h2
          id="register-step-heading"
          className="font-heading text-3xl font-bold text-foreground"
        >
          You're all set, {firstName}!
        </h2>
        <p className="text-small text-muted">
          Welcome to Mira. You can now browse services in your area.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        trailingIcon={<ArrowRight />}
        onClick={onFindServices}
      >
        Find services
      </Button>
    </section>
  );
}
