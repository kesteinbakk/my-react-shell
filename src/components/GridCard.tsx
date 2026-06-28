import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { PHI } from './PhiCard'

export type GridCardSize = 'sm' | 'md' | 'lg' | 'xl'
export type GridCardVariant = 'standard' | 'landscape'

export interface GridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  size?: GridCardSize
  variant?: GridCardVariant
  title?: ReactNode
  subtitle?: ReactNode
  footer?: ReactNode
}

const SIZE_MIN_WIDTH: Record<GridCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

const SIZE_MAX_WIDTH: Record<GridCardSize, number> = {
  sm: 240,
  md: 320,
  lg: 480,
  xl: 720,
}

/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export const GridCard = forwardRef<HTMLDivElement, GridCardProps>(function GridCard(
  { size = 'md', variant = 'standard', title, subtitle, footer, className, style, children, ...props },
  ref,
) {
  const minWidth = SIZE_MIN_WIDTH[size]
  const maxWidth = SIZE_MAX_WIDTH[size]
  const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`

  const hasHeader = title != null || subtitle != null
  const hasFooter = footer != null

  return (
    <div
      ref={ref}
      className={cn('mrs-grid-card', className)}
      style={{
        '--mrs-grid-card-min-width': `${minWidth}px`,
        '--mrs-grid-card-max-width': `${maxWidth}px`,
        '--mrs-grid-card-aspect-ratio': aspectRatio,
        ...style,
      } as React.CSSProperties}
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

      {hasFooter ? (
        <div className="mrs-grid-card__footer">
          {footer}
        </div>
      ) : null}
    </div>
  )
})
