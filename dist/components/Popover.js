import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from './cn';
/**
 * A simple, opinionated popover on Radix Popover — a floating panel anchored to a
 * trigger, with focus management, outside-click / Esc close, and a portal. Pass the
 * anchor as `trigger` and the panel body as `children`; works controlled (`open` /
 * `onOpenChange`) or uncontrolled (`defaultOpen`). Styled with the theme tokens.
 *
 * ```tsx
 * <Popover trigger={<Button>Options</Button>}>
 *   <p>Anything goes in the panel.</p>
 * </Popover>
 *
 * <Popover open={open} onOpenChange={setOpen} side="right" align="start"
 *   trigger={<Button>Filters</Button>}>
 *   …
 * </Popover>
 * ```
 */
export function Popover({ trigger, children, open, onOpenChange, defaultOpen, align = 'center', side = 'bottom', sideOffset = 8, className, }) {
    return (_jsxs(RadixPopover.Root, { open: open, onOpenChange: onOpenChange, defaultOpen: defaultOpen, children: [_jsx(RadixPopover.Trigger, { asChild: true, children: trigger }), _jsx(RadixPopover.Portal, { children: _jsx(RadixPopover.Content, { className: cn('mrs-popover', className), align: align, side: side, sideOffset: sideOffset, children: children }) })] }));
}
