import { type ReactNode, type CSSProperties } from 'react'
import { cn } from './cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
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
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            className={cn('mrs-segmented__item', active && 'mrs-segmented__item--active')}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
