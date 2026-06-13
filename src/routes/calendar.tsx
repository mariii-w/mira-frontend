import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { CalendarGrid } from '../components/CalendarGrid'
import { Button } from '../components/Button'
import { useAuthStore } from '../stores/auth'

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const user = useAuthStore((s) => s.user)
  const isProvider = user?.userType === 'PROVIDER'

  const today = new Date()
  // CalendarGrid uses 1-based months (1-12)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date>(today)

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
            {/* Today button row */}
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
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday ? 'bg-forest text-white' : 'text-foreground',
                      ].join(' ')}
                    >
                      {date.getDate()}
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
              <p className="text-sm text-muted-foreground">No bookings on this day.</p>
            </div>

            {/* Upcoming appointments */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Upcoming appointments</h2>
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
