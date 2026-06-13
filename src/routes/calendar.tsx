import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Plus } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { CalendarGrid } from '../components/CalendarGrid'
import { Button } from '../components/Button'
import { useAuthStore } from '../stores/auth'
import { authFetch } from '../lib/queryClient'

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

// --- Types ---
interface CalendarBooking {
  bookingId: string
  listingId: string
  listing: { title: string }
  counterparty: { userId: string; name: string; surname: string }
  status: string
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

function bookingDateKey(isoDatetime: string): string {
  const d = new Date(isoDatetime)
  return toLocalDate(d)
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

// --- Component ---
function CalendarPage() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.userId
  const isProvider = user?.userType === 'PROVIDER'

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  // First and last day of visible month
  const from = toLocalDate(new Date(year, month - 1, 1))
  const to = toLocalDate(new Date(year, month, 0))

  const { data } = useQuery({
    queryKey: ['calendar', userId, from, to],
    queryFn: async () => {
      const res = await authFetch(
        `/v1/users/${userId}/calendar?from=${from}&to=${to}`,
      )
      if (!res.ok) throw new Error('Failed to load calendar')
      return res.json() as Promise<{ items: CalendarBooking[] }>
    },
    enabled: !!userId,
  })

  const bookingsByDate = groupByDate(data?.items ?? [])

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDate(today)
  }

  const selectedKey = toLocalDate(selectedDate)
  const selectedBookings = bookingsByDate[selectedKey] ?? []

  // Upcoming: all bookings from today onwards, sorted
  const upcomingBookings = (data?.items ?? [])
    .filter((b) => new Date(b.bookedStart) >= today)
    .sort((a, b) => new Date(a.bookedStart).getTime() - new Date(b.bookedStart).getTime())
    .slice(0, 10)

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
              <Button variant="secondary" size="md" leadingIcon={<CalendarDays size={16} />}>
                Weekly schedule
              </Button>
              <Button variant="accent" size="md" leadingIcon={<Plus size={16} />}>
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
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-forest" aria-hidden="true" />
                    Booking
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-plum" aria-hidden="true" />
                    Unavailable (blocked)
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
                const dayBookings = bookingsByDate[dayKey] ?? []

                return (
                  <button
                    onClick={() => setSelectedDate(date)}
                    aria-label={date.toLocaleDateString('en', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    aria-pressed={isSelected}
                    className={[
                      'w-full min-h-[80px] p-1.5 flex flex-col items-start text-xs transition-colors rounded-lg border',
                      isSelected
                        ? 'border-forest bg-mint'
                        : 'border-border hover:bg-linen',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium shrink-0',
                        isToday ? 'bg-forest text-white' : 'text-foreground',
                      ].join(' ')}
                    >
                      {date.getDate()}
                    </span>

                    {/* Booking labels */}
                    <span className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                      {dayBookings.slice(0, 2).map((b) => (
                        <span
                          key={b.bookingId}
                          className="truncate text-forest font-medium leading-tight bg-mint rounded px-1"
                        >
                          {formatTime(b.bookedStart)} {b.counterparty.name}
                        </span>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-muted-foreground leading-tight">
                          +{dayBookings.length - 2} more
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
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {selectedDate.toLocaleDateString('en', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              {selectedBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings on this day.</p>
              ) : (
                <p className="text-sm text-muted-foreground">{selectedBookings.length} booking(s)</p>
              )}
            </div>

            {/* Upcoming appointments */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Upcoming appointments</h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                <p className="text-sm text-muted-foreground">{upcomingBookings.length} upcoming</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
