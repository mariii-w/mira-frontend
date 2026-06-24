import { useState, type ReactNode } from "react";
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
  nextAvailableDate?: string;
  otherListings: PublicListingSummary[];
  hasPublicVerifiedCredentials?: boolean;
  onBookNow: () => void;
  banner?: ReactNode;
}

export function ListingDetailPage({
  listing,
  loading,
  error,
  description,
  availableToday,
  nextAvailableDate,
  otherListings,
  hasPublicVerifiedCredentials = false,
  onBookNow,
  banner,
}: ListingDetailPageProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        {banner}
        <p className="max-w-7xl mx-auto px-6 py-16 text-muted">Loading…</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        {banner}
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
      {banner}
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb
          className="mb-4 animate-fade-in-up"
          links={[
            { name: "Home", href: "/" },
            { name: "Services", href: "/browse-services" },
            { name: listing.title, href: "#" },
          ]}
        />

        <h1
          className="text-h1 font-heading font-bold text-foreground mb-6 animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          {listing.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div
            className="flex flex-col gap-6 min-w-0 animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            {activeMedia && (
              <div className="flex flex-col gap-3">
                <img
                  key={activeMedia.mediaId}
                  src={mediaUrl(activeMedia.url)}
                  alt={
                    activeMedia.altTextStatus === "COMPLETED" && activeMedia.altText
                      ? activeMedia.altText
                      : listing.title
                  }
                  className="w-full h-[28rem] object-cover rounded-2xl animate-fade-in"
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
                            "w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-150",
                            "hover:scale-105 active:scale-95",
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
                  {otherListings.map((item, index) => (
                    <Link
                      key={item.listingId}
                      to="/listings/$listingId"
                      params={{ listingId: item.listingId }}
                      className="group flex flex-col gap-2 animate-fade-in-up"
                      style={{ animationDelay: `${180 + Math.min(index * 40, 200)}ms` }}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-linen">
                        {item.primaryMedia && (
                          <img
                            src={mediaUrl(item.primaryMedia.url)}
                            alt={
                              item.primaryMedia.altTextStatus === "COMPLETED" &&
                              item.primaryMedia.altText
                                ? item.primaryMedia.altText
                                : item.title
                            }
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
            nextAvailableDate={nextAvailableDate}
            tags={listing.tags}
            hasPublicVerifiedCredentials={hasPublicVerifiedCredentials}
            onBookNow={onBookNow}
            className="animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          />
        </div>
      </main>
    </div>
  );
}
