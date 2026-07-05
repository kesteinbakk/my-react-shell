import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';
import { useShellText } from './useShellText';
import { IconButton } from './IconButton';
/** Leading icon slot — keeps labels aligned whether or not an icon is present. */
function MenuIcon({ icon }) {
    return icon != null ? _jsx("span", { className: "mrs-menu__icon", children: icon }) : null;
}
/**
 * Render one entry. Extracted so submenu content can recurse through the same union.
 * `keyPrefix` keeps React keys stable across nesting levels.
 */
function renderItem(item, key) {
    if (item.type === 'separator') {
        return _jsx(RadixMenu.Separator, { className: "mrs-menu__separator" }, key);
    }
    if (item.type === 'label') {
        return (_jsx(RadixMenu.Label, { className: "mrs-menu__label", children: item.label }, key));
    }
    if (item.type === 'checkbox') {
        return (_jsxs(RadixMenu.CheckboxItem, { className: "mrs-menu__item mrs-menu__item--selectable", checked: item.checked, disabled: item.disabled, onCheckedChange: item.onCheckedChange, onSelect: (e) => {
                if (item.closeOnSelect !== true)
                    e.preventDefault();
            }, children: [_jsx("span", { className: "mrs-menu__indicator", children: _jsx(RadixMenu.ItemIndicator, { className: "mrs-menu__indicator-glyph", children: "\u2713" }) }), _jsx(MenuIcon, { icon: item.icon }), _jsx("span", { className: "mrs-menu__label-text", children: item.label })] }, key));
    }
    if (item.type === 'radio-group') {
        return (_jsxs(RadixMenu.RadioGroup, { value: item.value, onValueChange: item.onValueChange, children: [item.label != null ? (_jsx(RadixMenu.Label, { className: "mrs-menu__label", children: item.label })) : null, item.options.map((opt, i) => (_jsxs(RadixMenu.RadioItem, { className: "mrs-menu__item mrs-menu__item--selectable", value: opt.value, disabled: opt.disabled, onSelect: (e) => {
                        if (item.closeOnSelect !== true)
                            e.preventDefault();
                    }, children: [_jsx("span", { className: "mrs-menu__indicator", children: _jsx(RadixMenu.ItemIndicator, { className: "mrs-menu__indicator-glyph", children: "\u25CF" }) }), _jsx(MenuIcon, { icon: opt.icon }), _jsx("span", { className: "mrs-menu__label-text", children: opt.label })] }, `${key}.${opt.value}.${i}`)))] }, key));
    }
    if (item.type === 'submenu') {
        return (_jsxs(RadixMenu.Sub, { children: [_jsxs(RadixMenu.SubTrigger, { className: "mrs-menu__item mrs-menu__sub-trigger", disabled: item.disabled, children: [_jsx(MenuIcon, { icon: item.icon }), _jsx("span", { className: "mrs-menu__label-text", children: item.label }), _jsx("span", { className: "mrs-menu__sub-chevron", "aria-hidden": "true", children: "\u203A" })] }), _jsx(RadixMenu.Portal, { children: _jsx(RadixMenu.SubContent, { className: "mrs-menu", sideOffset: 4, alignOffset: -4, children: item.items.map((sub, i) => renderItem(sub, `${key}.${i}`)) }) })] }, key));
    }
    return (_jsxs(RadixMenu.Item, { className: cn('mrs-menu__item', item.danger && 'mrs-menu__item--danger'), disabled: item.disabled, onSelect: () => item.onSelect(), children: [_jsx(MenuIcon, { icon: item.icon }), _jsx("span", { className: "mrs-menu__label-text", children: item.label })] }, key));
}
/**
 * A data-driven dropdown menu on Radix DropdownMenu — pass an anchor as `trigger`
 * and the rows as `items` (a discriminated union of `item` · `separator` · `label` ·
 * `checkbox` · `radio-group` · `submenu`). Handles keyboard navigation, focus
 * management, outside-click / Esc close, and a portal. Styled with the theme tokens.
 *
 * Checkbox and radio rows are controlled (the kit renders the indicator and reports
 * the next state) and keep the menu open by default so several can be toggled in one
 * opening; pass `closeOnSelect` to close. Submenus nest to arbitrary depth.
 *
 * Trigger-driven (uncontrolled) by default; pass `open` + `onOpenChange` (and
 * optionally `defaultOpen`) to control the open state — e.g. a cursor-anchored
 * context menu opened at the pointer on right-click.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { label: 'Edit', icon: <PencilIcon />, onSelect: edit },
 *     { type: 'checkbox', label: 'Show archived', checked: showArchived, onCheckedChange: setShowArchived },
 *     { type: 'radio-group', value: sortBy, onValueChange: setSortBy, options: [
 *       { value: 'name', label: 'Name' },
 *       { value: 'date', label: 'Date' },
 *     ] },
 *     { type: 'submenu', label: 'Switch tenant', items: tenantItems },
 *     { type: 'separator' },
 *     { label: 'Delete', danger: true, onSelect: remove },
 *   ]}
 * />
 * ```
 */
export function DropdownMenu({ trigger, iconTrigger, iconTriggerLabel, iconTriggerSize = 'md', open, defaultOpen, onOpenChange, items, align = 'center', side = 'bottom', sideOffset = 8, className, }) {
    const st = useShellText();
    return (_jsxs(RadixMenu.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: onOpenChange, children: [iconTrigger != null ? (_jsx(RadixMenu.Trigger, { asChild: true, children: _jsx(IconButton, { size: iconTriggerSize, "aria-label": iconTriggerLabel ?? st('mrs.action.actions'), children: iconTrigger }) })) : (_jsx(RadixMenu.Trigger, { asChild: true, children: trigger })), _jsx(RadixMenu.Portal, { children: _jsx(RadixMenu.Content, { className: cn('mrs-menu', className), align: align, side: side, sideOffset: sideOffset, children: items.map((item, i) => renderItem(item, String(i))) }) })] }));
}
