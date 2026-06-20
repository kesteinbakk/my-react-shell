import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const alertVariants = cva('mrs-alert', {
    variants: {
        variant: {
            info: 'mrs-alert--info',
            success: 'mrs-alert--success',
            warning: 'mrs-alert--warning',
            danger: 'mrs-alert--danger',
        },
    },
    defaultVariants: { variant: 'info' },
});
const iconProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const DEFAULT_ICONS = {
    info: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M12 16v-4" }), _jsx("path", { d: "M12 8h.01" })] })),
    success: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "m9 12 2 2 4-4" })] })),
    warning: (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }), _jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" })] })),
    danger: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "m15 9-6 6" }), _jsx("path", { d: "m9 9 6 6" })] })),
};
/**
 * Inline alert / callout box. An opinionated composite on the semantic theme
 * tokens: a tinted surface (`--color-<tone>-bg`), a matching border
 * (`--color-<tone>-border`), and AA-legible on-tint text (`--color-<tone>-strong`),
 * with a per-tone leading icon and an optional dismiss control.
 */
export function Alert({ variant = 'info', title, children, icon, onDismiss, dismissLabel = 'Dismiss', role = 'alert', className, }) {
    const leading = icon === false ? null : (icon ?? DEFAULT_ICONS[variant]);
    return (_jsxs("div", { role: role, className: cn(alertVariants({ variant }), className), children: [leading != null && (_jsx("span", { className: "mrs-alert__icon", "aria-hidden": "true", children: leading })), _jsxs("div", { className: "mrs-alert__content", children: [title != null && _jsx("div", { className: "mrs-alert__title", children: title }), children != null && _jsx("div", { className: "mrs-alert__body", children: children })] }), onDismiss != null && (_jsx("button", { type: "button", className: "mrs-alert__dismiss", onClick: onDismiss, "aria-label": dismissLabel, children: _jsxs("svg", { ...iconProps, width: 16, height: 16, children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }) }))] }));
}
