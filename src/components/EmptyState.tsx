import type { ReactNode } from 'react'
import { cn } from './cn'

export interface EmptyStateProps {
  /** Optional illustrative icon above the title. */
  icon?: ReactNode
  /** The headline — required. */
  title: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** Optional action slot (e.g. a button) under the text. */
  action?: ReactNode
  className?: string
}

/**
 * Centered empty / zero-state: an optional icon, a title, a description, and an
 * optional action — for "nothing here yet" surfaces.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('mrs-empty', className)}>
      {icon != null && (
        <div className="mrs-empty__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="mrs-empty__title">{title}</div>
      {description != null && <div className="mrs-empty__desc">{description}</div>}
      {action != null && <div className="mrs-empty__action">{action}</div>}
    </div>
  )
}
