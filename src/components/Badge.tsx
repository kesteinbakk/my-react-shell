import type { ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const badgeVariants = cva('mrs-badge', {
  variants: {
    tone: {
      neutral: 'mrs-badge--neutral',
      success: 'mrs-badge--success',
      warning: 'mrs-badge--warning',
      danger: 'mrs-badge--danger',
      info: 'mrs-badge--info',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  /** Semantic tone. Defaults to `neutral`. */
  tone?: BadgeTone
  /** Show a leading status dot. */
  dot?: boolean
}

/**
 * Compact status / category badge on the semantic tint + `-on-bg` tokens.
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-*`, `data-*`, `id`,
 * event handlers, …) to the root, so a native tooltip or test id needs no
 * wrapper element.
 */
export function Badge({ tone = 'neutral', dot = false, children, className, ...rest }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...rest}>
      {dot && <span className="mrs-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
