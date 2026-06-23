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
/** Compact status / category badge on the semantic tint + `-strong` tokens. */
export function Badge({ tone = 'neutral', dot = false, children, className }) {
    return (_jsxs("span", { className: cn(badgeVariants({ tone }), className), children: [dot && _jsx("span", { className: "mrs-badge__dot", "aria-hidden": "true" }), children] }));
}
