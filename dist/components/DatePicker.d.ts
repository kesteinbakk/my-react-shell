import type { Matcher } from 'react-day-picker';
export interface DatePickerProps {
    /** Selected date (controlled). */
    value?: Date;
    /** Initial date when uncontrolled. */
    defaultValue?: Date;
    /** Fired when a day is picked (or the selection is cleared). */
    onChange?: (date: Date | undefined) => void;
    /** Trigger text when no date is selected. Defaults to `"Pick a date"`. */
    placeholder?: string;
    /**
     * [date-fns format](https://date-fns.org/docs/format) string for the trigger label.
     * Defaults to `"PP"` (e.g. `Apr 29, 2024`).
     */
    displayFormat?: string;
    /** Days to disable — a react-day-picker matcher (`{ before }`, `{ after }`, a predicate, …). */
    disabledDays?: Matcher | Matcher[];
    /** Earliest navigable month. */
    startMonth?: Date;
    /** Latest navigable month. */
    endMonth?: Date;
    disabled?: boolean;
    /** Accessible label for the trigger button. */
    'aria-label'?: string;
    className?: string;
}
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
export declare function DatePicker({ value, defaultValue, onChange, placeholder, displayFormat, disabledDays, startMonth, endMonth, disabled, className, ...rest }: DatePickerProps): import("react").JSX.Element;
