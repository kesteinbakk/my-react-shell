import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * A tag / chip — plain, toggleable (`onClick` + `selected`), or removable
 * (`onRemove`). The label and the remove control are separate buttons, so a
 * removable toggle chip never nests interactive elements.
 */
export function Chip({ children, selected = false, onClick, onRemove, removeLabel, className, }) {
    const interactive = onClick != null;
    return (_jsxs("span", { className: cn('mrs-chip', selected && 'mrs-chip--selected', interactive && 'mrs-chip--interactive', className), children: [interactive ? (_jsx("button", { type: "button", className: "mrs-chip__label mrs-chip__label--btn", onClick: onClick, "aria-pressed": selected, children: children })) : (_jsx("span", { className: "mrs-chip__label", children: children })), onRemove != null && (_jsx("button", { type: "button", className: "mrs-chip__remove", "aria-label": removeLabel, onClick: onRemove, children: _jsxs("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }) }))] }));
}
/** Wrapping flex layout for a set of chips. Selection state lives at the call site. */
export function ChipGroup({ children, className }) {
    return (_jsx("div", { role: "group", className: cn('mrs-chip-group', className), children: children }));
}
