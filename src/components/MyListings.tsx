import { Plus } from "lucide-react";
import { Button } from "./Button";
import {
  MyListingCard,
  type MyListingSummary,
  type PublicationStatus,
} from "./MyListingCard";
import { Pagination } from "./Pagination";

export type StatusFilter = "ALL" | PublicationStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PAUSED", label: "Paused" },
  { value: "DELETED", label: "Deleted" },
];

interface MyListingsProps {
  listings: MyListingSummary[];
  statusFilter: StatusFilter;
  statusCounts: Partial<Record<StatusFilter, number>>;
  loading: boolean;
  error: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onStatusFilterChange: (value: StatusFilter) => void;
  onCreate: () => void;
  onEdit: (listingId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

function StatusFilterBar({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  counts: Partial<Record<StatusFilter, number>>;
}) {
  return (
    <div
      role="group"
      aria-label="Filter services by status"
      className="flex flex-wrap gap-2"
    >
      {STATUS_FILTERS.map((filter) => {
        const selected = filter.value === value;
        const count = counts[filter.value];
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={selected}
            aria-label={filter.label}
            onClick={() => onChange(filter.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-small font-semibold transition-colors ${
              selected
                ? "bg-foreground text-cream"
                : "border border-foreground/25 text-foreground hover:bg-black/5"
            }`}
          >
            {filter.label}
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

function CreateServiceButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-accent text-accent font-bold hover:bg-accent/5 active:bg-accent/10 shrink-0"
      trailingIcon={
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-cream shrink-0">
          <Plus size={14} aria-hidden="true" />
        </span>
      }
    >
      Create service
    </Button>
  );
}

export function MyListings({
  listings,
  statusFilter,
  statusCounts,
  loading,
  error,
  hasPreviousPage,
  hasNextPage,
  onStatusFilterChange,
  onCreate,
  onEdit,
  onNextPage,
  onPreviousPage,
}: MyListingsProps) {
  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-8"
    >
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 animate-fade-in-up">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-h1 font-bold text-foreground">
                My Services
              </h1>
              <p className="text-small text-muted">
                Manage your listed services and track their status.
              </p>
            </div>
            <CreateServiceButton onClick={onCreate} />
          </div>

          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "60ms" }}
          >
            <StatusFilterBar
              value={statusFilter}
              onChange={onStatusFilterChange}
              counts={statusCounts}
            />
          </div>

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="flex justify-center py-16"
            >
              <p className="text-small text-muted">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <p role="alert" className="text-small text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              {statusFilter === "ALL" ? (
                <>
                  <p className="text-body text-muted">
                    You haven't created any services yet.
                  </p>
                  <CreateServiceButton onClick={onCreate} />
                </>
              ) : (
                <p className="text-body text-muted">
                  No {statusFilter.toLowerCase()} services.
                </p>
              )}
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <>
              <ul
                role="list"
                aria-label="Your services"
                className="flex flex-col gap-4 list-none m-0 p-0"
              >
                {listings.map((listing, index) => (
                  <li
                    key={listing.listingId}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${Math.min(index * 60, 420) + 120}ms`,
                    }}
                  >
                    <MyListingCard listing={listing} onEdit={onEdit} />
                  </li>
                ))}
              </ul>
              {(hasPreviousPage || hasNextPage) && (
                <Pagination
                  onPrevious={onPreviousPage}
                  onNext={onNextPage}
                  disablePrevious={!hasPreviousPage}
                  disableNext={!hasNextPage}
                  className="mt-6 flex justify-center"
                />
              )}
            </>
          )}
        </div>
    </main>
  );
}
