import { useId, useState, type CSSProperties } from "react";
import { Check, MessageCircle } from "lucide-react";
import { AvatarIcon } from "./AvatarIcon";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "../lib/cn";
import type { ServiceTag, VerifiedCredentialResponse } from "../api/model";

export interface ListingProviderCardProps {
  authorName: string;
  authorSurname: string;
  price: number;
  city: string;
  availableToday?: boolean;
  nextAvailableDate?: string;
  tags: ServiceTag[];
  publicVerifiedCredentials?: VerifiedCredentialResponse[];
  onBookNow: () => void;
  className?: string;
  style?: CSSProperties;
}

function formatAvailability(availableToday?: boolean, nextAvailableDate?: string): string {
  if (availableToday) return "Today";
  if (!nextAvailableDate) return "See calendar";

  return new Date(`${nextAvailableDate}T00:00:00`).toLocaleDateString("default", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ListingProviderCard({
  authorName,
  authorSurname,
  price,
  city,
  availableToday,
  nextAvailableDate,
  tags,
  publicVerifiedCredentials = [],
  onBookNow,
  className,
  style,
}: ListingProviderCardProps) {
  const displayName = `${authorName} ${authorSurname.charAt(0)}.`;
  const [showVerifiedDetails, setShowVerifiedDetails] = useState(false);
  const verifiedDetailsId = useId();
  const hasPublicVerifiedCredentials = publicVerifiedCredentials.length > 0;

  return (
    <aside
      className={cn(
        "flex flex-col gap-5 bg-charcoal text-primary-foreground rounded-2xl p-6 h-fit",
        className,
      )}
      style={style}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <AvatarIcon
          firstName={authorName}
          size={64}
          bgColorClassName="bg-primary"
          className="ring-2 ring-primary-foreground/70"
        />
        <p className="font-semibold">{displayName}</p>
        {hasPublicVerifiedCredentials && (
          <span className="relative inline-flex">
            <span
              tabIndex={0}
              aria-describedby={showVerifiedDetails ? verifiedDetailsId : undefined}
              onMouseEnter={() => setShowVerifiedDetails(true)}
              onMouseLeave={() => setShowVerifiedDetails(false)}
              onFocus={() => setShowVerifiedDetails(true)}
              onBlur={() => setShowVerifiedDetails(false)}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-small font-medium bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80"
            >
              <Check size={14} aria-hidden="true" />
              Verified
            </span>
            {showVerifiedDetails && (
              <span
                id={verifiedDetailsId}
                role="tooltip"
                className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-background px-3 py-2 text-left text-small text-foreground shadow-lg ring-1 ring-border"
              >
                <span className="block font-semibold">Verified credentials</span>
                <span className="mt-1 block">
                  {publicVerifiedCredentials.map((credential) => credential.name).join(", ")}
                </span>
              </span>
            )}
          </span>
        )}
      </div>

      <div>
        <span className="text-h2 font-bold">{price}€</span>
        <span className="text-small text-primary-foreground/60"> /hr</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onBookNow}
        className="bg-cream text-primary hover:bg-cream/90 active:bg-cream/90"
      >
        Book Now
      </Button>
      {/* Messaging isn't built yet — button is intentionally inert for now. */}
      <Button variant="primary" size="lg" fullWidth leadingIcon={<MessageCircle />}>
        Message {authorName}
      </Button>

      <dl className="flex flex-col gap-2 text-small border-t border-primary-foreground/20 pt-4">
        <div className="flex justify-between">
          <dt className="text-primary-foreground/60">Location</dt>
          <dd className="font-medium">{city}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-primary-foreground/60">Availability</dt>
          <dd className="font-medium">
            {formatAvailability(availableToday, nextAvailableDate)}
          </dd>
        </div>
      </dl>

      <div className="border-t border-primary-foreground/20 pt-4">
        <p className="text-small font-semibold mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.tagId}
              text={tag.name}
              variant={tag.isBarrierefrei ? "accent" : "primary"}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
