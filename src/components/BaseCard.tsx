import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './cn'
import { PHI } from './PhiCard'

export type BaseCardSize = 'sm' | 'md' | 'lg' | 'xl'
export type BaseCardVariant = 'standard' | 'landscape'

export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  size?: BaseCardSize
  variant?: BaseCardVariant
}

const SIZE_MIN_WIDTH: Record<BaseCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

const SIZE_MAX_WIDTH: Record<BaseCardSize, number> = {
  sm: 240,
  md: 320,
  lg: 480,
  xl: 720,
}

/**
 * A purely structural card establishing the Phi golden ratio and size boundaries, 
 * without any opinionated content layout. It stretches fully within its min/max boundaries.
 */
export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(function BaseCard(
  { size = 'md', variant = 'standard', className, style, children, ...props },
  ref,
) {
  const minWidth = SIZE_MIN_WIDTH[size]
  const maxWidth = SIZE_MAX_WIDTH[size]
  const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`

  return (
    <div
      ref={ref}
      className={cn('mrs-base-card', className)}
      style={{
        '--mrs-base-card-min-width': `${minWidth}px`,
        '--mrs-base-card-max-width': `${maxWidth}px`,
        '--mrs-base-card-aspect-ratio': aspectRatio,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
})
