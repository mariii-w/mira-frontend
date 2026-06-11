import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { Pagination } from "../components/Pagination";
import {
  MyListingCard,
  type MyListingSummary,
  type PublicationStatus,
} from "../components/MyListingCard";
import { useAuthStore } from "../stores/auth";
import { authFetch } from "../lib/queryClient";

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute("/my-listings")({
  component: MyListingsPage,
});

type StatusFilter = "ALL" | PublicationStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PAUSED", label: "Paused" },
  { value: "DELETED", label: "Deleted" },
];

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

export function MyListingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [listings, setListings] = useState<MyListingSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([]);
  const [currentFrom, setCurrentFrom] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<
    Partial<Record<StatusFilter, number>>
  >({});

  useEffect(() => {
    if (!user) return;
    authFetch(`/v1/users/${user.userId}/listings?limit=100`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const counts: Partial<Record<StatusFilter, number>> = {
          ALL: data.items.length,
        };
        for (const item of data.items as MyListingSummary[]) {
          const s = item.publicationStatus as StatusFilter;
          counts[s] = (counts[s] ?? 0) + 1;
        }
        setStatusCounts(counts);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: "20" });

        if (currentFrom) {
          params.set("from", currentFrom);
        }

        if (statusFilter !== "ALL") {
          params.set("publicationStatus", statusFilter);
        }
        if (!user) return;

        const res = await authFetch(
          `/v1/users/${user.userId}/listings?${params.toString()}`,
        );

        if (!res.ok) {
          throw new Error("Failed to load listings.");
        }

        const data = await res.json();

        if (cancelled) return;

        setListings(data.items);
        setNextCursor(data.cursor?.next ?? null);
      } catch (e) {
        if (cancelled) return;

        setError(e instanceof Error ? e.message : "Failed to load listings.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [user, currentFrom, statusFilter]);

  function handleFilterChange(value: StatusFilter) {
    if (value === statusFilter) return;
    setPrevCursors([]);
    setCurrentFrom(null);
    setStatusFilter(value);
  }

  const hasPrev = prevCursors.length > 0;

  function handleNext() {
    if (!nextCursor) return;
    setPrevCursors((prev) => [...prev, currentFrom]);
    setCurrentFrom(nextCursor);
  }

  function handlePrev() {
    if (!hasPrev) return;
    const stack = prevCursors.slice();
    const from = stack.pop() ?? null;
    setPrevCursors(stack);
    setCurrentFrom(from);
  }

  function handleCreate() {
    navigate({ to: "/create-listing" });
  }

  function handleEdit(id: string) {
    navigate({
      to: "/edit-listing/$listingId",
      params: { listingId: id },
    });
  }

  return (
    <>
      <Navbar />
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
            <CreateServiceButton onClick={handleCreate} />
          </div>

          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "60ms" }}
          >
            <StatusFilterBar
              value={statusFilter}
              onChange={handleFilterChange}
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
                  <CreateServiceButton onClick={handleCreate} />
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
                    <MyListingCard listing={listing} onEdit={handleEdit} />
                  </li>
                ))}
              </ul>
              {(hasPrev || nextCursor) && (
                <Pagination
                  onPrevious={handlePrev}
                  onNext={handleNext}
                  disablePrevious={!hasPrev}
                  disableNext={!nextCursor}
                  className="mt-6 flex justify-center"
                />
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
