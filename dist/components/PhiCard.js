import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';
/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 *
 * The card is one scaling unit driven entirely by its width:
 *   Outer:  width : height  = φ : 1
 *   Split:  upperH : lowerH  = φ : 1   (the two sections)
 *
 * The split lives in components.css as an `fr` ratio; the `1.6180339887fr` literal
 * there is this same φ, kept in lockstep with this constant.
 */
export const PHI = 1.6180339887;
const SIZE_WIDTH_PX = {
    sm: 180,
    md: 240,
    lg: 320,
    xl: 480,
};
// A section counts as empty (→ not rendered) for the common "no content" signals:
// an absent prop (undefined), an explicit null, a `false` from `{cond && <X/>}`, or
// an empty string. Anything else is content.
function isEmpty(node) {
    return node == null || node === false || node === '';
}
const DEFAULT_MENU_GLYPH = (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "5", r: "1.75" }), _jsx("circle", { cx: "12", cy: "12", r: "1.75" }), _jsx("circle", { cx: "12", cy: "19", r: "1.75" })] }));
function PhiCardMenu({ actions, icon, label, }) {
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsx("button", { type: "button", className: "mrs-phi-card__menu-trigger", "aria-label": label, children: icon ?? DEFAULT_MENU_GLYPH }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-phi-card__menu", align: "end", sideOffset: 4, children: actions.map((action) => (_jsxs(DropdownMenu.Item, { className: cn('mrs-phi-card__menu-item', action.destructive && 'mrs-phi-card__menu-item--danger'), disabled: action.disabled, onSelect: () => action.onSelect(), children: [action.icon != null ? (_jsx("span", { className: "mrs-phi-card__menu-icon", children: action.icon })) : null, _jsx("span", { children: action.label })] }, action.label))) }) })] }));
}
/**
 * Golden-ratio card with two consumer-owned sections. Width is the only size knob —
 * height (width / φ) and the φ:1 section split derive from it. The bottom section
 * collapses when empty; an optional top-right overflow menu takes consumer-supplied
 * actions. See the components guide for examples.
 */
export function PhiCard({ upper, lower, size = 'md', actions, menuIcon, menuLabel = 'Actions', corner, leftBorderColor, onClick, hoverable, className, }) {
    const width = SIZE_WIDTH_PX[size];
    const height = width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    const hasLower = !isEmpty(lower);
    // `corner` wins over the built-in menu; otherwise the menu shows only when there
    // are actions. Either way the corner overlay renders only when non-empty. The
    // inline `actions &&` (not a derived flag) lets TS narrow `actions` to non-null.
    const cornerNode = corner ??
        (actions && actions.length > 0 ? (_jsx(PhiCardMenu, { actions: actions, icon: menuIcon, label: menuLabel })) : null);
    const style = {
        width: `${width}px`,
        height: `${height}px`,
        ...(leftBorderColor ? { borderLeft: `3px solid ${leftBorderColor}` } : {}),
    };
    return (_jsxs("div", { className: cn('mrs-phi-card', !hasLower && 'mrs-phi-card--single', isHoverable && 'mrs-phi-card--hoverable', className), style: style, onClick: onClick, children: [_jsx("div", { className: "mrs-phi-card__section", children: upper }), hasLower ? _jsx("div", { className: "mrs-phi-card__section", children: lower }) : null, cornerNode != null ? (_jsx("div", { className: "mrs-phi-card__corner", onClick: (e) => e.stopPropagation(), children: cornerNode })) : null] }));
}
