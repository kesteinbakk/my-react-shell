import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * A neutral, low-emphasis contextual box — notes, help text, inline context.
 * For semantic success / warning / danger / info tones use `Alert` instead;
 * `InfoBox` is intentionally tone-free so it never competes with a real alert.
 */
export function InfoBox({ icon, title, children, className }) {
    return (_jsxs("div", { className: cn('mrs-infobox', className), children: [icon != null && (_jsx("span", { className: "mrs-infobox__icon", "aria-hidden": "true", children: icon })), _jsxs("div", { className: "mrs-infobox__content", children: [title != null && _jsx("div", { className: "mrs-infobox__title", children: title }), children != null && _jsx("div", { className: "mrs-infobox__body", children: children })] })] }));
}
