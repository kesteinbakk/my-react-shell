import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal alignment of each row. `'start'` (default) packs cards from the
   * left, leaving any extra space as a larger gap at the end of the row;
   * `'center'` centers each row.
   */
  align?: 'start' | 'center'
  /**
   * Fixed gap between cards, any CSS length. Defaults to `1.5rem` — sized so four
   * ≈312px cards fit on a `wide` (1440px) container row.
   */
  gap?: string
  children?: ReactNode
}

/**
 * A static grid of fixed-size cards: they flow left-to-right and wrap when a row
 * is full, separated by a fixed `gap`. Cards are **not** stretched, so a larger
 * gap may remain at the end of a row, and every card keeps its own intrinsic
 * width/height (e.g. {@link StatCard}, {@link ContentCard}, {@link PhiCard}).
 *
 * For fluid cards that stretch to fill uniform columns, use {@link DynamicCards}.
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(function CardGrid(
  { align = 'start', gap, className, style, children, ...props },
  ref,
) {
  const cssVars = gap != null
    ? ({ '--mrs-card-grid-gap': gap, ...style } as React.CSSProperties)
    : style

  return (
    <div
      ref={ref}
      className={cn('mrs-card-grid', align === 'center' && 'mrs-card-grid--center', className)}
      style={cssVars}
      {...props}
    >
      {children}
    </div>
  )
})
