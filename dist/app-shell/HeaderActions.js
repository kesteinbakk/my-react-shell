import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { DropdownMenu, Popover, CountPill } from '../components';
import { useShellContextOptional } from './shellContext';
/** Glyph pixel size for every header-action trigger — one size, shell-owned. */
const GLYPH_PX = 20;
/**
 * The single header-action trigger chrome. Exported so the `custom` escape hatch can
 * wire it into a bespoke overlay (as a Radix `asChild` trigger — it forwards its ref).
 * Everything in the `actions` row is this one button; that is what guarantees a uniform
 * box model. `icon` is a registry key (resolved via `config.renderIcon`) or a
 * pre-resolved node.
 */
export const HeaderActionButton = forwardRef(function HeaderActionButton({ icon, label, active, tone = 'neutral', badge, hint, className, ...rest }, ref) {
    const shell = useShellContextOptional();
    const glyph = typeof icon === 'string'
        ? shell?.config.renderIcon(icon, GLYPH_PX) ?? null
        : (icon ?? null);
    const showBadge = typeof badge === 'number' && badge > 0;
    return (_jsxs("button", { ref: ref, type: "button", className: className ? `mrs-header-action ${className}` : 'mrs-header-action', "data-tone": tone, "aria-label": label, "aria-pressed": active, title: hint ?? label, ...rest, children: [_jsx("span", { className: "mrs-header-action__glyph", "aria-hidden": "true", children: glyph }), showBadge ? (_jsx(CountPill, { className: "mrs-header-action__badge", count: badge, tone: "danger" })) : null] }));
});
/** Build the uniform trigger — handed to the `custom` escape hatch. */
function renderTrigger(props) {
    return _jsx(HeaderActionButton, { ...props });
}
/**
 * Render one chrome action to its shell-owned element. Returns `null` for an empty
 * action (a `custom` thunk that renders nothing, or a menu with no items) so no stray
 * wrapper survives.
 */
function renderHeaderAction(action, key) {
    if ('custom' in action && action.custom) {
        const node = action.custom(renderTrigger);
        return node == null ? null : _jsx("span", { children: node }, key);
    }
    if ('items' in action && action.items) {
        if (action.items.length === 0)
            return null;
        return (_jsx(DropdownMenu, { align: action.align ?? 'end', trigger: _jsx(HeaderActionButton, { icon: action.icon, label: action.label, tone: action.tone, badge: action.badge }), items: action.items }, key));
    }
    if ('panel' in action && action.panel) {
        return (_jsx(Popover, { align: action.align ?? 'end', trigger: _jsx(HeaderActionButton, { icon: action.icon, label: action.label, tone: action.tone, badge: action.badge }), children: action.panel() }, key));
    }
    // Plain / toggle button.
    return (_jsx(HeaderActionButton, { icon: action.icon, label: action.label, active: action.active, tone: action.tone, badge: action.badge, hint: action.hint, onClick: action.onClick }, key));
}
/**
 * Render the shell's action cluster. Returns the trigger elements only — the caller
 * (AppHeader / AppMenu) supplies the surrounding container so header and sidebar keep
 * their own layout while sharing one action chrome.
 */
export function HeaderActions({ actions }) {
    return _jsx(_Fragment, { children: actions.map((action, i) => renderHeaderAction(action, String(i))) });
}
