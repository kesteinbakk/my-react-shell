import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement, useState, } from 'react';
import { DropdownMenu } from './DropdownMenu';
function menuItems(title, items) {
    return title != null ? [{ type: 'label', label: title }, ...items] : items;
}
/**
 * A real cursor-anchored right-click menu, built on `DropdownMenu` — same items
 * union (action rows, separators, an optional label, checkboxes, radio groups,
 * submenus), same hover/keyboard/select behavior and theme styling. Suppresses the
 * browser's native context menu and opens exactly at the pointer.
 *
 * Wrapping mode (the common case) — wrap the trigger element; the kit handles
 * capturing the pointer position and open state:
 *
 * ```tsx
 * <ContextMenu title={t('actions')} items={[
 *   { label: t('rename'), onSelect: rename },
 *   { type: 'separator' },
 *   { label: t('delete'), danger: true, onSelect: remove },
 * ]}>
 *   <div className="card">…</div>
 * </ContextMenu>
 * ```
 *
 * Controlled mode — for a trigger that isn't one DOM node (e.g. a slice in an SVG
 * chart): omit `children`, capture `event.clientX/clientY` in your own
 * `onContextMenu` handler, and drive `open` / `position` / `onOpenChange` yourself:
 *
 * ```tsx
 * <ContextMenu
 *   open={menuNode != null}
 *   position={menuPos}
 *   onOpenChange={(open) => { if (!open) setMenuNode(null) }}
 *   items={itemsFor(menuNode)}
 * />
 * ```
 */
export function ContextMenu(props) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [uncontrolledPosition, setUncontrolledPosition] = useState({ x: 0, y: 0 });
    const isControlled = props.open !== undefined;
    const open = isControlled ? props.open : uncontrolledOpen;
    const position = isControlled ? props.position : uncontrolledPosition;
    const onOpenChange = (next) => {
        if (isControlled) {
            props.onOpenChange(next);
        }
        else {
            setUncontrolledOpen(next);
        }
    };
    const menu = open ? (_jsx(DropdownMenu, { open: true, onOpenChange: onOpenChange, align: "start", className: props.className, trigger: _jsx("span", { "aria-hidden": true, style: { position: 'fixed', left: position.x, top: position.y, width: 0, height: 0 } }), items: menuItems(props.title, props.items) })) : null;
    if (isControlled) {
        return menu;
    }
    const { children, disabled } = props;
    const child = isValidElement(children)
        ? children
        : null;
    if (!child)
        return children;
    return (_jsxs(_Fragment, { children: [cloneElement(child, {
                onContextMenu: (e) => {
                    child.props.onContextMenu?.(e);
                    if (disabled)
                        return;
                    e.preventDefault();
                    setUncontrolledPosition({ x: e.clientX, y: e.clientY });
                    setUncontrolledOpen(true);
                },
            }), menu] }));
}
