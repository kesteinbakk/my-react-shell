import { type DayPickerProps } from 'react-day-picker';
export type CalendarProps = DayPickerProps & {
    className?: string;
};
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
export declare function Calendar({ className, classNames, components, showOutsideDays, ...props }: CalendarProps): import("react").JSX.Element;
