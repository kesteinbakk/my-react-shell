import { jsx as _jsx } from "react/jsx-runtime";
import * as RadixProgress from '@radix-ui/react-progress';
import { TONE_COLOR } from './tone';
import { cn } from './cn';
/**
 * Un-opinionated progress bar on Radix Progress — a track with a fill that paints with
 * `tone` (default `primary`). Pass a numeric `value` (`0…max`) for a determinate bar, or
 * `null` / omit it for an indeterminate looping animation. Radix wires the ARIA
 * (`role="progressbar"`, `aria-valuenow/min/max`).
 *
 * ```tsx
 * <Progress value={uploaded} max={total} aria-label="Upload" />
 * <Progress value={null} aria-label="Loading" />   // indeterminate
 * ```
 */
export function Progress({ value, max = 100, tone = 'primary', size = 'md', className, ...rest }) {
    const indeterminate = value == null;
    const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    return (_jsx(RadixProgress.Root, { value: indeterminate ? null : value, max: max, "aria-label": rest['aria-label'], className: cn('mrs-progress', `mrs-progress--${size}`, indeterminate && 'mrs-progress--indeterminate', className), style: { ['--mrs-progress-tone']: TONE_COLOR[tone] }, children: _jsx(RadixProgress.Indicator, { className: "mrs-progress__indicator", style: indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` } }) }));
}
