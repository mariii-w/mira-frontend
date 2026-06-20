import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Breadcrumb } from "./BreadCrumb";
import { ListingProviderCard } from "./ListingProviderCard";
import { mediaUrl } from "../lib/mediaUrl";
import type { PublicListingDetails, PublicListingSummary } from "../api/model";

export interface ListingDetailPageProps {
  listing?: PublicListingDetails;
  loading: boolean;
  error?: string | null;
  description?: string;
  availableToday?: boolean;
  otherListings: PublicListingSummary[];
  onBookNow: () => void;
}

export function ListingDetailPage({
  listing,
  loading,
  error,
  description,
  availableToday,
  otherListings,
  onBookNow,
}: ListingDetailPageProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <p className="max-w-7xl mx-auto px-6 py-16 text-muted">Loading…</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <p className="max-w-7xl mx-auto px-6 py-16 text-destructive" role="alert">
          {error ?? "Listing not found."}
        </p>
      </div>
    );
  }

  const media = [...listing.media].sort((a, b) => a.position - b.position);
  const activeMedia = media[activeMediaIndex] ?? media[0];

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb
          className="mb-4"
          links={[
            { name: "Home", href: "/" },
            { name: "Services", href: "/browse-services" },
            { name: listing.title, href: "#" },
          ]}
        />

        <h1 className="text-h1 font-heading font-bold text-foreground mb-6">
          {listing.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="flex flex-col gap-6 min-w-0">
            {activeMedia && (
              <div className="flex flex-col gap-3">
                <img
                  src={mediaUrl(activeMedia.url)}
                  alt={
                    activeMedia.altTextStatus === "COMPLETED" && activeMedia.altText
                      ? activeMedia.altText
                      : listing.title
                  }
                  className="w-full h-[28rem] object-cover rounded-2xl"
                />
                {media.length > 1 && (
                  <div className="flex gap-3" role="list" aria-label="Listing photos">
                    {media.map((item, index) => (
                      <div key={item.mediaId} role="listitem">
                        <button
                          type="button"
                          onClick={() => setActiveMediaIndex(index)}
                          aria-label={`Show photo ${index + 1}`}
                          aria-pressed={index === activeMediaIndex}
                          className={[
                            "w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors",
                            index === activeMediaIndex
                              ? "border-primary"
                              : "border-transparent",
                          ].join(" ")}
                        >
                          <img
                            src={mediaUrl(item.url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {description && (
              <p className="text-body text-foreground whitespace-pre-line">
                {description}
              </p>
            )}

            {otherListings.length > 0 && (
              <section
                aria-labelledby="other-services-heading"
                className="mt-4 pt-6 border-t border-border"
              >
                <h2
                  id="other-services-heading"
                  className="text-label font-semibold tracking-widest text-muted uppercase mb-4"
                >
                  Other services from {listing.author.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {otherListings.map((item) => (
                    <Link
                      key={item.listingId}
                      to="/listings/$listingId"
                      params={{ listingId: item.listingId }}
                      className="flex flex-col gap-2"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-linen">
                        {item.primaryMedia && (
                          <img
                            src={mediaUrl(item.primaryMedia.url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-small font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-small text-muted">From {item.price}€/h</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <ListingProviderCard
            authorName={listing.author.name}
            authorSurname={listing.author.surname}
            price={listing.price}
            city={listing.location.city}
            availableToday={availableToday}
            tags={listing.tags}
            onBookNow={onBookNow}
          />
        </div>
      </main>
    </div>
  );
}
