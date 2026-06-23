import { DayPicker, type ChevronProps, type ClassNames, type DayPickerProps } from 'react-day-picker'
import { cn } from './cn'

export type CalendarProps = DayPickerProps & { className?: string }

// Map react-day-picker's UI parts onto `mrs-`-prefixed classes so the calendar renders
// against the theme tokens — no react-day-picker stylesheet import required.
const MRS_CLASSNAMES: Partial<ClassNames> = {
  months: 'mrs-calendar__months',
  month: 'mrs-calendar__month',
  month_caption: 'mrs-calendar__caption',
  caption_label: 'mrs-calendar__caption-label',
  nav: 'mrs-calendar__nav',
  button_previous: 'mrs-calendar__nav-btn',
  button_next: 'mrs-calendar__nav-btn',
  month_grid: 'mrs-calendar__grid',
  weekdays: 'mrs-calendar__weekdays',
  weekday: 'mrs-calendar__weekday',
  week: 'mrs-calendar__week',
  day: 'mrs-calendar__day',
  day_button: 'mrs-calendar__day-btn',
  today: 'mrs-calendar__day--today',
  selected: 'mrs-calendar__day--selected',
  outside: 'mrs-calendar__day--outside',
  disabled: 'mrs-calendar__day--disabled',
  hidden: 'mrs-calendar__day--hidden',
  range_start: 'mrs-calendar__day--range-start',
  range_middle: 'mrs-calendar__day--range-middle',
  range_end: 'mrs-calendar__day--range-end',
  dropdowns: 'mrs-calendar__dropdowns',
  dropdown: 'mrs-calendar__dropdown',
  dropdown_root: 'mrs-calendar__dropdown-root',
  week_number: 'mrs-calendar__week-number',
}

function MrsChevron({ orientation = 'left', className }: ChevronProps) {
  // One chevron path, rotated by orientation.
  const rotate = { left: 0, right: 180, up: 90, down: 270 }[orientation]
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

/**
 * Themed month-grid calendar on [react-day-picker](https://daypicker.dev) — single,
 * multiple, or range selection with full keyboard navigation and ARIA, rendered against
 * the theme tokens via `mrs-` classes (no react-day-picker stylesheet needed). Every
 * react-day-picker prop is forwarded: `mode`, `selected`, `onSelect`, `disabled`,
 * `startMonth` / `endMonth`, `numberOfMonths`, `captionLayout`, …
 *
 * For a popover-anchored single date field, use {@link DatePicker}.
 *
 * ```tsx
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
 * ```
 */
export function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('mrs-calendar', className)}
      classNames={{ ...MRS_CLASSNAMES, ...classNames }}
      components={{ Chevron: MrsChevron, ...components }}
      {...props}
    />
  )
}
