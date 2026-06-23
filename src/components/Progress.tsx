import * as RadixProgress from '@radix-ui/react-progress'
import { type Tone, TONE_COLOR } from './tone'
import { cn } from './cn'

export type ProgressSize = 'sm' | 'md' | 'lg'

export interface ProgressProps {
  /**
   * Completion in `0…max`. Pass `null` (or omit) for an **indeterminate** bar — a
   * looping animation for work of unknown duration.
   */
  value?: number | null
  /** Upper bound of `value`. Defaults to `100`. */
  max?: number
  /** Fill colour. Defaults to `primary`. */
  tone?: Tone
  /** Bar thickness. Defaults to `md`. */
  size?: ProgressSize
  /** Accessible label for the bar (recommended when there's no visible label). */
  'aria-label'?: string
  className?: string
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
export function Progress({
  value,
  max = 100,
  tone = 'primary',
  size = 'md',
  className,
  ...rest
}: ProgressProps) {
  const indeterminate = value == null
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <RadixProgress.Root
      value={indeterminate ? null : value}
      max={max}
      aria-label={rest['aria-label']}
      className={cn(
        'mrs-progress',
        `mrs-progress--${size}`,
        indeterminate && 'mrs-progress--indeterminate',
        className,
      )}
      style={{ ['--mrs-progress-tone' as string]: TONE_COLOR[tone] }}
    >
      <RadixProgress.Indicator
        className="mrs-progress__indicator"
        style={indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` }}
      />
    </RadixProgress.Root>
  )
}
