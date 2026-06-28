import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import {} from 'react';
import { format as formatDate } from 'date-fns';
import * as RadixPopover from '@radix-ui/react-popover';
import { Calendar } from './Calendar';
import { cn } from './cn';
const CalendarGlyph = () => (_jsxs("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M8 2v4M16 2v4M3 10h18" }), _jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" })] }));
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
export function DatePicker({ value, defaultValue, onChange, placeholder, displayFormat = 'PP', disabledDays, startMonth, endMonth, disabled, fullWidth = false, className, style, ...rest }) {
    const [open, setOpen] = useState(false);
    // Support uncontrolled use: hold an internal selection only when `value` is absent.
    const [internal, setInternal] = useState(defaultValue);
    const selected = value !== undefined ? value : internal;
    const handleSelect = (date) => {
        if (value === undefined)
            setInternal(date);
        onChange?.(date);
        if (date)
            setOpen(false);
    };
    return (_jsxs(RadixPopover.Root, { open: open, onOpenChange: setOpen, children: [_jsx(RadixPopover.Trigger, { asChild: true, children: _jsxs("button", { type: "button", disabled: disabled, "aria-label": rest['aria-label'], "data-empty": selected ? undefined : '', className: cn('mrs-datepicker__trigger', fullWidth && 'mrs-datepicker__trigger--full', className), style: style, children: [_jsx(CalendarGlyph, {}), _jsx("span", { className: "mrs-datepicker__label", children: selected ? formatDate(selected, displayFormat) : placeholder })] }) }), _jsx(RadixPopover.Portal, { children: _jsx(RadixPopover.Content, { className: "mrs-datepicker__popover", align: "start", sideOffset: 8, children: _jsx(Calendar, { mode: "single", selected: selected, onSelect: handleSelect, defaultMonth: selected, disabled: disabledDays, startMonth: startMonth, endMonth: endMonth, autoFocus: true }) }) })] }));
}
