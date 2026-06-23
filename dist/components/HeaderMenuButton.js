import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * A ghost neutral button for the header action zone — a `<DropdownMenu trigger>`
 * that labels itself (text + optional leading icon) and provides a built-in
 * trailing chevron. Handles all native button attributes; passes them through to
 * the underlying `<button>` so `aria-label`, `title`, `disabled`, etc. work.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<HeaderMenuButton>Visning</HeaderMenuButton>}
 *   items={...}
 * />
 * <DropdownMenu
 *   trigger={
 *     <HeaderMenuButton leadingIcon={<MyIcon size={16} />}>Visning</HeaderMenuButton>
 *   }
 *   items={...}
 * />
 * ```
 */
export function HeaderMenuButton({ children, leadingIcon, type = 'button', className, ...rest }) {
    return (_jsxs("button", { type: type, className: cn('mrs-btn mrs-btn--ghost mrs-btn--neutral mrs-btn--sm mrs-hmb', className), ...rest, children: [leadingIcon != null && (_jsx("span", { className: "mrs-btn__icon", "aria-hidden": "true", children: leadingIcon })), _jsx("span", { className: "mrs-btn__label", children: children }), _jsx("span", { className: "mrs-btn__icon mrs-hmb__chevron", "aria-hidden": "true", children: _jsx("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", children: _jsx("path", { d: "M1.5 3.5L5 7L8.5 3.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] }));
}
