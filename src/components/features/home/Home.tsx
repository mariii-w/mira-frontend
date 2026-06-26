import {
  Search,
  Check,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../../common/ui/Button";
import { CategoryCard } from "./CategoryCard";
import { ServiceCard } from "../listings/ServiceCard";
import { useAccessibilityStore } from "../../../stores/accessibility";
import { useAuthStore } from "../../../stores/auth";
import { getServiceTags, getPublicListings } from "../../../api/mira";
import type { PublicListingSummary, ServiceTag } from "../../../api/model";
import { mediaUrl } from "../../../lib/mediaUrl";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";
async function fetchServiceTags(): Promise<ServiceTag[]> {
  const response = await getServiceTags();
  if (response.status !== 200) throw new Error("Tags could not be loaded.");
  return response.data ?? [];
}

async function fetchFeaturedListings(): Promise<PublicListingSummary[]> {
  const response = await getPublicListings({ limit: 8 });
  if (response.status !== 200) throw new Error("Helpers could not be loaded.");
  return response.data.items;
}

const NEED_HELP_BULLETS = [
  "Filter by category, price and location",
  "See real bios before you book",
  "Request a booking in a few clicks",
];

const CAN_HELP_BULLETS = [
  "List your services for free",
  "Set your own price and schedule",
  "Accept and manage booking requests",
];

const NEED_HELP_STEPS = [
  {
    n: 1,
    title: "Search & Filter",
    desc: "Type what you need, filter by location radius, category, price or rating.",
  },
  {
    n: 2,
    title: "Chat with the helper",
    desc: "Message directly to agree on details, timing or any special requests.",
  },
  {
    n: 3,
    title: "Book",
    desc: "Pick a time slot and send your booking request. The provider confirms availability.",
  },
  {
    n: 4,
    title: "Pay",
    desc: "Pay via Stripe once your booking is confirmed. Your payment is held until the job is done.",
  },
];

const CAN_HELP_STEPS = [
  {
    n: 1,
    title: "Register as a provider",
    desc: "Verify your identity and complete your profile.",
  },
  {
    n: 2,
    title: "Create your listings",
    desc: "Add title, description, images, price and location for each service.",
  },
  {
    n: 3,
    title: "Accept & deliver",
    desc: "Receive booking requests, chat with the customer, confirm timing and show up.",
  },
  {
    n: 4,
    title: "Get paid",
    desc: "Payment is released to you once the service is marked complete. Simple.",
  },
];

type CarouselScrollState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

const initialCarouselScrollState: CarouselScrollState = {
  canScrollLeft: false,
  canScrollRight: false,
};

function getCarouselScrollState(
  element: HTMLElement | null,
): CarouselScrollState {
  if (!element) return initialCarouselScrollState;

  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  if (maxScrollLeft <= 1) return initialCarouselScrollState;

  return {
    canScrollLeft: element.scrollLeft > 1,
    canScrollRight: element.scrollLeft < maxScrollLeft - 1,
  };
}

function setCarouselScrollState(
  setState: Dispatch<SetStateAction<CarouselScrollState>>,
  nextState: CarouselScrollState,
) {
  setState((currentState) =>
    currentState.canScrollLeft === nextState.canScrollLeft &&
    currentState.canScrollRight === nextState.canScrollRight
      ? currentState
      : nextState,
  );
}

// Curated photo per category tag name. Names must match the real ServiceTag
// labels from the backend. Only tags present here are eligible to show up in "Popular Categories".
const CATEGORY_IMAGES: Record<string, string> = {
  Cleaning:
    "https://images.unsplash.com/photo-1740657254989-42fe9c3b8cce?fm=jpg&q=60&w=800&auto=format&fit=crop",
  Tutoring:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?fm=jpg&q=60&w=800&auto=format&fit=crop",
  Childcare:
    "https://images.unsplash.com/photo-1537655780520-1e392ead81f2?fm=jpg&q=60&w=800&auto=format&fit=crop",
  "IT & Smartphone Help":
    "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?fm=jpg&q=60&w=800&auto=format&fit=crop",
  Gardening:
    "https://images.unsplash.com/photo-1611843467160-25afb8df1074?fm=jpg&q=60&w=800&auto=format&fit=crop",
  "Small Repairs":
    "https://images.unsplash.com/photo-1721332154191-ba5f1534266e?fm=jpg&q=60&w=800&auto=format&fit=crop",
  "Senior Support":
    "https://images.unsplash.com/photo-1540778339538-067eae485e9f?fm=jpg&q=60&w=800&auto=format&fit=crop",
  "Disability Support":
    "https://images.unsplash.com/photo-1723433892471-62f113c8c9a0?fm=jpg&q=60&w=800&auto=format&fit=crop",
};

function toListingCards(listings: PublicListingSummary[], easyRead: boolean) {
  return listings.map((listing) => ({
    listingId: listing.listingId,
    label: listing.title,
    providerFirstName: listing.author.name,
    providerLastName: listing.author.surname,
    location: listing.location.city,
    description:
      easyRead && listing.easyDescription
        ? listing.easyDescription
        : listing.description,
    tags: listing.tags,
    hourRate: listing.price,
    pictureLink: listing.primaryMedia
      ? mediaUrl(listing.primaryMedia.url)
      : undefined,
  }));
}

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const categoryRef = useRef<HTMLUListElement>(null);
  const providerRef = useRef<HTMLUListElement>(null);
  const [categoryScrollState, setCategoryScrollState] = useState(
    initialCarouselScrollState,
  );
  const [listingScrollState, setListingScrollState] = useState(
    initialCarouselScrollState,
  );
  const easyRead = useAccessibilityStore((state) => state.easyRead);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const tagsQuery = useQuery({
    queryKey: ["service-tags"],
    queryFn: fetchServiceTags,
    staleTime: 1000 * 60 * 5,
  });

  const featuredListingsQuery = useQuery({
    queryKey: ["featured-listings"],
    queryFn: fetchFeaturedListings,
  });

  const listingCards = toListingCards(
    featuredListingsQuery.data ?? [],
    easyRead,
  );

  const categories = (tagsQuery.data ?? [])
    .filter((tag) => tag.isActive && tag.name in CATEGORY_IMAGES)
    .map((tag) => ({
      tagId: tag.tagId,
      name: tag.name,
      imageSrc: CATEGORY_IMAGES[tag.name],
    }));

  const updateCategoryScrollState = useCallback(() => {
    setCarouselScrollState(
      setCategoryScrollState,
      getCarouselScrollState(categoryRef.current),
    );
  }, []);

  const updateListingScrollState = useCallback(() => {
    setCarouselScrollState(
      setListingScrollState,
      getCarouselScrollState(providerRef.current),
    );
  }, []);

  useEffect(() => {
    updateCategoryScrollState();
  }, [categories.length, tagsQuery.isLoading, updateCategoryScrollState]);

  useEffect(() => {
    updateListingScrollState();
  }, [
    featuredListingsQuery.isLoading,
    listingCards.length,
    updateListingScrollState,
  ]);

  useEffect(() => {
    function handleResize() {
      updateCategoryScrollState();
      updateListingScrollState();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCategoryScrollState, updateListingScrollState]);

  function scroll(
    ref: RefObject<HTMLUListElement | null>,
    dir: "left" | "right",
    updateScrollState: () => void,
  ) {
    ref.current?.scrollBy({
      left: dir === "right" ? 280 : -280,
      behavior: "smooth",
    });
    window.requestAnimationFrame(updateScrollState);
  }

  return (
    <>
      <main id="main-content">
        {/* ── Hero ── */}
        <section
          className="bg-background px-6 py-20 text-center"
          aria-labelledby="hero-heading"
        >
          <h1
            id="hero-heading"
            className="font-heading text-5xl font-bold leading-tight"
          >
            <span className="text-primary">Give help.</span>{" "}
            <span className="text-accent">Get help.</span>
          </h1>
          <p className="mt-4 text-muted text-body max-w-md mx-auto">
            On Mira, anyone can offer services or find them.
            <br />
            Pick your path!
          </p>

          <div className="mt-12 mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* I need help */}
            <article
              className="rounded-2xl border border-primary/30 bg-mint p-6 text-left flex flex-col gap-4"
              aria-labelledby="need-help-heading"
            >
              <span className="inline-flex self-start rounded-full bg-primary px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I need help
              </span>
              <h2
                id="need-help-heading"
                className="text-primary text-xl font-heading font-bold"
              >
                Find trusted helpers near you
              </h2>
              <p className="text-small text-foreground/70">
                Search thousands of verified services in your neighbourhood.
                Book in minutes, pay securely, leave a review.
              </p>
              <form
                role="search"
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({
                    to: "/browse-services",
                    search: { q: query, city: "", tagIds: [], from: undefined },
                  });
                }}
              >
                <label htmlFor="hero-search" className="sr-only">
                  Search for a service
                </label>
                <input
                  id="hero-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. PC support, tutoring…"
                  className="flex-1 h-11 px-4 text-small text-foreground bg-surface border border-border rounded-full placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors duration-150"
                />
                <Button
                  variant="primary"
                  trailingIcon={<Search />}
                  size="md"
                  type="submit"
                >
                  Search
                </Button>
              </form>
              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {NEED_HELP_BULLETS.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-small text-foreground/70"
                  >
                    <Check
                      size={14}
                      className="text-primary shrink-0"
                      aria-hidden="true"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </article>

            {/* I can help */}
            <article
              className="rounded-2xl border border-accent/30 bg-blush p-6 text-left flex flex-col gap-4"
              aria-labelledby="can-help-heading"
            >
              <span className="inline-flex self-start rounded-full bg-accent px-3 py-1 text-label font-bold text-cream uppercase tracking-wide">
                I can help
              </span>
              <h2
                id="can-help-heading"
                className="text-accent text-xl font-heading font-bold"
              >
                Turn your skills into income
              </h2>
              <p className="text-small text-foreground/70">
                List the services you offer, set your prices and schedule. We
                handle bookings, payments and reviews — keep your time.
              </p>
              {!user ? (
                <a
                  href={`${API_BASE_URL}/auth/login/google`}
                  className="relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-accent px-8 text-body font-medium text-accent-foreground no-underline transition-colors duration-150 hover:bg-accent-hover active:bg-accent-hover [&_svg]:size-5"
                >
                  Get started
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <ArrowRight />
                  </span>
                </a>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  trailingIcon={<ArrowRight />}
                  fullWidth
                  onClick={() => {
                    if (user.userType === "PROVIDER") {
                      navigate({ to: "/my-listings" });
                      return;
                    }

                    navigate({
                      to: "/browse-services",
                      search: {
                        q: "",
                        city: "",
                        tagIds: [],
                        from: undefined,
                      },
                    });
                  }}
                >
                  Get started
                </Button>
              )}
              {isLoggedIn && (
                <p className="text-small text-foreground/70 text-center -mt-1">
                  You're already signed in.
                </p>
              )}
              <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                {CAN_HELP_BULLETS.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-small text-foreground/70"
                  >
                    <Check
                      size={14}
                      className="text-accent shrink-0"
                      aria-hidden="true"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* ── How Mira Works ── */}
        <section
          id="how-it-works"
          className="bg-linen px-6 py-20"
          aria-labelledby="how-it-works-heading"
        >
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-label font-bold text-accent uppercase tracking-widest mb-2">
              How Mira Works
            </p>
            <h2
              id="how-it-works-heading"
              className="text-center font-heading text-4xl font-bold text-foreground mb-2"
            >
              Simple for both sides
            </h2>
            <p className="text-center text-muted text-body mb-12">
              No sign-up to browse. No hidden fees. No stress.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <article
                className="rounded-2xl border border-primary/30 bg-surface p-6 flex flex-col gap-4"
                aria-labelledby="need-help-steps-heading"
              >
                <h3
                  id="need-help-steps-heading"
                  className="font-heading font-bold text-xl text-primary"
                >
                  If you need help
                </h3>
                <p className="text-small text-muted">
                  Go from idea to booked in under 5 minutes.
                </p>
                <ol className="flex flex-col divide-y divide-border/30 list-none m-0 p-0">
                  {NEED_HELP_STEPS.map((step) => (
                    <li
                      key={step.n}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span
                        className="shrink-0 w-9 h-9 rounded-full bg-mint border border-primary/30 flex items-center justify-center text-small font-bold text-primary"
                        aria-hidden="true"
                      >
                        {step.n}
                      </span>
                      <div>
                        <p className="font-bold text-small text-foreground">
                          <span className="sr-only">Step {step.n}: </span>
                          {step.title}
                        </p>
                        <p className="text-small text-foreground/70 mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              <article
                className="rounded-2xl border border-accent/30 bg-surface p-6 flex flex-col gap-4"
                aria-labelledby="can-help-steps-heading"
              >
                <h3
                  id="can-help-steps-heading"
                  className="font-heading font-bold text-xl text-accent"
                >
                  If you offer help
                </h3>
                <p className="text-small text-muted">
                  Your schedule, your rates, your reputation.
                </p>
                <ol className="flex flex-col divide-y divide-border/30 list-none m-0 p-0">
                  {CAN_HELP_STEPS.map((step) => (
                    <li
                      key={step.n}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span
                        className="shrink-0 w-9 h-9 rounded-full bg-blush border border-accent/30 flex items-center justify-center text-small font-bold text-accent"
                        aria-hidden="true"
                      >
                        {step.n}
                      </span>
                      <div>
                        <p className="font-bold text-small text-foreground">
                          <span className="sr-only">Step {step.n}: </span>
                          {step.title}
                        </p>
                        <p className="text-small text-foreground/70 mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </section>

        {/* ── Popular Categories ── */}
        <section
          className="bg-background py-20"
          aria-labelledby="categories-heading"
        >
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-label font-bold text-accent uppercase tracking-widest mb-2">
              Popular Categories
            </p>
            <div className="flex items-end justify-between mb-6">
              <h2
                id="categories-heading"
                className="font-heading text-4xl font-bold text-foreground"
              >
                What are people booking today?
              </h2>
              {!tagsQuery.isError && (
                <div
                  className="flex gap-2 shrink-0 ml-4"
                  role="group"
                  aria-label="Scroll categories"
                >
                  <button
                    type="button"
                    onClick={() =>
                      scroll(categoryRef, "left", updateCategoryScrollState)
                    }
                    disabled={!categoryScrollState.canScrollLeft}
                    aria-label="Scroll categories left"
                    aria-controls="categories-list"
                    className="w-10 h-10 cursor-pointer rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      scroll(categoryRef, "right", updateCategoryScrollState)
                    }
                    disabled={!categoryScrollState.canScrollRight}
                    aria-label="Scroll categories right"
                    aria-controls="categories-list"
                    className="w-10 h-10 cursor-pointer rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            {tagsQuery.isLoading && (
              <p role="status" aria-live="polite" className="sr-only">
                Loading categories…
              </p>
            )}
            {tagsQuery.isError && (
              <p role="alert" className="text-small text-red-600">
                Categories could not be loaded.
              </p>
            )}
            {!tagsQuery.isError && (
              <ul
                id="categories-list"
                ref={categoryRef}
                onScroll={updateCategoryScrollState}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth list-none m-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                style={{ scrollbarWidth: "none" }}
                tabIndex={0}
                aria-label="Popular service categories"
              >
                {tagsQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="snap-start shrink-0 w-48">
                        <div
                          aria-hidden="true"
                          className="aspect-square w-full animate-pulse rounded-2xl border border-border bg-linen"
                        />
                      </li>
                    ))
                  : categories.map((cat) => (
                      <li key={cat.tagId} className="snap-start shrink-0 w-48">
                        <CategoryCard
                          name={cat.name}
                          imageSrc={cat.imageSrc}
                          onClick={() =>
                            navigate({
                              to: "/browse-services",
                              search: {
                                q: "",
                                city: "",
                                tagIds: [cat.tagId],
                                from: undefined,
                              },
                            })
                          }
                        />
                      </li>
                    ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Popular listings ── */}
        <section className="bg-linen py-20" aria-labelledby="nearby-heading">
          <div className="mx-auto max-w-4xl px-6">
            <h2
              id="nearby-heading"
              className="font-heading text-3xl font-bold text-foreground mb-1"
            >
              Popular listings
            </h2>
            <div className="flex items-end justify-between mb-6">
              <p className="text-muted text-small">
                Some of the services currently listed on Mira
              </p>
              {!featuredListingsQuery.isError &&
                (featuredListingsQuery.isLoading ||
                  listingCards.length > 0) && (
                  <div
                    className="flex gap-2 shrink-0 ml-4"
                    role="group"
                    aria-label="Scroll listings"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        scroll(providerRef, "left", updateListingScrollState)
                      }
                      disabled={!listingScrollState.canScrollLeft}
                      aria-label="Scroll listings left"
                      aria-controls="listings-list"
                      className="w-10 h-10 cursor-pointer rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        scroll(providerRef, "right", updateListingScrollState)
                      }
                      disabled={!listingScrollState.canScrollRight}
                      aria-label="Scroll listings right"
                      aria-controls="listings-list"
                      className="w-10 h-10 cursor-pointer rounded-full border border-border flex items-center justify-center text-foreground hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}
            </div>
            {featuredListingsQuery.isLoading && (
              <p role="status" aria-live="polite" className="sr-only">
                Loading listings…
              </p>
            )}
            {featuredListingsQuery.isError ? (
              <p
                role="alert"
                className="text-small text-red-600 py-8 text-center"
              >
                Listings could not be loaded.
              </p>
            ) : !featuredListingsQuery.isLoading &&
              listingCards.length === 0 ? (
              <p className="text-body text-muted py-8 text-center">
                No listings found near you yet.
              </p>
            ) : (
              <>
                <ul
                  id="listings-list"
                  ref={providerRef}
                  onScroll={updateListingScrollState}
                  className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth list-none m-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                  style={{ scrollbarWidth: "none" }}
                  tabIndex={0}
                  aria-label="Popular listings"
                >
                  {featuredListingsQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="snap-start shrink-0 w-64">
                          <div
                            aria-hidden="true"
                            className="h-56 w-full animate-pulse rounded-2xl border border-border bg-linen"
                          />
                        </li>
                      ))
                    : listingCards.map((listing) => (
                        <li
                          key={listing.listingId}
                          className="snap-start shrink-0 w-64 flex"
                        >
                          <ServiceCard
                            variant="compact"
                            link={`/listings/${listing.listingId}`}
                            label={listing.label}
                            providerFirstName={listing.providerFirstName}
                            providerLastName={listing.providerLastName}
                            location={listing.location}
                            description={listing.description}
                            tags={listing.tags}
                            hourRate={listing.hourRate}
                            pictureLink={listing.pictureLink}
                          />
                        </li>
                      ))}
                </ul>
                {!featuredListingsQuery.isLoading && (
                  <div className="mt-8 text-center">
                    <Link
                      to="/browse-services"
                      search={{ q: "", city: "", tagIds: [] }}
                      className="inline-flex items-center gap-2 text-primary font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      View all listings{" "}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
