import { useState, type ReactNode } from "react";
import { Heart, Search } from "lucide-react";
import type { UserType } from "../api/model";

export interface RegisterRoleSubmitValues {
  userType: UserType;
}

export interface RegisterRoleSubmitError {
  field: "server";
  message: string;
}

interface RegisterRoleProps {
  currentUserType: UserType | null;
  onContinue: (values: RegisterRoleSubmitValues) => Promise<void>;
}

type CardVariant = "primary" | "accent";

function isSubmitError(value: unknown): value is RegisterRoleSubmitError {
  return (
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    "message" in value
  );
}

export function RegisterRole({
  currentUserType,
  onContinue,
}: RegisterRoleProps) {
  const [submitting, setSubmitting] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(userType: UserType) {
    if (submitting) return;

    setSubmitting(userType);
    setError(null);

    try {
      await onContinue({ userType });
    } catch (e) {
      setError(
        isSubmitError(e) || e instanceof Error
          ? e.message
          : "Something went wrong.",
      );
      setSubmitting(null);
    }
  }

  return (
    <section
      className="flex flex-col gap-6"
      aria-labelledby="register-step-heading"
    >
      <h2
        id="register-step-heading"
        className="font-heading text-3xl font-bold text-foreground"
      >
        How will you use Mira?
      </h2>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        role="radiogroup"
        aria-labelledby="register-step-heading"
      >
        <RoleCard
          variant="accent"
          icon={<Search aria-hidden="true" />}
          title="I need help"
          description="Find people to help with computers, phones, chores, tutoring and other."
          selected={currentUserType === "CUSTOMER"}
          loading={submitting === "CUSTOMER"}
          onClick={() => pick("CUSTOMER")}
        />
        <RoleCard
          variant="primary"
          icon={<Heart aria-hidden="true" />}
          title="I can help"
          description="Offer services, set your own hours, and get paid for helping others."
          selected={currentUserType === "PROVIDER"}
          loading={submitting === "PROVIDER"}
          onClick={() => pick("PROVIDER")}
        />
      </div>

      <p className="text-small text-center text-muted" aria-live="polite">
        {error ?? "Click an option to continue \u2192"}
      </p>
    </section>
  );
}

interface RoleCardProps {
  variant: CardVariant;
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
}

const VARIANT_STYLES: Record<
  CardVariant,
  {
    selected: string;
    unselected: string;
    ring: string;
    iconBg: string;
  }
> = {
  primary: {
    selected: "border-primary bg-mint",
    unselected:
      "border-border bg-surface hover:border-primary/40 hover:bg-mint/30",
    ring: "focus-visible:ring-primary",
    iconBg: "bg-primary/10 text-primary",
  },
  accent: {
    selected: "border-accent bg-blush",
    unselected:
      "border-border bg-surface hover:border-accent/40 hover:bg-blush/30",
    ring: "focus-visible:ring-accent",
    iconBg: "bg-accent/10 text-accent",
  },
};

function RoleCard({
  variant,
  icon,
  title,
  description,
  selected,
  loading,
  onClick,
}: RoleCardProps) {
  const v = VARIANT_STYLES[variant];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      disabled={loading}
      className={
        "flex cursor-pointer flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors duration-150 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 " +
        v.ring +
        " " +
        "disabled:cursor-wait disabled:opacity-50 " +
        (selected ? v.selected : v.unselected)
      }
    >
      <span
        className={
          "inline-flex h-10 w-10 items-center justify-center rounded-full [&_svg]:size-5 " +
          v.iconBg
        }
      >
        {icon}
      </span>
      <span className="text-body font-bold text-foreground">{title}</span>
      <span className="text-small text-muted">{description}</span>
    </button>
  );
}
