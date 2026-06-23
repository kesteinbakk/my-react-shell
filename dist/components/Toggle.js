import { jsx as _jsx } from "react/jsx-runtime";
import * as RadixToggle from '@radix-ui/react-toggle';
import { cn } from './cn';
/**
 * Un-opinionated two-state button on Radix Toggle — a single control that flips between
 * pressed and unpressed, themed against the tokens. The pressed state fills with
 * `--color-primary-bg`; `variant` chooses fill-only (`ghost`) or bordered (`outline`).
 * Controlled via `pressed` / `onPressedChange`, or uncontrolled via `defaultPressed`.
 *
 * ```tsx
 * <Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold"><BoldIcon /></Toggle>
 * ```
 */
export function Toggle({ pressed, defaultPressed, onPressedChange, variant = 'ghost', size = 'md', disabled, children, className, ...rest }) {
    return (_jsx(RadixToggle.Root, { pressed: pressed, defaultPressed: defaultPressed, onPressedChange: onPressedChange, disabled: disabled, "aria-label": rest['aria-label'], className: cn('mrs-toggle', `mrs-toggle--${variant}`, `mrs-toggle--${size}`, className), children: children }));
}
