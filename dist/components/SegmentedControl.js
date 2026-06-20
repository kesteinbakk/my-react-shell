import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Single-select segmented control — a row of mutually-exclusive options on a track,
 * the active one lifted onto a surface chip. Controlled via `value` / `onChange`.
 */
export function SegmentedControl({ options, value, onChange, size = 'md', className, ...rest }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": rest['aria-label'], className: cn('mrs-segmented', `mrs-segmented--${size}`, className), children: options.map((opt) => {
            const active = opt.value === value;
            return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, disabled: opt.disabled, className: cn('mrs-segmented__item', active && 'mrs-segmented__item--active'), onClick: () => onChange(opt.value), children: opt.label }, opt.value));
        }) }));
}
