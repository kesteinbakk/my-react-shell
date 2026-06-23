import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const badgeVariants = cva('mrs-badge', {
    variants: {
        tone: {
            primary: 'mrs-badge--primary',
            neutral: 'mrs-badge--neutral',
            success: 'mrs-badge--success',
            warning: 'mrs-badge--warning',
            danger: 'mrs-badge--danger',
            info: 'mrs-badge--info',
        },
    },
    defaultVariants: { tone: 'neutral' },
});
/**
 * Compact status / category badge on the semantic tint + `-on-bg` tokens.
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-*`, `data-*`, `id`,
 * event handlers, …) to the root, so a native tooltip or test id needs no
 * wrapper element.
 */
export function Badge({ tone = 'neutral', dot = false, children, className, ...rest }) {
    return (_jsxs("span", { className: cn(badgeVariants({ tone }), className), ...rest, children: [dot && _jsx("span", { className: "mrs-badge__dot", "aria-hidden": "true" }), children] }));
}
