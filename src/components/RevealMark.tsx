import type { ReactNode } from 'react'
import { cn } from './cn'

export interface RevealMarkProps {
  /** The resting layer, shown until the host is hovered (or `open` is set). */
  closed: ReactNode
  /** The layer cross-faded in on hover of the nearest `.mrs-reveal-host`, or when `open` is `true`. */
  revealed: ReactNode
  /**
   * Force the revealed layer regardless of hover — e.g. to mark the active route. When set,
   * the mark ignores hover and stays on `revealed`.
   */
  open?: boolean
  className?: string
}

/**
 * Hover-reveal seam — two stacked layers that cross-fade. The `revealed` layer replaces
 * `closed` when the mark's nearest **`.mrs-reveal-host`** ancestor is hovered, or unconditionally
 * when `open` is `true`. Purely presentational (`aria-hidden`); it carries no semantics and is
 * meant to sit in a decorative slot such as a card watermark.
 *
 * The reveal is driven entirely by CSS — the host owns the hover, not the mark — so a mark works
 * inside any container that carries `mrs-reveal-host`. `DynamicGridCard` adds that class to its
 * root when given an element `watermark`, so a mark dropped there opens on card hover.
 *
 * {@link DrawerMark} is the first instance; build new marks the same way.
 */
export function RevealMark({ closed, revealed, open, className }: RevealMarkProps) {
  return (
    <span className={cn('mrs-reveal-mark', className)} data-open={open || undefined} aria-hidden="true">
      <span className="mrs-reveal-mark__layer mrs-reveal-mark__closed">{closed}</span>
      <span className="mrs-reveal-mark__layer mrs-reveal-mark__revealed">{revealed}</span>
    </span>
  )
}
