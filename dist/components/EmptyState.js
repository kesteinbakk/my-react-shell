import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Centered empty / zero-state: an optional icon, a title, a description, and an
 * optional action — for "nothing here yet" surfaces.
 */
export function EmptyState({ icon, title, description, action, className }) {
    return (_jsxs("div", { className: cn('mrs-empty', className), children: [icon != null && (_jsx("div", { className: "mrs-empty__icon", "aria-hidden": "true", children: icon })), _jsx("div", { className: "mrs-empty__title", children: title }), description != null && _jsx("div", { className: "mrs-empty__desc", children: description }), action != null && _jsx("div", { className: "mrs-empty__action", children: action })] }));
}
