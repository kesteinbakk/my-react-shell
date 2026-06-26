import { useState } from 'react'
import { type CSSProperties } from 'react'
import { format as formatDate } from 'date-fns'
import * as RadixPopover from '@radix-ui/react-popover'
import type { Matcher } from 'react-day-picker'
import { Calendar } from './Calendar'
import { cn } from './cn'

export interface DatePickerProps {
  /** Selected date (controlled). */
  value?: Date
  /** Initial date when uncontrolled. */
  defaultValue?: Date
  /** Fired when a day is picked (or the selection is cleared). */
  onChange?: (date: Date | undefined) => void
  /** Trigger text when no date is selected. Defaults to `"Pick a date"`. */
  placeholder?: string
  /**
   * [date-fns format](https://date-fns.org/docs/format) string for the trigger label.
   * Defaults to `"PP"` (e.g. `Apr 29, 2024`).
   */
  displayFormat?: string
  /** Days to disable — a react-day-picker matcher (`{ before }`, `{ after }`, a predicate, …). */
  disabledDays?: Matcher | Matcher[]
  /** Earliest navigable month. */
  startMonth?: Date
  /** Latest navigable month. */
  endMonth?: Date
  disabled?: boolean
  /** Accessible label for the trigger button. */
  'aria-label'?: string
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

const CalendarGlyph = () => (
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
  >
    <path d="M8 2v4M16 2v4M3 10h18" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
  </svg>
)

/**
 * Single-date field — a trigger button showing the selected date that opens a {@link
 * Calendar} in a popover. Built on Radix Popover + react-day-picker, themed against the
 * tokens. Works controlled (`value` / `onChange`) or uncontrolled (`defaultValue`); the
 * popover closes on pick. For multi/range selection or an always-visible grid, use
 * `Calendar` directly.
 *
 * ```tsx
 * <DatePicker value={date} onChange={setDate} disabledDays={{ before: new Date() }} />
 * ```
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Pick a date',
  displayFormat = 'PP',
  disabledDays,
  startMonth,
  endMonth,
  disabled,
  fullWidth = false,
  className,
  style,
  ...rest
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  // Support uncontrolled use: hold an internal selection only when `value` is absent.
  const [internal, setInternal] = useState<Date | undefined>(defaultValue)
  const selected = value !== undefined ? value : internal

  const handleSelect = (date: Date | undefined) => {
    if (value === undefined) setInternal(date)
    onChange?.(date)
    if (date) setOpen(false)
  }

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={rest['aria-label']}
          data-empty={selected ? undefined : ''}
          className={cn('mrs-datepicker__trigger', fullWidth && 'mrs-datepicker__trigger--full', className)}
          style={style}
        >
          <CalendarGlyph />
          <span className="mrs-datepicker__label">
            {selected ? formatDate(selected, displayFormat) : placeholder}
          </span>
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className="mrs-datepicker__popover" align="start" sideOffset={8}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            disabled={disabledDays}
            startMonth={startMonth}
            endMonth={endMonth}
            autoFocus
          />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
