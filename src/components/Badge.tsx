import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './cn'
import type { Tone } from './tone'

const badgeVariants = cva('mrs-badge', {
  variants: {
    tone: {
      primary: 'mrs-badge--primary',
      neutral: 'mrs-badge--neutral',
      success: 'mrs-badge--success',
      warning: 'mrs-badge--warning',
      danger: 'mrs-badge--danger',
      info: 'mrs-badge--info',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export type BadgeTone = Tone

export interface BadgeProps {
  /** Semantic tone. Defaults to `neutral`. */
  tone?: BadgeTone
  /** Show a leading status dot. */
  dot?: boolean
  children?: ReactNode
  className?: string
}

/** Compact status / category badge on the semantic tint + `-strong` tokens. */
export function Badge({ tone = 'neutral', dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {dot && <span className="mrs-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
