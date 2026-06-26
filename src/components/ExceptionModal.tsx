import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export type ExceptionType = 'BLOCKED' | 'AVAILABLE'
type Tab = 'add' | 'manage'

export interface ScheduleException {
  exceptionId: string
  date: string
  exceptionType: ExceptionType
  startTime: string | null
  endTime: string | null
}

export interface CreateScheduleExceptionInput {
  date: string
  exceptionType: ExceptionType
  startTime?: string
  endTime?: string
}

export interface UpdateScheduleExceptionInput {
  startTime: string
  endTime: string
}

interface Props {
  open: boolean
  onClose: () => void
  exceptions: ScheduleException[]
  isCreating: boolean
  errorMessage: string | null
  onCreate: (exception: CreateScheduleExceptionInput) => void
  onUpdate: (exceptionId: string, exception: UpdateScheduleExceptionInput) => void
  onDelete: (exceptionId: string) => void
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function toInputTime(t: string) {
  return t.slice(0, 5)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// --- Manage tab row ---
function ExceptionRow({
  ex,
  onUpdate,
  onDelete,
}: {
  ex: ScheduleException
  onUpdate: (exceptionId: string, exception: UpdateScheduleExceptionInput) => void
  onDelete: (exceptionId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [start, setStart] = useState(ex.startTime ? toInputTime(ex.startTime) : '09:00')
  const [end, setEnd] = useState(ex.endTime ? toInputTime(ex.endTime) : '17:00')
  const timeError = editing && start >= end ? 'End must be after start' : null

  const canEdit = ex.startTime !== null && ex.endTime !== null

  function save() {
    onUpdate(ex.exceptionId, { startTime: start, endTime: end })
    setEditing(false)
  }

  return (
    <div className="rounded-xl border border-border p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{formatDate(ex.date)}</p>
          <span className={[
            'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold',
            ex.exceptionType === 'BLOCKED' ? 'bg-plum/15 text-plum' : 'bg-forest/5 text-forest',
          ].join(' ')}>
            {ex.exceptionType === 'BLOCKED' ? 'Blocked' : 'Extra availability'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {canEdit && !editing && !confirmDelete && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit times"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          {!confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete exception"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div role="alert" className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
          <p className="text-xs font-medium text-red-700">Delete this exception?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(ex.exceptionId)}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Time display or edit */}
      {!editing && ex.startTime && ex.endTime && (
        <p className="text-xs text-muted-foreground">
          {toInputTime(ex.startTime)} – {toInputTime(ex.endTime)}
        </p>
      )}
      {!editing && !ex.startTime && (
        <p className="text-xs text-muted-foreground italic">All day</p>
      )}

      {editing && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-label="Start time"
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <span className="text-muted-foreground text-sm" aria-hidden="true">–</span>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-label="End time"
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <button
              onClick={save}
              disabled={!!timeError}
              aria-label="Save"
              className="p-1.5 rounded-lg bg-forest text-white hover:bg-forest/90 disabled:opacity-40 transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setEditing(false)}
              aria-label="Cancel"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          {timeError && <p role="alert" className="text-xs text-red-600">{timeError}</p>}
        </div>
      )}
    </div>
  )
}

// --- Main modal ---
export function ExceptionModal({
  open,
  onClose,
  exceptions,
  isCreating,
  errorMessage,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<Tab>('add')

  // Add form state
  const [type, setType] = useState<ExceptionType>('BLOCKED')
  const [date, setDate] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')

  const needsTimes = type === 'AVAILABLE' || !allDay
  const timeError = needsTimes && start >= end ? 'End time must be after start time' : null

  const sortedExceptions = [...exceptions].sort((a, b) => a.date.localeCompare(b.date))

  function resetForm() {
    setType('BLOCKED')
    setDate('')
    setAllDay(true)
    setStart('09:00')
    setEnd('17:00')
  }

  function createException() {
    const body: CreateScheduleExceptionInput = { date, exceptionType: type }
    if (needsTimes) {
      body.startTime = start
      body.endTime = end
    }
    onCreate(body)
    resetForm()
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Schedule Exceptions"
      description="Block time off or add extra availability for specific dates."
    >
      {/* Tabs */}
      <div role="tablist" aria-label="Exception options" className="mt-4 flex border-b border-border">
        {(['add', 'manage'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={[
              'pb-2 px-1 mr-5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-plum text-plum'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t === 'add' ? 'Add exception' : 'Manage exceptions'}
          </button>
        ))}
      </div>

      {tab === 'add' ? (
        <div role="tabpanel" className="mt-4 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Exception type
          </p>

          <div className="flex flex-col gap-2 -mt-2">
            {([
              { value: 'BLOCKED' as ExceptionType, label: 'Mark as unavailable', description: 'Consumers cannot book this time.' },
              { value: 'AVAILABLE' as ExceptionType, label: 'Add extra availability', description: 'Work outside your usual hours.' },
            ]).map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setType(value); setAllDay(value === 'BLOCKED') }}
                aria-pressed={type === value}
                className={[
                  'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                  type === value ? 'border-plum bg-plum/10' : 'border-border bg-background hover:bg-foreground/5',
                ].join(' ')}
              >
                <p className={['text-sm font-semibold', type === value ? 'text-plum' : 'text-foreground'].join(' ')}>{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="exc-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
            <input
              id="exc-date"
              type="date"
              value={date}
              min={tomorrowStr()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-plum [&::-webkit-calendar-picker-indicator]:opacity-60"
            />
          </div>

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
              {timeError && <p role="alert" className="text-xs text-red-600">{timeError}</p>}
            </div>
          )}

          {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

          <div className="flex justify-end gap-3 mt-1">
            <Button variant="secondary" size="md" onClick={handleClose} disabled={isCreating}>Cancel</Button>
            <Button
              variant="accent"
              size="md"
              onClick={createException}
              disabled={isCreating || !!timeError || !date}
            >
              {isCreating ? 'Saving…' : type === 'BLOCKED' ? 'Block this time' : 'Add availability'}
            </Button>
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="mt-4 flex flex-col gap-2">
          {sortedExceptions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No exceptions set yet.</p>
          ) : (
            sortedExceptions.map((ex) => (
              <ExceptionRow
                key={ex.exceptionId}
                ex={ex}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </Modal>
  )
}
