import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Un-opinionated divider line on `--color-border-primary`. A `role="separator"`
 * element with `aria-orientation`; a `horizontal` rule fills its container's width, a
 * `vertical` one fills its height (give the parent a height / use it in a flex row).
 *
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 */
export function Separator({ orientation = 'horizontal', className, ...rest }) {
    return (_jsx("div", { role: "separator", "aria-orientation": orientation, className: cn('mrs-separator', orientation === 'vertical' && 'mrs-separator--vertical', className), ...rest }));
}
