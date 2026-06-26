import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Sunrise,
  Sun,
  Home,
  MapPin,
  MapPinned,
  ArrowRight,
} from "lucide-react";
import type {
  CreateBookingRequest,
  LocationType,
  PublicListingDetails,
  ProviderAvailabilityResponse,
} from "../../../api/model";
import { CalendarGrid } from "./CalendarGrid";

interface TimeWindow {
  start: string;
  end: string;
}

type DayAvailability = ProviderAvailabilityResponse["days"][number];

interface BookingPageProps {
  listingId: string;
  year: number;
  month: number;
  availability?: ProviderAvailabilityResponse;
  listing?: PublicListingDetails;
  bookingPending: boolean;
  bookingError: string | null;
  onMonthChange: (year: number, month: number) => void;
  onBack: () => void;
  onCreateBooking: (booking: CreateBookingRequest) => void;
}

function isDayPast(date: Date, today: Date): boolean {
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return dateMidnight.getTime() < todayMidnight.getTime();
}

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function toLocalDatetime(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:00`;
}

function formatTime(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSlotLabel(slot: string): string {
  const d = new Date(slot);
  return (
    d.toLocaleDateString("default", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) +
    " · " +
    d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })
  );
}

function freeHours(windows: TimeWindow[]): number {
  return windows.reduce(
    (sum, w) =>
      sum + (new Date(w.end).getTime() - new Date(w.start).getTime()) / 36e5,
    0,
  );
}

function dotCount(windows: TimeWindow[]): number {
  const h = freeHours(windows);
  if (h >= 6) return 3;
  if (h >= 3) return 2;
  return 1;
}

function generateHourSlots(windows: TimeWindow[]): string[] {
  const slots: string[] = [];
  for (const w of windows) {
    const cur = new Date(w.start);
    const end = new Date(w.end);
    while (cur.getTime() + 3600000 <= end.getTime()) {
      slots.push(toLocalDatetime(cur));
      cur.setHours(cur.getHours() + 1);
    }
  }
  return slots;
}

function maxDurationForSlot(slot: string, windows: TimeWindow[]): number {
  const slotMs = new Date(slot).getTime();
  const w = windows.find(
    (w) =>
      new Date(w.start).getTime() <= slotMs &&
      slotMs < new Date(w.end).getTime(),
  );
  if (!w) return 1;
  return Math.min(12, Math.floor((new Date(w.end).getTime() - slotMs) / 36e5));
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

function initials(name: string, surname: string): string {
  return (name[0] ?? "") + (surname[0] ?? "");
}

export function BookingPage({
  listingId,
  year,
  month,
  availability,
  listing,
  bookingPending,
  bookingError,
  onMonthChange,
  onBack,
  onCreateBooking,
}: BookingPageProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(1);
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [description, setDescription] = useState("");

  const dayMap = new Map<string, DayAvailability>(
    availability?.days.map((d) => [d.date, d]) ?? [],
  );

  const wholeMonthUnavailable =
    availability !== undefined &&
    availability.days.every((d) => d.freeWindows.length === 0);

  const selectedDayData = selectedDate
    ? dayMap.get(toLocalDate(selectedDate))
    : undefined;
  const hourSlots = selectedDayData
    ? generateHourSlots(selectedDayData.freeWindows)
    : [];
  const morningSlots = hourSlots.filter((s) => new Date(s).getHours() < 12);
  const afternoonSlots = hourSlots.filter((s) => new Date(s).getHours() >= 12);
  const maxDuration =
    selectedSlot && selectedDayData
      ? maxDurationForSlot(selectedSlot, selectedDayData.freeWindows)
      : 12;

  const canSubmit =
    selectedSlot !== null &&
    locationType !== null &&
    description.length >= 10 &&
    description.length <= 2000;

  const estimatedTotal = listing
    ? (listing.price * durationHours).toFixed(2)
    : null;

  const locationOptions = [
    {
      value: "AT_CONSUMER" as LocationType,
      label: "At my place",
      Icon: Home,
      detail: "Your address will be shared with the provider once confirmed.",
    },
    {
      value: "AT_PROVIDER" as LocationType,
      label: "At provider's place",
      Icon: MapPin,
      detail:
        listing && listing.location
          ? `${listing.location.postalCode} ${listing.location.city}`
          : "—",
    },
  ];

  function renderDay(date: Date) {
    const past = isDayPast(date, today);
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const dayData = dayMap.get(toLocalDate(date));
    const hasSlots = (dayData?.freeWindows.length ?? 0) > 0;
    const unavailable = !past && dayData !== undefined && !hasSlots;
    const dots =
      !past && !isSelected && hasSlots ? dotCount(dayData!.freeWindows) : 0;

    return (
      <button
        type="button"
        disabled={past || unavailable}
        onClick={() => {
          setSelectedDate(date);
          setSelectedSlot(null);
          setDurationHours(1);
        }}
        aria-label={date.toLocaleDateString("default", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        aria-pressed={isSelected}
        className={[
          "relative w-full aspect-square rounded-lg text-small font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          past ? "text-muted/30 cursor-not-allowed" : "",
          unavailable ? "text-muted/50 cursor-not-allowed" : "",
          isSelected
            ? "bg-primary text-primary-foreground hover:bg-primary"
            : "",
          isToday && !isSelected ? "ring-1 ring-primary text-primary" : "",
          !isSelected && !past && !unavailable ? "hover:bg-mint" : "",
          !isSelected && !isToday && !past && !unavailable
            ? "text-foreground"
            : "",
        ].join(" ")}
      >
        <span className={unavailable ? "line-through" : undefined}>
          {date.getDate()}
        </span>
        {dots > 0 && (
          <span
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
          >
            {Array.from({ length: dots }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-primary" />
            ))}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-small text-muted hover:text-foreground transition-colors mb-6"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Listing
        </button>

        {listing && (
          <div
            className="rounded-2xl px-6 py-5 mb-4"
            style={{
              background: "linear-gradient(135deg, #47745B 0%, #7C4E80 100%)",
            }}
            aria-label="Listing summary"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full ring-2 ring-primary-foreground/40 bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-body shrink-0"
                  aria-hidden="true"
                >
                  {initials(listing.author.name, listing.author.surname)}
                </div>
                <div>
                  <p className="text-xs text-primary-foreground uppercase tracking-wide font-semibold mb-1">
                    You're booking
                  </p>
                  <p className="text-body font-bold text-primary-foreground mb-1">
                    {listing.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-primary-foreground">
                    <MapPinned size={11} aria-hidden="true" />
                    {listing.location?.city ?? "Location unavailable"}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-primary-foreground">
                  {listing.price}€
                </span>
                <span className="text-xs text-primary-foreground">
                  {" "}
                  / hr
                </span>
              </div>
            </div>
          </div>
        )}

        <section
          aria-labelledby="pick-datetime-heading"
          className="bg-linen rounded-2xl border border-border p-6 mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <StepBadge n={1} />
            <h2
              id="pick-datetime-heading"
              className="text-body font-semibold text-foreground"
            >
              Pick a date and a time
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row">
            <div className="flex-3 min-w-0 pb-6 lg:pb-0 lg:pr-6">
              <CalendarGrid
                year={year}
                month={month}
                onMonthChange={(y, m) => {
                  onMonthChange(y, m);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setDurationHours(1);
                }}
                minDate={today}
                renderDay={renderDay}
              />
              {wholeMonthUnavailable && (
                <p className="mt-4 text-small text-muted text-center">
                  No availability this month.
                </p>
              )}
            </div>

            <div
              className="flex-2 min-w-0 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6"
              aria-live="polite"
            >
              {!selectedDate ? (
                <p className="text-small text-muted mt-2">
                  Select a date to see available times.
                </p>
              ) : hourSlots.length === 0 ? (
                <p className="text-small text-muted mt-2">
                  No availability on this day.
                </p>
              ) : (
                <>
                  <p className="text-small font-semibold text-foreground mb-0.5">
                    {selectedDate.toLocaleDateString("default", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-xs text-primary mb-3">
                    {hourSlots.length} open slots
                  </p>

                  {morningSlots.length > 0 && (
                    <div className="mb-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                        <Sunrise size={12} aria-hidden="true" /> Morning
                      </p>
                      <div
                        className="grid grid-cols-2 gap-1"
                        role="listbox"
                        aria-label="Morning slots"
                      >
                        {morningSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="option"
                            aria-selected={selectedSlot === slot}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setDurationHours(1);
                            }}
                            className={[
                              "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                              selectedSlot === slot
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-foreground hover:bg-mint hover:border-primary/30",
                            ].join(" ")}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {afternoonSlots.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                        <Sun size={12} aria-hidden="true" /> Afternoon
                      </p>
                      <div
                        className="grid grid-cols-2 gap-1"
                        role="listbox"
                        aria-label="Afternoon slots"
                      >
                        {afternoonSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="option"
                            aria-selected={selectedSlot === slot}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setDurationHours(1);
                            }}
                            className={[
                              "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                              selectedSlot === slot
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-foreground hover:bg-mint hover:border-primary/30",
                            ].join(" ")}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                        Estimated duration
                      </p>
                      <div
                        className="flex items-center gap-3"
                        role="group"
                        aria-label="Duration"
                      >
                        <button
                          type="button"
                          aria-label="Decrease duration"
                          disabled={durationHours <= 1}
                          onClick={() =>
                            setDurationHours((h) => Math.max(1, h - 1))
                          }
                          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-mint disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span
                          className="min-w-[4ch] text-center text-small font-semibold text-foreground"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {durationHours}h
                        </span>
                        <button
                          type="button"
                          aria-label="Increase duration"
                          disabled={durationHours >= maxDuration}
                          onClick={() =>
                            setDurationHours((h) =>
                              Math.min(maxDuration, h + 1),
                            )
                          }
                          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-mint disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="details-heading"
          className="bg-linen rounded-2xl border border-border p-6 mb-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <StepBadge n={2} />
            <h2
              id="details-heading"
              className="text-body font-semibold text-foreground"
            >
              Where and what
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <p
                id="location-label"
                className="text-small font-medium text-foreground mb-3"
              >
                Location
              </p>
              <div
                className="space-y-2"
                role="radiogroup"
                aria-labelledby="location-label"
              >
                {locationOptions.map(({ value, label, Icon, detail }) => {
                  const isSelected = locationType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLocationType(value)}
                      className={[
                        "w-full rounded-xl border p-4 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                        isSelected
                          ? "bg-mint border-primary"
                          : "bg-background border-border hover:border-primary/40",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-border/20 text-muted",
                          ].join(" ")}
                        >
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <div>
                          <p
                            className={[
                              "text-small font-semibold",
                              isSelected ? "text-primary" : "text-foreground",
                            ].join(" ")}
                          >
                            {label}
                          </p>
                          {isSelected && (
                            <p className="text-xs text-muted mt-0.5">
                              {detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <label
                htmlFor="description"
                className="block text-small font-medium text-foreground mb-2"
              >
                Tell the provider what you need
              </label>
              <textarea
                id="description"
                rows={7}
                placeholder="Describe the issue or what you'd like done..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                className={[
                  "w-full rounded-xl border bg-background px-4 py-3 text-small text-foreground",
                  "placeholder:text-muted resize-none transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  description.length > 0 && description.length < 10
                    ? "border-destructive"
                    : "border-border",
                ].join(" ")}
                aria-describedby="desc-hint"
                aria-invalid={description.length > 0 && description.length < 10 ? true : undefined}
              />
              <p
                id="desc-hint"
                className={[
                  "mt-1 text-xs text-right",
                  description.length > 0 && description.length < 10
                    ? "text-destructive"
                    : "text-muted",
                ].join(" ")}
              >
                {description.length}/2000
                {description.length > 0 && description.length < 10
                  ? " — min 10 characters"
                  : ""}
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-linen border-t border-border z-10">
        {bookingError && (
          <div className="max-w-4xl mx-auto px-4 pt-2">
            <p className="text-xs text-destructive" role="alert">
              {bookingError}
            </p>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Date & time
              </p>
              <p className="text-small font-medium text-foreground truncate">
                {selectedSlot ? formatSlotLabel(selectedSlot) : "—"}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Duration
              </p>
              <p className="text-small font-medium text-foreground">
                {durationHours}h
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Location
              </p>
              <p className="text-small font-medium text-foreground">
                {locationType === "AT_CONSUMER"
                  ? "At your place"
                  : locationType === "AT_PROVIDER"
                    ? "At provider's"
                    : "—"}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Estimated total
              </p>
              <p className="text-small font-semibold text-foreground">
                {estimatedTotal ? `${estimatedTotal} €` : "—"}
              </p>
            </div>
          </div>
          {!canSubmit && (
            <span id="booking-submit-hint" className="sr-only">
              {[
                !selectedSlot && "Select a date and time.",
                !locationType && "Select a location type.",
                description.length < 10 && "Description must be at least 10 characters.",
              ].filter(Boolean).join(" ")}
            </span>
          )}
          <button
            type="button"
            disabled={!canSubmit || bookingPending}
            aria-describedby={!canSubmit ? "booking-submit-hint" : undefined}
            onClick={() => {
              if (!selectedSlot || !locationType) return;
              onCreateBooking({
                listingId,
                bookedStart: selectedSlot,
                durationHours,
                locationType,
                description,
              });
            }}
            className={[
              "flex items-center gap-2 px-6 py-3 rounded-xl text-small font-semibold transition-colors shrink-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              canSubmit && !bookingPending
                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                : "bg-muted/20 text-muted cursor-not-allowed",
            ].join(" ")}
          >
            {bookingPending ? "Sending…" : "Send booking request"}
            {!bookingPending && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}
