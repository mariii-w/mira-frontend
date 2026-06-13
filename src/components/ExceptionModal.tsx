import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from './Modal'
import { Button } from './Button'
import { authFetch } from '../lib/queryClient'

type ExceptionType = 'BLOCKED' | 'AVAILABLE'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function ExceptionModal({ open, onClose, userId }: Props) {
  const queryClient = useQueryClient()
  // Add form state
  const [type, setType] = useState<ExceptionType>('BLOCKED')
  const [date, setDate] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')

  const needsTimes = type === 'AVAILABLE' || !allDay
  const timeError = needsTimes && start >= end ? 'End time must be after start time' : null

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = { date, exceptionType: type }
      if (needsTimes) {
        body.startTime = `${start}:00`
        body.endTime = `${end}:00`
      }
      const res = await authFetch(`/v1/users/${userId}/exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail ?? 'Failed to add exception')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions', userId] })
      setType('BLOCKED')
      setDate('')
      setAllDay(true)
      setStart('09:00')
      setEnd('17:00')
      reset()
      onClose()
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Schedule Exceptions"
      description="Block time off or add extra availability for specific dates."
    >
      <div className="mt-4 flex flex-col gap-4">
          {/* Exception type label */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Exception type
          </p>

          {/* Type cards */}
          <div className="flex flex-col gap-2 -mt-2">
            {([
              {
                value: 'BLOCKED' as ExceptionType,
                label: 'Mark as unavailable',
                description: 'Consumers cannot book this time.',
              },
              {
                value: 'AVAILABLE' as ExceptionType,
                label: 'Add extra availability',
                description: 'Work outside your usual hours.',
              },
            ]).map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setType(value); setAllDay(value === 'BLOCKED') }}
                className={[
                  'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                  type === value
                    ? 'border-plum bg-plum/10'
                    : 'border-border bg-background hover:bg-foreground/5',
                ].join(' ')}
              >
                <p className={['text-sm font-semibold', type === value ? 'text-plum' : 'text-foreground'].join(' ')}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </button>
            ))}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exc-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </label>
            <input
              id="exc-date"
              type="date"
              value={date}
              min={tomorrowStr()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:opacity-60"
            />
          </div>

          {/* All day checkbox ÔÇö BLOCKED only */}
          {type === 'BLOCKED' && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 rounded accent-plum"
              />
              <span className="text-sm font-medium text-foreground">All day</span>
            </label>
          )}

          {/* Time inputs ÔÇö always for AVAILABLE, only when not all day for BLOCKED */}
          {needsTimes && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</span>
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    aria-label="Start time"
                    className="rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To</span>
                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    aria-label="End time"
                    className="rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>
              {timeError && (
                <p role="alert" className="text-xs text-red-600">{timeError}</p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>
          )}

          <div className="flex justify-end gap-3 mt-1">
            <Button variant="secondary" size="md" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={() => mutate()}
              disabled={isPending || !!timeError || !date}
            >
              {isPending
                ? 'SavingÔÇª'
                : type === 'BLOCKED'
                  ? 'Block this time'
                  : 'Add availability'}
            </Button>
          </div>
      </div>
    </Modal>
  )
}
