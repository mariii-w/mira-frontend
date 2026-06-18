import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export interface CalendarGridProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  renderDay: (date: Date) => React.ReactNode;
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarGrid({
  year,
  month,
  onMonthChange,
  renderDay,
  minDate,
  maxDate,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const leadingBlanks = getFirstWeekday(year, month);

  function prevMonth() {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  }

  function nextMonth() {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  }

  const label = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevDisabled = minDate
    ? new Date(year, month - 2, 1) <
      new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    : false;
  const nextDisabled = maxDate
    ? new Date(year, month, 1) >
      new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    : false;

  const cells: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month - 1, i + 1),
    ),
  ];

  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, weekIndex) =>
    cells.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          aria-label="Previous month"
          onClick={prevMonth}
          disabled={prevDisabled}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <p
          className="font-heading font-semibold text-foreground text-lg"
          aria-live="polite"
        >
          {label}
        </p>

        <button
          type="button"
          aria-label="Next month"
          onClick={nextMonth}
          disabled={nextDisabled}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-1" role="grid" aria-label={label}>
        <div className="grid grid-cols-7" role="row">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              aria-label={d}
              className="text-center text-xs font-semibold text-muted uppercase tracking-wide py-1 select-none"
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div className="grid grid-cols-7 gap-1" role="row" key={weekIndex}>
            {week.map((date, dayIndex) =>
              date ? (
                <div key={date.toISOString()} role="gridcell">
                  {renderDay(date)}
                </div>
              ) : (
                <div
                  key={`blank-${weekIndex}-${dayIndex}`}
                  role="gridcell"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
