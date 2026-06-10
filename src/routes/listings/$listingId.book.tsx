import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Sunrise, Sun } from 'lucide-react'
import { Navbar } from '../../components/Navbar'
import { CalendarGrid } from '../../components/CalendarGrid'
import { Button } from '../../components/Button'
import { authFetch } from '../../lib/queryClient'

export const Route = createFileRoute('/listings/$listingId/book')({
  component: BookingPage,
})

interface TimeWindow {
  start: string
  end: string
}

interface DayAvailability {
  date: string
  workingHours: TimeWindow[]
  freeWindows: TimeWindow[]
}

interface AvailabilityResponse {
  userId: string
  days: DayAvailability[]
}

function isDayPast(date: Date, today: Date): boolean {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return dateMidnight.getTime() < todayMidnight.getTime()
}

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

function toLocalDatetime(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:00`
}

function formatTime(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleTimeString('default', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function freeHours(windows: TimeWindow[]): number {
  return windows.reduce((sum, w) =>
    sum + (new Date(w.end).getTime() - new Date(w.start).getTime()) / 36e5, 0)
}

function dotCount(windows: TimeWindow[]): number {
  const h = freeHours(windows)
  if (h >= 6) return 3
  if (h >= 3) return 2
  return 1
}

function generateHourSlots(windows: TimeWindow[]): string[] {
  const slots: string[] = []
  for (const w of windows) {
    const cur = new Date(w.start)
    const end = new Date(w.end)
    while (cur.getTime() + 3600000 <= end.getTime()) {
      slots.push(toLocalDatetime(cur))
      cur.setHours(cur.getHours() + 1)
    }
  }
  return slots
}

function BookingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const from = new Date(year, month - 1, 1)
  const to = new Date(year, month, 0)

  const { data: availability } = useQuery<AvailabilityResponse>({
    queryKey: ['availability', listingId, year, month],
    queryFn: async () => {
      const res = await authFetch(
        `/v1/listings/${listingId}/availability?from=${toLocalDate(from)}&to=${toLocalDate(to)}`
      )
      if (!res.ok) throw new Error('Failed to fetch availability')
      return res.json() as Promise<AvailabilityResponse>
    },
    staleTime: 5 * 60 * 1000,
  })

  const dayMap = new Map<string, DayAvailability>(
    availability?.days.map((d) => [d.date, d]) ?? []
  )

  const wholeMonthUnavailable =
    availability !== undefined &&
    availability.days.every((d) => d.freeWindows.length === 0)

  function renderDay(date: Date) {
    const past = isDayPast(date, today)
    const isSelected = selectedDate?.toDateString() === date.toDateString()
    const isToday = date.toDateString() === today.toDateString()
    const dayData = dayMap.get(toLocalDate(date))
    const hasSlots = (dayData?.freeWindows.length ?? 0) > 0
    const unavailable = !past && dayData !== undefined && !hasSlots
    const dots = !past && !isSelected && hasSlots ? dotCount(dayData!.freeWindows) : 0

    return (
      <button
        type="button"
        disabled={past || unavailable}
        onClick={() => {
          setSelectedDate(date)
          setSelectedSlot(null)
        }}
        aria-label={date.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
        aria-pressed={isSelected}
        className={[
          'relative w-full aspect-square rounded-lg text-small font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          past ? 'text-muted/30 cursor-not-allowed' : '',
          unavailable ? 'text-muted/50 cursor-not-allowed' : '',
          isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : '',
          isToday && !isSelected ? 'ring-1 ring-primary text-primary' : '',
          !isSelected && !past && !unavailable ? 'hover:bg-mint' : '',
          !isSelected && !isToday && !past && !unavailable ? 'text-foreground' : '',
        ].join(' ')}
      >
        <span className={unavailable ? 'line-through' : undefined}>
          {date.getDate()}
        </span>
        {dots > 0 && (
          <span aria-hidden="true" className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {Array.from({ length: dots }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-primary" />
            ))}
          </span>
        )}
      </button>
    )
  }

  const selectedDayData = selectedDate ? dayMap.get(toLocalDate(selectedDate)) : undefined
  const hourSlots = selectedDayData ? generateHourSlots(selectedDayData.freeWindows) : []
  const morningSlots = hourSlots.filter((s) => new Date(s).getHours() < 12)
  const afternoonSlots = hourSlots.filter((s) => new Date(s).getHours() >= 12)

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-1.5 text-small text-muted hover:text-foreground transition-colors mb-6"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <h1 className="mb-6">Book a service</h1>

        <section
          aria-labelledby="pick-datetime-heading"
          className="bg-surface rounded-2xl border border-border p-6 mb-4"
        >
          <h2 id="pick-datetime-heading" className="text-body font-semibold text-foreground mb-4">
            Pick a date and a time
          </h2>

          <div className="flex">
            <div className="flex-[3] min-w-0 pr-6">
              <CalendarGrid
                year={year}
                month={month}
                onMonthChange={(y, m) => {
                  setYear(y)
                  setMonth(m)
                  setSelectedDate(null)
                  setSelectedSlot(null)
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

            <div className="flex-[2] border-l border-border pl-6" aria-live="polite">
              {!selectedDate ? (
                <p className="text-small text-muted mt-2">Select a date to see available times.</p>
              ) : hourSlots.length === 0 ? (
                <p className="text-small text-muted mt-2">No availability on this day.</p>
              ) : (
                <>
                  <p className="text-small font-semibold text-foreground mb-0.5">
                    {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-xs text-primary mb-3">{hourSlots.length} open slots</p>

                  {morningSlots.length > 0 && (
                    <div className="mb-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                          <Sunrise size={12} aria-hidden="true" />
                          Morning
                        </p>
                      <div className="grid grid-cols-2 gap-1" role="listbox" aria-label="Morning slots">
                        {morningSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="option"
                            aria-selected={selectedSlot === slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                              selectedSlot === slot
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border text-foreground hover:bg-mint hover:border-primary/30',
                            ].join(' ')}
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
                          <Sun size={12} aria-hidden="true" />
                          Afternoon
                        </p>
                      <div className="grid grid-cols-2 gap-1" role="listbox" aria-label="Afternoon slots">
                        {afternoonSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="option"
                            aria-selected={selectedSlot === slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                              selectedSlot === slot
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border text-foreground hover:bg-mint hover:border-primary/30',
                            ].join(' ')}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="primary" disabled={!selectedDate || !selectedSlot}>
            Continue
          </Button>
        </div>
      </main>
    </div>
  )
}
