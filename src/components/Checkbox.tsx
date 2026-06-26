import { type CSSProperties } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from './cn'

export interface CheckboxProps {
  /** Checked state (controlled) — `true`, `false`, or `'indeterminate'`. */
  checked?: boolean | 'indeterminate'
  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean | 'indeterminate'
  /** Fired when the checked state changes. */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  disabled?: boolean
  required?: boolean
  /** Form field name (for submission). */
  name?: string
  /** Submitted value when checked. Defaults to `"on"`. */
  value?: string
  id?: string
  /** Accessible label — required when there's no associated `<label>`. */
  'aria-label'?: string
  className?: string
  style?: CSSProperties
}

const check = (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const dash = (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
  </svg>
)

/**
 * Un-opinionated checkbox on Radix Checkbox — keyboard- and form-aware, with a
 * tri-state (`checked` · unchecked · `'indeterminate'`) value. The check / dash
 * glyph is hand-rolled (stroke = `currentColor`); the checked box fills with
 * `--color-primary`. Controlled via `checked` / `onCheckedChange` or uncontrolled
 * via `defaultChecked`.
 *
 * ```tsx
 * <Checkbox checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} aria-label="Agree" />
 * ```
 */
export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  id,
  className,
  style,
  ...rest
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      id={id}
      aria-label={rest['aria-label']}
      className={cn('mrs-checkbox', className)}
      style={style}
    >
      <RadixCheckbox.Indicator className="mrs-checkbox__indicator">
        {/* Both glyphs are present; CSS picks one off the Indicator's
            data-state, so this is correct in controlled and uncontrolled mode. */}
        <span className="mrs-checkbox__check">{check}</span>
        <span className="mrs-checkbox__dash">{dash}</span>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}
