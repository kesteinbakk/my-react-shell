import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { PHI } from './PhiCard'

export type GridCardSize = 'sm' | 'md' | 'lg'
export type GridCardVariant = 'standard' | 'landscape'

export interface GridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  size?: GridCardSize
  variant?: GridCardVariant
  title?: ReactNode
  subtitle?: ReactNode
}

export const GRID_CARD_MIN_WIDTH: Record<GridCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 400,
}

export const GRID_CARD_MAX_WIDTH: Record<GridCardSize, number> = {
  sm: 210,
  md: 320,
  lg: 500,
}

/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export const GridCard = forwardRef<HTMLDivElement, GridCardProps>(function GridCard(
  { size, variant = 'standard', title, subtitle, className, style, children, ...props },
  ref,
) {
  const minWidth = size ? GRID_CARD_MIN_WIDTH[size] : undefined
  const maxWidth = size ? GRID_CARD_MAX_WIDTH[size] : undefined
  const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`

  const hasHeader = title != null || subtitle != null

  const cssVars = {
    '--mrs-grid-card-aspect-ratio': aspectRatio,
    ...style,
  } as React.CSSProperties

  if (minWidth) (cssVars as any)['--mrs-grid-card-min-width'] = `${minWidth}px`
  if (maxWidth) (cssVars as any)['--mrs-grid-card-max-width'] = `${maxWidth}px`

  return (
    <div
      ref={ref}
      className={cn('mrs-grid-card', className)}
      style={cssVars}
      {...props}
    >
      {hasHeader ? (
        <div className="mrs-grid-card__header">
          {title ? <div className="mrs-grid-card__title">{title}</div> : null}
          {subtitle ? <div className="mrs-grid-card__subtitle">{subtitle}</div> : null}
        </div>
      ) : null}
      
      <div className="mrs-grid-card__body">
        {children}
      </div>
    </div>
  )
})
