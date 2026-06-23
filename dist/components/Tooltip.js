import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from './cn';
/**
 * Ergonomic single-component tooltip on Radix Tooltip — pass the trigger as
 * `children` and the bubble as `content`. Mounts its own `Provider` internally,
 * so consumers needn't wrap the app. The bubble portals out and is styled with
 * the theme tokens. Optionally controlled via `open` / `onOpenChange`.
 *
 * ```tsx
 * <Tooltip content="Copy to clipboard">
 *   <Button>Copy</Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children, side = 'top', align = 'center', sideOffset = 6, delayDuration = 300, open, onOpenChange, className, }) {
    return (_jsx(RadixTooltip.Provider, { delayDuration: delayDuration, children: _jsxs(RadixTooltip.Root, { open: open, onOpenChange: onOpenChange, delayDuration: delayDuration, children: [_jsx(RadixTooltip.Trigger, { asChild: true, children: children }), _jsx(RadixTooltip.Portal, { children: _jsxs(RadixTooltip.Content, { className: cn('mrs-tooltip', className), side: side, align: align, sideOffset: sideOffset, children: [content, _jsx(RadixTooltip.Arrow, { className: "mrs-tooltip__arrow" })] }) })] }) }));
}
