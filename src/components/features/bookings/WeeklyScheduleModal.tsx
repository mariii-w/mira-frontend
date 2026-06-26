import { Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Modal } from '../../common/ui/Modal'
import { Button } from '../../common/ui/Button'
import type { DayOfWeek, ReplaceWeeklyScheduleRequest, WeeklyScheduleEntry } from '../../../api/model'

type BackendDay = DayOfWeek

const ALL_DAYS: BackendDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_LABEL: Record<BackendDay, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday',
}

interface DayState { enabled: boolean; start: string; end: string }
type ScheduleState = Record<BackendDay, DayState>

function toInputTime(backendTime: string): string {
  return backendTime.slice(0, 5)
}

function buildInitialState(entries: WeeklyScheduleEntry[]): ScheduleState {
  const map = Object.fromEntries(entries.map((e) => [e.dayOfWeek, e])) as Record<BackendDay, WeeklyScheduleEntry>
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
  entries: WeeklyScheduleEntry[]
  isLoading: boolean
  isSaving: boolean
  errorMessage: string | null
  onSave: (schedule: Pick<ReplaceWeeklyScheduleRequest, 'entries'>) => void
}

export function WeeklyScheduleModal({
  open,
  onClose,
  entries,
  isLoading,
  isSaving,
  errorMessage,
  onSave,
}: Props) {
  const [overrides, setOverrides] = useState<Partial<ScheduleState>>({})

  const baseState = useMemo(() => buildInitialState(entries), [entries])
  const state = useMemo(() => ({ ...baseState, ...overrides }), [baseState, overrides])

  function toggle(day: BackendDay) {
    setOverrides((o) => ({ ...o, [day]: { ...state[day], enabled: !state[day].enabled } }))
  }

  function setTime(day: BackendDay, field: 'start' | 'end', value: string) {
    setOverrides((o) => ({ ...o, [day]: { ...state[day], [field]: value } }))
  }

  function saveSchedule() {
    onSave({
      entries: ALL_DAYS.filter((d) => state[d].enabled).map((d) => ({
        dayOfWeek: d,
        startTime: state[d].start,
        endTime: state[d].end,
      })),
    })
    setOverrides({})
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Weekly Schedule"
      description="Set your regular working hours. Users can only book during these time windows."
    >
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
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
                    <span className="text-muted-foreground text-base" aria-hidden="true">–</span>
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

          {errorMessage && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={saveSchedule}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save schedule'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
