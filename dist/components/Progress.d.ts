import { type Tone } from './tone';
export type ProgressSize = 'sm' | 'md' | 'lg';
export interface ProgressProps {
    /**
     * Completion in `0…max`. Pass `null` (or omit) for an **indeterminate** bar — a
     * looping animation for work of unknown duration.
     */
    value?: number | null;
    /** Upper bound of `value`. Defaults to `100`. */
    max?: number;
    /** Fill colour. Defaults to `primary`. */
    tone?: Tone;
    /** Bar thickness. Defaults to `md`. */
    size?: ProgressSize;
    /** Accessible label for the bar (recommended when there's no visible label). */
    'aria-label'?: string;
    className?: string;
}
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
export declare function Progress({ value, max, tone, size, className, ...rest }: ProgressProps): import("react").JSX.Element;
