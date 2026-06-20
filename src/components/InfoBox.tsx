import type { ReactNode } from 'react'
import { cn } from './cn'

export interface InfoBoxProps {
  /** Optional leading icon. */
  icon?: ReactNode
  /** Optional bold lead line. */
  title?: ReactNode
  /** Body content. */
  children?: ReactNode
  className?: string
}

/**
 * A neutral, low-emphasis contextual box — notes, help text, inline context.
 * For semantic success / warning / danger / info tones use `Alert` instead;
 * `InfoBox` is intentionally tone-free so it never competes with a real alert.
 */
export function InfoBox({ icon, title, children, className }: InfoBoxProps) {
  return (
    <div className={cn('mrs-infobox', className)}>
      {icon != null && (
        <span className="mrs-infobox__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="mrs-infobox__content">
        {title != null && <div className="mrs-infobox__title">{title}</div>}
        {children != null && <div className="mrs-infobox__body">{children}</div>}
      </div>
    </div>
  )
}
