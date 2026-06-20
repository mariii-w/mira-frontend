import { Check, MessageCircle } from "lucide-react";
import { AvatarIcon } from "./AvatarIcon";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { ServiceTag } from "../api/model";

export interface ListingProviderCardProps {
  authorName: string;
  authorSurname: string;
  price: number;
  city: string;
  availableToday?: boolean;
  tags: ServiceTag[];
  onBookNow: () => void;
}

export function ListingProviderCard({
  authorName,
  authorSurname,
  price,
  city,
  availableToday,
  tags,
  onBookNow,
}: ListingProviderCardProps) {
  const displayName = `${authorName} ${authorSurname.charAt(0)}.`;

  return (
    <aside className="flex flex-col gap-5 bg-charcoal text-primary-foreground rounded-2xl p-6 h-fit">
      <div className="flex flex-col items-center text-center gap-2">
        <AvatarIcon firstName={authorName} size={64} bgColorClassName="bg-primary" />
        <p className="font-semibold">{displayName}</p>
        {/* Always shown for now — tie to real verification status once credentials gating ships. */}
        <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-small font-medium bg-primary text-primary-foreground">
          <Check size={14} aria-hidden="true" />
          Verified
        </span>
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
          <dd className="font-medium">{availableToday ? "Today" : "See calendar"}</dd>
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
