import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';
/**
 * A data-driven dropdown menu on Radix DropdownMenu — pass an anchor as `trigger`
 * and the rows as `items` (a discriminated union of `item` · `separator` · `label`).
 * Handles keyboard navigation, focus management, outside-click / Esc close, and a
 * portal. Styled with the theme tokens.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { label: 'Edit', icon: <PencilIcon />, onSelect: edit },
 *     { type: 'separator' },
 *     { label: 'Delete', danger: true, onSelect: remove },
 *   ]}
 * />
 * ```
 */
export function DropdownMenu({ trigger, items, align = 'center', side = 'bottom', sideOffset = 8, className, }) {
    return (_jsxs(RadixMenu.Root, { children: [_jsx(RadixMenu.Trigger, { asChild: true, children: trigger }), _jsx(RadixMenu.Portal, { children: _jsx(RadixMenu.Content, { className: cn('mrs-menu', className), align: align, side: side, sideOffset: sideOffset, children: items.map((item, i) => {
                        if (item.type === 'separator') {
                            return _jsx(RadixMenu.Separator, { className: "mrs-menu__separator" }, i);
                        }
                        if (item.type === 'label') {
                            return (_jsx(RadixMenu.Label, { className: "mrs-menu__label", children: item.label }, i));
                        }
                        return (_jsxs(RadixMenu.Item, { className: cn('mrs-menu__item', item.danger && 'mrs-menu__item--danger'), disabled: item.disabled, onSelect: () => item.onSelect(), children: [item.icon != null ? (_jsx("span", { className: "mrs-menu__icon", children: item.icon })) : null, _jsx("span", { children: item.label })] }, i));
                    }) }) })] }));
}
