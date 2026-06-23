import type { ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const countPillVariants = cva('mrs-count-pill', {
  variants: {
    tone: {
      primary: 'mrs-count-pill--primary',
      secondary: 'mrs-count-pill--secondary',
      success: 'mrs-count-pill--success',
      warning: 'mrs-count-pill--warning',
      danger: 'mrs-count-pill--danger',
      info: 'mrs-count-pill--info',
    },
  },
  defaultVariants: { tone: 'primary' },
})

export type CountPillTone = NonNullable<VariantProps<typeof countPillVariants>['tone']>

export interface CountPillProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** The numeric count to display. */
  count: number
  /** Solid color tone. Defaults to `primary`. */
  tone?: CountPillTone
  /** Clamp the display above this value, rendering `${max}+`. Defaults to `99`. */
  max?: number
}

/**
 * A small, solid-fill numeric count pill — unread counts, tab/section counts, a
 * notification-bell overlay. Renders `${max}+` once `count` exceeds `max`
 * (default `99`); the caller decides when to show it (e.g. only when `count >
 * 0`) and where to place it (an absolute overlay is the caller's `className`).
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-label`, `data-*`,
 * event handlers, …) to the root.
 */
export function CountPill({
  count,
  tone = 'primary',
  max = 99,
  className,
  ...rest
}: CountPillProps) {
  const display = count > max ? `${max}+` : String(count)
  return (
    <span className={cn(countPillVariants({ tone }), className)} {...rest}>
      {display}
    </span>
  )
}
