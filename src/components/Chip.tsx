import type { ReactNode } from 'react'
import { cn } from './cn'

export interface ChipProps {
  children?: ReactNode
  /** Selected styling (for toggle chips). */
  selected?: boolean
  /** Makes the label a toggle button calling this. */
  onClick?: () => void
  /** Shows a remove (×) button calling this. */
  onRemove?: () => void
  /** Accessible label for the remove button. Defaults to `"Remove"`. */
  removeLabel?: string
  className?: string
}

/**
 * A tag / chip — plain, toggleable (`onClick` + `selected`), or removable
 * (`onRemove`). The label and the remove control are separate buttons, so a
 * removable toggle chip never nests interactive elements.
 */
export function Chip({
  children,
  selected = false,
  onClick,
  onRemove,
  removeLabel = 'Remove',
  className,
}: ChipProps) {
  const interactive = onClick != null
  return (
    <span
      className={cn(
        'mrs-chip',
        selected && 'mrs-chip--selected',
        interactive && 'mrs-chip--interactive',
        className,
      )}
    >
      {interactive ? (
        <button
          type="button"
          className="mrs-chip__label mrs-chip__label--btn"
          onClick={onClick}
          aria-pressed={selected}
        >
          {children}
        </button>
      ) : (
        <span className="mrs-chip__label">{children}</span>
      )}
      {onRemove != null && (
        <button
          type="button"
          className="mrs-chip__remove"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

export interface ChipGroupProps {
  children?: ReactNode
  className?: string
}

/** Wrapping flex layout for a set of chips. Selection state lives at the call site. */
export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div role="group" className={cn('mrs-chip-group', className)}>
      {children}
    </div>
  )
}
