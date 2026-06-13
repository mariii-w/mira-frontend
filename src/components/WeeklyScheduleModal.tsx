import { Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from './Modal'
import { Button } from './Button'
import { authFetch } from '../lib/queryClient'

type BackendDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

const ALL_DAYS: BackendDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_LABEL: Record<BackendDay, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday',
}

interface ScheduleEntry { dayOfWeek: BackendDay; startTime: string; endTime: string }
interface DayState { enabled: boolean; start: string; end: string }
type ScheduleState = Record<BackendDay, DayState>

function toInputTime(backendTime: string): string {
  return backendTime.slice(0, 5)
}

function toBackendTime(inputTime: string): string {
  return `${inputTime}:00`
}

function buildInitialState(entries: ScheduleEntry[]): ScheduleState {
  const map = Object.fromEntries(entries.map((e) => [e.dayOfWeek, e])) as Record<BackendDay, ScheduleEntry>
  return Object.fromEntries(
    ALL_DAYS.map((day) => [
      day,
      map[day]
        ? { enabled: true, start: toInputTime(map[day].startTime), end: toInputTime(map[day].endTime) }
        : { enabled: false, start: '09:00', end: '17:00' },
    ]),
  ) as ScheduleState
}

interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

export function WeeklyScheduleModal({ open, onClose, userId }: Props) {
  const queryClient = useQueryClient()
  const [overrides, setOverrides] = useState<Partial<ScheduleState>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', userId],
    queryFn: async () => {
      const res = await authFetch(`/v1/users/${userId}/schedule`)
      if (!res.ok) throw new Error('Failed to load schedule')
      return res.json() as Promise<{ entries: ScheduleEntry[] }>
    },
    enabled: open && !!userId,
  })

  const baseState = useMemo(() => buildInitialState(data?.entries ?? []), [data])
  const state = useMemo(() => ({ ...baseState, ...overrides }), [baseState, overrides])

  const { mutate: saveSchedule, isPending, error } = useMutation({
    mutationFn: async () => {
      const entries = ALL_DAYS.filter((d) => state[d].enabled).map((d) => ({
        dayOfWeek: d,
        startTime: toBackendTime(state[d].start),
        endTime: toBackendTime(state[d].end),
      }))
      const res = await authFetch(`/v1/users/${userId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail ?? 'Failed to save schedule')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', userId] })
      setOverrides({})
      onClose()
    },
  })

  function toggle(day: BackendDay) {
    setOverrides((o) => ({ ...o, [day]: { ...state[day], enabled: !state[day].enabled } }))
  }

  function setTime(day: BackendDay, field: 'start' | 'end', value: string) {
    setOverrides((o) => ({ ...o, [day]: { ...state[day], [field]: value } }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Weekly Schedule"
      description="Set your regular working hours. Users can only book during these time windows."
    >
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">LoadingÔÇª</p>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {ALL_DAYS.map((day) => {
            const { enabled, start, end } = state[day]
            return (
              <div
                key={day}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  enabled ? 'bg-mint/60' : 'bg-foreground/5',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={enabled}
                  onChange={() => toggle(day)}
                  className="h-4 w-4 rounded accent-forest cursor-pointer"
                />
                <label
                  htmlFor={`day-${day}`}
                  className={['w-28 text-base font-medium cursor-pointer select-none', enabled ? 'text-foreground' : 'text-muted-foreground'].join(' ')}
                >
                  {DAY_LABEL[day]}
                </label>

                {enabled ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="relative flex items-center">
                      <Clock size={14} className="absolute left-2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                      <input
                        type="time"
                        value={start}
                        onChange={(e) => setTime(day, 'start', e.target.value)}
                        aria-label={`${DAY_LABEL[day]} start time`}
                        className="rounded-lg border border-border bg-background pl-7 pr-2 py-1.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-forest [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                      />
                    </div>
                    <span className="text-muted-foreground text-base" aria-hidden="true">ÔÇô</span>
                    <div className="relative flex items-center">
                      <Clock size={14} className="absolute left-2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                      <input
                        type="time"
                        value={end}
                        onChange={(e) => setTime(day, 'end', e.target.value)}
                        aria-label={`${DAY_LABEL[day]} end time`}
                        className="rounded-lg border border-border bg-background pl-7 pr-2 py-1.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-forest [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="ml-auto text-sm text-muted-foreground italic">Not a working day</span>
                )}
              </div>
            )
          })}

          {error && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {(error as Error).message}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => saveSchedule()}
              disabled={isPending}
            >
              {isPending ? 'SavingÔÇª' : 'Save schedule'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
