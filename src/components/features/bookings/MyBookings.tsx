import { useState } from "react";
import {
  BookingCard,
  type AllowedAction,
  type BookingDetails,
} from "./BookingCard";
import type { BookingStatus, BookingSummary } from "../../../api/model";

type BookingFilter = "ALL" | "REQUESTS" | "TO_PAY" | "ACTIVE" | "PAST";

interface MyBookingsProps {
  bookings: BookingSummary[];
  isProvider: boolean;
  loading: boolean;
  error: string | null;
  onActionComplete: () => void;
  loadBookingDetails: (bookingId: string) => Promise<BookingDetails | null>;
  performBookingAction: (
    bookingId: string,
    action: AllowedAction,
  ) => Promise<string | null>;
}

function buildFilters(
  isProvider: boolean,
): { value: BookingFilter; label: string }[] {
  return [
    { value: "ALL", label: "All" },
    { value: "REQUESTS", label: isProvider ? "Requests" : "Pending" },
    { value: "TO_PAY", label: isProvider ? "Awaiting payment" : "To pay" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAST", label: "Past" },
  ];
}

const ACTIVE_STATUSES: BookingStatus[] = ["PAID", "AWAITING_CONFIRMATION"];
const PAST_STATUSES: BookingStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "REFUSED",
];

function applyFilter(
  items: BookingSummary[],
  filter: BookingFilter,
): BookingSummary[] {
  if (filter === "ALL") return items;
  if (filter === "REQUESTS") return items.filter((b) => b.status === "PENDING");
  if (filter === "TO_PAY") return items.filter((b) => b.status === "CONFIRMED");
  if (filter === "ACTIVE")
    return items.filter((b) => ACTIVE_STATUSES.includes(b.status));
  if (filter === "PAST")
    return items.filter((b) => PAST_STATUSES.includes(b.status));
  return items;
}

function FilterBar({
  value,
  onChange,
  counts,
  filters,
}: {
  value: BookingFilter;
  onChange: (v: BookingFilter) => void;
  counts: Partial<Record<BookingFilter, number>>;
  filters: { value: BookingFilter; label: string }[];
}) {
  return (
    <div
      role="group"
      aria-label="Filter bookings"
      className="flex flex-wrap gap-2"
    >
      {filters.map((f) => {
        const selected = f.value === value;
        const count = counts[f.value];
        return (
          <button
            key={f.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(f.value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-small font-semibold transition-colors ${
              selected
                ? "bg-foreground text-cream"
                : "border border-foreground/25 text-foreground hover:bg-black/5"
            }`}
          >
            {f.label}
            {count !== undefined && (
              <span
                aria-hidden="true"
                className={`rounded-full px-1.5 py-0.5 text-xs leading-none ${
                  selected
                    ? "bg-white/20 text-cream"
                    : "bg-foreground/10 text-foreground"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function MyBookings({
  bookings,
  isProvider,
  loading,
  error,
  onActionComplete,
  loadBookingDetails,
  performBookingAction,
}: MyBookingsProps) {
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("ALL");
  const filtered = applyFilter(bookings, activeFilter);

  const counts: Partial<Record<BookingFilter, number>> = {
    ALL: bookings.length,
    REQUESTS: applyFilter(bookings, "REQUESTS").length,
    TO_PAY: applyFilter(bookings, "TO_PAY").length,
    ACTIVE: applyFilter(bookings, "ACTIVE").length,
    PAST: applyFilter(bookings, "PAST").length,
  };

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8">
        <section
          id="main-content"
          tabIndex={-1}
          aria-labelledby="bookings-heading"
          className="mx-auto max-w-3xl focus-visible:outline-none"
        >
          <div className="flex flex-col gap-1 mb-8 animate-fade-in-up">
            <h1 id="bookings-heading" className="font-heading text-h1 font-bold text-foreground">
              {isProvider ? "Bookings received" : "My Bookings"}
            </h1>
            <p className="text-small text-muted">
              {isProvider
                ? "Manage booking requests and track upcoming services."
                : "Track your service bookings and their status."}
            </p>
          </div>

          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "60ms" }}
          >
            <FilterBar
              value={activeFilter}
              onChange={setActiveFilter}
              counts={counts}
              filters={buildFilters(isProvider)}
            />
          </div>

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="flex justify-center py-16"
            >
              <p className="text-small text-muted">Loading...</p>
            </div>
          )}

          {!loading && error && (
            <p role="alert" className="text-small text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-body text-muted">
                {activeFilter === "ALL"
                  ? "No bookings yet."
                  : `No ${activeFilter.toLowerCase()} bookings.`}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <ul
              role="list"
              aria-label="Bookings"
              className="flex flex-col gap-4 list-none m-0 p-0"
            >
              {filtered.map((booking, index) => (
                <li
                  key={booking.bookingId}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${Math.min(index * 60, 420) + 120}ms`,
                  }}
                >
                  <BookingCard
                    booking={booking}
                    onActionComplete={onActionComplete}
                    loadBookingDetails={loadBookingDetails}
                    performBookingAction={performBookingAction}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
