import { useState } from "react";
import { AlertTriangle, CalendarDays, Plus, Clock, MapPin } from "lucide-react";
import { Navbar } from "./Navbar";
import { CalendarGrid } from "./CalendarGrid";
import { Button } from "./Button";
import { StatusBadge } from "./BookingCard";
import { WeeklyScheduleModal } from "./WeeklyScheduleModal";
import { ExceptionModal } from "./ExceptionModal";
import type {
  BookingSummary,
  DayOfWeek,
  ProblemDetailsResponse,
  ReplaceWeeklyScheduleRequest,
  ScheduleExceptionResponse,
  WeeklyScheduleEntry,
} from "../api/model";
import type {
  CreateScheduleExceptionInput,
  UpdateScheduleExceptionInput,
} from "./ExceptionModal";

type BackendDayOfWeek = DayOfWeek;
type CalendarBooking = BookingSummary;

const JS_DAY_TO_BACKEND: BackendDayOfWeek[] = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

export interface CalendarPageProps {
  userId: string | undefined;
  isProvider: boolean;
  today: Date;
  year: number;
  month: number;
  selectedDate: Date;
  monthBookings: CalendarBooking[];
  upcomingBookings: CalendarBooking[];
  scheduleEntries: WeeklyScheduleEntry[];
  scheduleLoaded: boolean;
  scheduleLoading: boolean;
  exceptions: ScheduleExceptionResponse[];
  scheduleSaving: boolean;
  scheduleError: unknown;
  exceptionCreating: boolean;
  exceptionError: unknown;
  onMonthChange: (year: number, month: number) => void;
  onSelectedDateChange: (date: Date) => void;
  onToday: () => void;
  onSaveSchedule: (
    schedule: Pick<ReplaceWeeklyScheduleRequest, "entries">,
  ) => void;
  onCreateException: (exception: CreateScheduleExceptionInput) => void;
  onUpdateException: (
    exceptionId: string,
    exception: UpdateScheduleExceptionInput,
  ) => void;
  onDeleteException: (exceptionId: string) => void;
  onCreateListing: () => void;
}

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function formatTime(isoDatetime: string): string {
  const d = new Date(isoDatetime);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function durationHours(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 3600000,
  );
}

function bookingDateKey(isoDatetime: string): string {
  return toLocalDate(new Date(isoDatetime));
}

function groupByDate(
  bookings: CalendarBooking[],
): Record<string, CalendarBooking[]> {
  const map: Record<string, CalendarBooking[]> = {};
  for (const booking of bookings) {
    const key = bookingDateKey(booking.bookedStart);
    if (!map[key]) map[key] = [];
    map[key].push(booking);
  }
  return map;
}

function mutationErrorMessage(error: unknown, fallback: string) {
  if (!error) return null;
  const problem = error as ProblemDetailsResponse | undefined;
  return problem?.detail ?? fallback;
}

function BookingDayCard({ booking }: { booking: CalendarBooking }) {
  const duration = durationHours(booking.bookedStart, booking.bookedEnd);
  const address = booking.serviceAddress
    ? `${booking.serviceAddress.street} ${booking.serviceAddress.houseNumber}, ${booking.serviceAddress.city}`
    : "Remote";

  return (
    <div
      role="article"
      className="rounded-xl border border-border p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-foreground">
            {formatTime(booking.bookedStart)}
          </p>
          <p className="text-sm text-foreground mt-0.5">
            {booking.listing.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.counterparty.name} {booking.counterparty.surname}
            {" · "}
            {duration}h{" · "}€{booking.totalPrice}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin size={12} aria-hidden="true" className="shrink-0" />
        <span>{address}</span>
      </div>
    </div>
  );
}

function UpcomingRow({ booking }: { booking: CalendarBooking }) {
  const d = new Date(booking.bookedStart);
  const monthAbbr = d.toLocaleString("en", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const address = booking.serviceAddress
    ? `${booking.serviceAddress.street} ${booking.serviceAddress.houseNumber}, ${booking.serviceAddress.city}`
    : "Remote";

  return (
    <div
      role="article"
      className="flex items-start gap-3 py-3 border-t border-border/60 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-col items-center min-w-9">
        <span className="text-xs font-semibold text-muted-foreground">
          {monthAbbr}
        </span>
        <span className="text-lg font-bold text-foreground leading-tight">
          {day}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {booking.listing.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {booking.counterparty.name} {booking.counterparty.surname}
          {" · "}
          <Clock size={10} className="inline" aria-hidden="true" />{" "}
          {formatTime(booking.bookedStart)}
          {" · "}
          {durationHours(booking.bookedStart, booking.bookedEnd)}h
        </p>
        <p className="text-xs text-muted-foreground truncate">{address}</p>
      </div>
      <StatusBadge status={booking.status} />
    </div>
  );
}

export function CalendarPage({
  userId,
  isProvider,
  today,
  year,
  month,
  selectedDate,
  monthBookings,
  upcomingBookings,
  scheduleEntries,
  scheduleLoaded,
  scheduleLoading,
  exceptions,
  scheduleSaving,
  scheduleError,
  exceptionCreating,
  exceptionError,
  onMonthChange,
  onSelectedDateChange,
  onToday,
  onSaveSchedule,
  onCreateException,
  onUpdateException,
  onDeleteException,
  onCreateListing,
}: CalendarPageProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const workingDays = new Set(scheduleEntries.map((entry) => entry.dayOfWeek));
  const showMissingScheduleWarning =
    isProvider && scheduleLoaded && scheduleEntries.length === 0;

  const exceptionsByDate = exceptions.reduce<
    Record<string, ScheduleExceptionResponse[]>
  >((acc, exception) => {
    if (!acc[exception.date]) acc[exception.date] = [];
    acc[exception.date].push(exception);
    return acc;
  }, {});

  const bookingsByDate = groupByDate(monthBookings);
  const selectedKey = toLocalDate(selectedDate);
  const selectedBookings = bookingsByDate[selectedKey] ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isProvider
                ? "Manage your bookings, working hours & time off."
                : "See your upcoming bookings."}
            </p>
          </div>

          {isProvider && (
            <div className="flex items-center gap-3">
              {scheduleEntries.length > 0 && (
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={<Plus size={16} />}
                  onClick={onCreateListing}
                >
                  Create listing
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                leadingIcon={<CalendarDays size={16} />}
                onClick={() => setScheduleOpen(true)}
              >
                Weekly schedule
              </Button>
              <Button
                variant="accent"
                size="md"
                leadingIcon={<Plus size={16} />}
                onClick={() => setExceptionOpen(true)}
              >
                Add exception
              </Button>
            </div>
          )}
        </div>

        {showMissingScheduleWarning && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            <AlertTriangle
              size={18}
              className="shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p>
              No weekly schedule is set. You might want to{" "}
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="font-semibold text-amber-950 underline underline-offset-2 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2"
              >
                set it
              </button>
              .
            </p>
          </div>
        )}

        <div className="flex gap-6 items-start">
          <div className="flex-3 rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center justify-between">
              {isProvider && (
                <div
                  role="list"
                  aria-label="Calendar legend"
                  className="flex items-center gap-5 text-xs text-muted-foreground"
                >
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-forest"
                      aria-hidden="true"
                    />
                    Booking
                  </span>
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-foreground/30"
                      aria-hidden="true"
                    />
                    Off (schedule)
                  </span>
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-plum"
                      aria-hidden="true"
                    />
                    Blocked (exception)
                  </span>
                </div>
              )}
              <button
                onClick={onToday}
                className="ml-auto rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Today
              </button>
            </div>

            <CalendarGrid
              year={year}
              month={month}
              onMonthChange={onMonthChange}
              renderDay={(date) => {
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const isSelected =
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();

                const dayKey = toLocalDate(date);
                const isPast =
                  date <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  );
                const dayBookings = bookingsByDate[dayKey] ?? [];
                const dayExceptions = exceptionsByDate[dayKey] ?? [];
                const blockedEx = dayExceptions.find(
                  (exception) => exception.exceptionType === "BLOCKED",
                );
                const isBlocked = !!blockedEx;
                const hasExtra = dayExceptions.some(
                  (exception) => exception.exceptionType === "AVAILABLE",
                );
                const backendDay = JS_DAY_TO_BACKEND[date.getDay()];
                const isNonWorking =
                  isProvider &&
                  scheduleLoaded &&
                  !workingDays.has(backendDay) &&
                  !hasExtra;

                return (
                  <button
                    onClick={() => onSelectedDateChange(date)}
                    aria-label={[
                      date.toLocaleDateString("en", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                      isNonWorking ? "Not a working day" : null,
                      isBlocked && blockedEx?.startTime
                        ? `Partially blocked from ${blockedEx.startTime.slice(0, 5)} to ${blockedEx.endTime?.slice(0, 5)}, consumers cannot book during this window`
                        : isBlocked
                          ? "Fully blocked, consumers cannot book this day"
                          : null,
                      hasExtra
                        ? "Extra availability added outside regular hours"
                        : null,
                      dayBookings.length === 1
                        ? "1 booking"
                        : dayBookings.length > 1
                          ? `${dayBookings.length} bookings`
                          : null,
                    ]
                      .filter(Boolean)
                      .join(". ")}
                    aria-pressed={isSelected}
                    className={[
                      "w-full min-h-20 p-1.5 flex flex-col items-start text-xs transition-colors rounded-lg border",
                      isSelected
                        ? "border-forest bg-mint"
                        : isBlocked
                          ? "border-border bg-foreground/10"
                          : isNonWorking
                            ? "border-border bg-foreground/5"
                            : "border-border hover:bg-linen",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between w-full gap-1">
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium shrink-0",
                          isToday
                            ? "bg-forest text-white"
                            : isPast || isNonWorking
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>
                      {isProvider &&
                        (isBlocked || hasExtra || isNonWorking) && (
                          <span className="flex flex-wrap gap-0.5 justify-end">
                            {isNonWorking && !isBlocked && (
                              <span className="rounded-full bg-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold text-foreground/70 leading-none">
                                OFF
                              </span>
                            )}
                            {isBlocked && (
                              <span className="rounded-full bg-plum px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                                BLK
                              </span>
                            )}
                            {hasExtra && (
                              <span className="rounded-full bg-forest px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                                +AVAIL
                              </span>
                            )}
                          </span>
                        )}
                    </span>

                    <span className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                      {dayBookings.slice(0, 1).map((booking) => (
                        <span
                          key={booking.bookingId}
                          className="truncate text-forest font-medium leading-tight bg-mint rounded px-1"
                        >
                          {formatTime(booking.bookedStart)}{" "}
                          {booking.counterparty.name}
                        </span>
                      ))}
                      {dayBookings.length > 1 && (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground leading-tight"
                        >
                          +{dayBookings.length - 1} more
                        </span>
                      )}
                    </span>
                  </button>
                );
              }}
            />
          </div>

          <div className="flex-2 flex flex-col gap-4">
            <div
              className="rounded-2xl border border-border bg-surface p-5"
              aria-live="polite"
              aria-atomic="true"
            >
              <h2 className="mb-3 text-base font-bold text-foreground">
                {selectedDate.toLocaleDateString("en", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              {selectedBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookings on this day.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedBookings.map((booking) => (
                    <BookingDayCard key={booking.bookingId} booking={booking} />
                  ))}
                </div>
              )}
            </div>

            <div
              className="rounded-2xl border border-border bg-surface p-5"
              aria-label="Upcoming appointments"
            >
              <h2 className="mb-3 text-base font-bold text-foreground">
                Upcoming appointments
              </h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming appointments.
                </p>
              ) : (
                <div className="flex flex-col">
                  {upcomingBookings.map((booking) => (
                    <UpcomingRow key={booking.bookingId} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isProvider && userId && (
        <>
          <WeeklyScheduleModal
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            entries={scheduleEntries}
            isLoading={scheduleLoading}
            isSaving={scheduleSaving}
            errorMessage={mutationErrorMessage(
              scheduleError,
              "Failed to save schedule",
            )}
            onSave={onSaveSchedule}
          />
          <ExceptionModal
            open={exceptionOpen}
            onClose={() => setExceptionOpen(false)}
            exceptions={exceptions}
            isCreating={exceptionCreating}
            errorMessage={mutationErrorMessage(
              exceptionError,
              "Failed to add exception",
            )}
            onCreate={onCreateException}
            onUpdate={onUpdateException}
            onDelete={onDeleteException}
          />
        </>
      )}
    </div>
  );
}
