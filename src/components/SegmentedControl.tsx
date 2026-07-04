import { type ReactNode, type CSSProperties } from 'react'
import { cn } from './cn'
import { type Tone, TONE_COLOR } from './tone'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  /** Optional icon node rendered beside the label. */
  icon?: ReactNode
  /** Which side of the label the icon sits. Default `'leading'`. */
  iconPosition?: 'leading' | 'trailing'
  /**
   * Semantic tone — colours this option's label + icon (an `icon` using
   * `currentColor` inherits it), across active and inactive states. Omitted →
   * the default neutral chrome (secondary → primary on hover/active).
   */
  tone?: Tone
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  /** Selected value (controlled). */
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  /** Accessible label for the group. */
  'aria-label'?: string
  className?: string
  style?: CSSProperties
}

/**
 * Single-select segmented control — a row of mutually-exclusive options on a track,
 * the active one lifted onto a surface chip. Controlled via `value` / `onChange`.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
  style,
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cn('mrs-segmented', `mrs-segmented--${size}`, fullWidth && 'mrs-segmented--full', className)}
      style={style}
    >
      {options.map((opt) => {
        const active = opt.value === value
        const trailing = opt.iconPosition === 'trailing'
        const iconNode = opt.icon ? (
          <span className="mrs-segmented__icon">{opt.icon}</span>
        ) : null
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            className={cn('mrs-segmented__item', active && 'mrs-segmented__item--active')}
            // Inline colour wins over the base/hover/active state rules, so a toned
            // option keeps its semantic colour in every state.
            style={opt.tone ? { color: TONE_COLOR[opt.tone] } : undefined}
            onClick={() => onChange(opt.value)}
          >
            {!trailing && iconNode}
            <span className="mrs-segmented__label">{opt.label}</span>
            {trailing && iconNode}
          </button>
        )
      })}
    </div>
  )
}
