import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const alertVariants = cva('mrs-alert', {
    variants: {
        tone: {
            info: 'mrs-alert--info',
            success: 'mrs-alert--success',
            warning: 'mrs-alert--warning',
            danger: 'mrs-alert--danger',
        },
    },
    defaultVariants: { tone: 'info' },
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
    info: (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }), _jsx("path", { d: "M12 14v-3" }), _jsx("path", { d: "M12 7h.01" })] })),
    success: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "m9 12 2 2 4-4" })] })),
    warning: (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }), _jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" })] })),
    danger: (_jsxs("svg", { ...iconProps, children: [_jsx("polygon", { points: "7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86" }), _jsx("path", { d: "M12 8v4" }), _jsx("path", { d: "M12 16h.01" })] })),
};
/**
 * Inline alert / callout box. An opinionated composite on the semantic theme
 * tokens: a tinted surface (`--color-<tone>-bg`), a matching border
 * (`--color-<tone>-border`), and AA-legible on-tint text (`--color-<tone>-on-bg`),
 * with a per-tone leading icon and an optional dismiss control.
 */
export function Alert({ tone = 'info', title, children, icon, onDismiss, dismissLabel, role = 'alert', className, }) {
    const leading = icon === false ? null : (icon ?? DEFAULT_ICONS[tone]);
    return (_jsxs("div", { role: role, className: cn(alertVariants({ tone }), className), children: [leading != null && (_jsx("span", { className: "mrs-alert__icon", "aria-hidden": "true", children: leading })), _jsxs("div", { className: "mrs-alert__content", children: [title != null && _jsx("div", { className: "mrs-alert__title", children: title }), children != null && _jsx("div", { className: "mrs-alert__body", children: children })] }), onDismiss != null && (_jsx("button", { type: "button", className: "mrs-alert__dismiss", onClick: onDismiss, "aria-label": dismissLabel, children: _jsxs("svg", { ...iconProps, width: 16, height: 16, children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }) }))] }));
}
