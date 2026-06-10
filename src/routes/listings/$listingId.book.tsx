import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '../../components/Navbar'
import { CalendarGrid } from '../../components/CalendarGrid'
import { Button } from '../../components/Button'

export const Route = createFileRoute('/listings/$listingId/book')({
  component: BookingPage,
})

function isDayPast(date: Date, today: Date): boolean {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return dateMidnight.getTime() < todayMidnight.getTime()
}

function BookingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  void listingId

  function renderDay(date: Date) {
    const past = isDayPast(date, today)
    const isSelected = selectedDate?.toDateString() === date.toDateString()
    const isToday = date.toDateString() === today.toDateString()

    return (
      <button
        type="button"
        disabled={past}
        onClick={() => setSelectedDate(date)}
        aria-label={date.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
        aria-pressed={isSelected}
        className={[
          'w-full aspect-square rounded-lg text-small font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          past ? 'text-muted/40 cursor-not-allowed' : '',
          isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : '',
          isToday && !isSelected ? 'ring-1 ring-primary text-primary' : '',
          !isSelected && !past ? 'hover:bg-mint' : '',
          !isSelected && !isToday && !past ? 'text-foreground' : '',
        ].join(' ')}
      >
        {date.getDate()}
      </button>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
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
          aria-labelledby="pick-date-heading"
          className="bg-surface rounded-2xl border border-border p-6 mb-4"
        >
          <h2
            id="pick-date-heading"
            className="text-body font-semibold text-foreground mb-4"
          >
            Pick a date
          </h2>
          <CalendarGrid
            year={year}
            month={month}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            minDate={today}
            renderDay={renderDay}
          />
        </section>

        {selectedDate && (
          <p className="text-small text-muted text-center mb-4">
            Selected:{' '}
            <strong className="text-foreground">
              {selectedDate.toLocaleDateString('default', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </strong>
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="primary" disabled={!selectedDate}>
            Continue
          </Button>
        </div>
      </main>
    </div>
  )
}
