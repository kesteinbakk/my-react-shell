import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const countPillVariants = cva('mrs-count-pill', {
    variants: {
        tone: {
            primary: 'mrs-count-pill--primary',
            secondary: 'mrs-count-pill--secondary',
            success: 'mrs-count-pill--success',
            warning: 'mrs-count-pill--warning',
            danger: 'mrs-count-pill--danger',
            info: 'mrs-count-pill--info',
        },
    },
    defaultVariants: { tone: 'primary' },
});
/**
 * A small, solid-fill numeric count pill — unread counts, tab/section counts, a
 * notification-bell overlay. Renders `${max}+` once `count` exceeds `max`
 * (default `99`); the caller decides when to show it (e.g. only when `count >
 * 0`) and where to place it (an absolute overlay is the caller's `className`).
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-label`, `data-*`,
 * event handlers, …) to the root.
 */
export function CountPill({ count, tone = 'primary', max = 99, className, ...rest }) {
    const display = count > max ? `${max}+` : String(count);
    return (_jsx("span", { className: cn(countPillVariants({ tone }), className), ...rest, children: display }));
}
