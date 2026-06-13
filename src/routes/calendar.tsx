import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Plus, Clock, MapPin } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { CalendarGrid } from '../components/CalendarGrid'
import { Button } from '../components/Button'
import { StatusBadge, type BookingStatus } from '../components/BookingCard'
import { WeeklyScheduleModal } from '../components/WeeklyScheduleModal'
import { ExceptionModal } from '../components/ExceptionModal'
import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

// --- Types ---
type BackendDayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

interface ScheduleEntry {
  dayOfWeek: BackendDayOfWeek
  startTime: string
  endTime: string
}

// JS getDay(): 0=Sun,1=Mon,...,6=Sat  ÔåÆ  backend enum
const JS_DAY_TO_BACKEND: BackendDayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

interface ScheduleException {
  exceptionId: string
  date: string          // "YYYY-MM-DD"
  exceptionType: 'BLOCKED' | 'AVAILABLE'
  startTime: string | null
  endTime: string | null
}

interface CalendarBooking {
  bookingId: string
  listingId: string
  listing: { title: string }
  counterparty: { userId: string; name: string; surname: string }
  status: BookingStatus
  serviceAddress: { street: string; houseNumber: string; city: string; postalCode: string } | null
  totalPrice: number
  bookedStart: string
  bookedEnd: string
}

// --- Helpers ---
function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

function formatTime(isoDatetime: string): string {
  const d = new Date(isoDatetime)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function durationHours(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3600000)
}

function bookingDateKey(isoDatetime: string): string {
  return toLocalDate(new Date(isoDatetime))
}

function groupByDate(bookings: CalendarBooking[]): Record<string, CalendarBooking[]> {
  const map: Record<string, CalendarBooking[]> = {}
  for (const b of bookings) {
    const key = bookingDateKey(b.bookedStart)
    if (!map[key]) map[key] = []
    map[key].push(b)
  }
  return map
}

function fetchCalendar(userId: string, from: string, to: string) {
  return authFetch(`/v1/users/${userId}/calendar?from=${from}&to=${to}`)
    .then((r) => {
      if (!r.ok) throw new Error('Failed to load calendar')
      return r.json() as Promise<{ items: CalendarBooking[] }>
    })
}

// --- Sub-components ---
// eslint-disable-next-line react-refresh/only-export-components
function BookingDayCard({ booking }: { booking: CalendarBooking }) {
  const duration = durationHours(booking.bookedStart, booking.bookedEnd)
  const address = booking.serviceAddress
    ? `${booking.serviceAddress.street} ${booking.serviceAddress.houseNumber}, ${booking.serviceAddress.city}`
    : 'Remote'

  return (
    <div role="article" className="rounded-xl border border-border p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-foreground">{formatTime(booking.bookedStart)}</p>
          <p className="text-sm text-foreground mt-0.5">{booking.listing.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.counterparty.name} {booking.counterparty.surname}
            {' ┬À '}{duration}h{' ┬À '}Ôé¼{booking.totalPrice}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin size={12} aria-hidden="true" className="shrink-0" />
        <span>{address}</span>
      </div>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function UpcomingRow({ booking }: { booking: CalendarBooking }) {
  const d = new Date(booking.bookedStart)
  const monthAbbr = d.toLocaleString('en', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  const address = booking.serviceAddress
    ? `${booking.serviceAddress.street} ${booking.serviceAddress.houseNumber}, ${booking.serviceAddress.city}`
    : 'Remote'

  return (
    <div role="article" className="flex items-start gap-3 py-3 border-t border-border/60 first:border-t-0 first:pt-0">
      {/* Date badge */}
      <div className="flex flex-col items-center min-w-[36px]">
        <span className="text-xs font-semibold text-muted-foreground">{monthAbbr}</span>
        <span className="text-lg font-bold text-foreground leading-tight">{day}</span>
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{booking.listing.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {booking.counterparty.name} {booking.counterparty.surname}
          {' ┬À '}<Clock size={10} className="inline" aria-hidden="true" /> {formatTime(booking.bookedStart)}
          {' ┬À '}{durationHours(booking.bookedStart, booking.bookedEnd)}h
        </p>
        <p className="text-xs text-muted-foreground truncate">{address}</p>
      </div>
      <StatusBadge status={booking.status} />
    </div>
  )
}

// --- Main page ---
// eslint-disable-next-line react-refresh/only-export-components
export function CalendarPage() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.userId
  const isProvider = user?.userType === 'PROVIDER'

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [exceptionOpen, setExceptionOpen] = useState(false)

  // Month range for calendar grid
  const from = toLocalDate(new Date(year, month - 1, 1))
  const to = toLocalDate(new Date(year, month, 0))

  // Upcoming range: today ÔåÆ today+30
  const upcomingTo = new Date(today)
  upcomingTo.setDate(upcomingTo.getDate() + 30)
  const upcomingFrom = toLocalDate(today)
  const upcomingToStr = toLocalDate(upcomingTo)

  const { data: monthData } = useQuery({
    queryKey: ['calendar', userId, from, to],
    queryFn: () => fetchCalendar(userId!, from, to),
    enabled: !!userId,
  })

  const { data: upcomingData } = useQuery({
    queryKey: ['calendar-upcoming', userId, upcomingFrom, upcomingToStr],
    queryFn: () => fetchCalendar(userId!, upcomingFrom, upcomingToStr),
    enabled: !!userId,
  })

  const { data: exceptionsData } = useQuery({
    queryKey: ['exceptions', userId],
    queryFn: async () => {
      const res = await authFetch(`/v1/users/${userId}/exceptions`)
      if (!res.ok) throw new Error('Failed to load exceptions')
      return res.json() as Promise<{ items: ScheduleException[] }>
    },
    enabled: !!userId && isProvider,
  })

  const { data: scheduleData } = useQuery({
    queryKey: ['schedule', userId],
    queryFn: async () => {
      const res = await authFetch(`/v1/users/${userId}/schedule`)
      if (!res.ok) throw new Error('Failed to load schedule')
      return res.json() as Promise<{ entries: ScheduleEntry[] }>
    },
    enabled: !!userId && isProvider,
  })

  const workingDays = new Set((scheduleData?.entries ?? []).map((e) => e.dayOfWeek))

  const exceptionsByDate = (exceptionsData?.items ?? []).reduce<Record<string, ScheduleException[]>>(
    (acc, ex) => {
      if (!acc[ex.date]) acc[ex.date] = []
      acc[ex.date].push(ex)
      return acc
    },
    {},
  )

  const bookingsByDate = groupByDate(monthData?.items ?? [])
  const selectedKey = toLocalDate(selectedDate)
  const selectedBookings = bookingsByDate[selectedKey] ?? []

  const upcomingBookings = (upcomingData?.items ?? [])
    .filter((b) => new Date(b.bookedStart) > today)
    .sort((a, b) => new Date(a.bookedStart).getTime() - new Date(b.bookedStart).getTime())

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDate(today)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isProvider
                ? 'Manage your bookings, working hours & time off.'
                : 'See your upcoming bookings.'}
            </p>
          </div>

          {isProvider && (
            <div className="flex items-center gap-3">
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

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Calendar card */}
          <div className="flex-[3] rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center justify-between">
              {isProvider && (
                <div role="list" aria-label="Calendar legend" className="flex items-center gap-5 text-xs text-muted-foreground">
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-forest" aria-hidden="true" />
                    Booking
                  </span>
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" aria-hidden="true" />
                    Off (schedule)
                  </span>
                  <span role="listitem" className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-plum" aria-hidden="true" />
                    Blocked (exception)
                  </span>
                </div>
              )}
              <button
                onClick={goToday}
                className="ml-auto rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Today
              </button>
            </div>

            <CalendarGrid
              year={year}
              month={month}
              onMonthChange={handleMonthChange}
              renderDay={(date) => {
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                const isSelected =
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()

                const dayKey = toLocalDate(date)
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const dayBookings = bookingsByDate[dayKey] ?? []
                const dayExceptions = exceptionsByDate[dayKey] ?? []
                const blockedEx = dayExceptions.find((e) => e.exceptionType === 'BLOCKED')
                const isBlocked = !!blockedEx
                const hasExtra = dayExceptions.some((e) => e.exceptionType === 'AVAILABLE')
                const backendDay = JS_DAY_TO_BACKEND[date.getDay()]
                // Non-working: schedule loaded, day not in working days, no AVAILABLE exception overriding
                const isNonWorking = isProvider && scheduleData != null && !workingDays.has(backendDay) && !hasExtra

                return (
                  <button
                    onClick={() => setSelectedDate(date)}
                    aria-label={[
                      date.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                      isNonWorking ? 'Not a working day' : null,
                      isBlocked && blockedEx?.startTime
                        ? `Partially blocked from ${blockedEx.startTime.slice(0,5)} to ${blockedEx.endTime?.slice(0,5)}, consumers cannot book during this window`
                        : isBlocked
                          ? 'Fully blocked, consumers cannot book this day'
                          : null,
                      hasExtra ? 'Extra availability added outside regular hours' : null,
                      dayBookings.length === 1 ? '1 booking' : dayBookings.length > 1 ? `${dayBookings.length} bookings` : null,
                    ].filter(Boolean).join('. ')}
                    aria-pressed={isSelected}
                    className={[
                      'w-full min-h-[80px] p-1.5 flex flex-col items-start text-xs transition-colors rounded-lg border',
                      isSelected
                        ? 'border-forest bg-mint'
                        : isBlocked
                          ? 'border-border bg-foreground/10'
                          : isNonWorking
                            ? 'border-border bg-foreground/5'
                            : 'border-border hover:bg-linen',
                    ].join(' ')}
                  >
                    {/* Day number row + badges inline */}
                    <span className="flex items-center justify-between w-full gap-1">
                      <span
                        className={[
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium shrink-0',
                          isToday ? 'bg-forest text-white' : (isPast || isNonWorking) ? 'text-muted-foreground line-through' : 'text-foreground',
                        ].join(' ')}
                      >
                        {date.getDate()}
                      </span>
                      {/* Exception / schedule badges ÔÇö provider only */}
                      {isProvider && (isBlocked || hasExtra || isNonWorking) && (
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
                      {dayBookings.slice(0, 1).map((b) => (
                        <span
                          key={b.bookingId}
                          className="truncate text-forest font-medium leading-tight bg-mint rounded px-1"
                        >
                          {formatTime(b.bookedStart)} {b.counterparty.name}
                        </span>
                      ))}
                      {dayBookings.length > 1 && (
                        <span aria-hidden="true" className="text-muted-foreground leading-tight">
                          +{dayBookings.length - 1} more
                        </span>
                      )}
                    </span>
                  </button>
                )
              }}
            />
          </div>

          {/* Right panel */}
          <div className="flex-[2] flex flex-col gap-4">
            {/* Selected day */}
            <div className="rounded-2xl border border-border bg-surface p-5" aria-live="polite" aria-atomic="true">
              <h2 className="mb-3 text-base font-bold text-foreground">
                {selectedDate.toLocaleDateString('en', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              {selectedBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings on this day.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedBookings.map((b) => (
                    <BookingDayCard key={b.bookingId} booking={b} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming appointments */}
            <div className="rounded-2xl border border-border bg-surface p-5" aria-label="Upcoming appointments">
              <h2 className="mb-3 text-base font-bold text-foreground">Upcoming appointments</h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                <div className="flex flex-col">
                  {upcomingBookings.map((b) => (
                    <UpcomingRow key={b.bookingId} booking={b} />
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
            userId={userId}
          />
          <ExceptionModal
            open={exceptionOpen}
            onClose={() => setExceptionOpen(false)}
            userId={userId}
          />
        </>
      )}
    </div>
  )
}
