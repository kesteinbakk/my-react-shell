import type { ReactNode } from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { cn } from './cn'

export interface RadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps {
  /** The options, in display order. */
  options: RadioOption[]
  /** Selected value (controlled). */
  value?: string
  /** Initial value when uncontrolled. */
  defaultValue?: string
  /** Fired when the selected value changes. */
  onValueChange?: (value: string) => void
  /** Form field name (for submission). */
  name?: string
  /** Disable the whole group. */
  disabled?: boolean
  /** Layout axis. Defaults to `vertical`. */
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

/**
 * Un-opinionated radio group on Radix RadioGroup — a single-select set with roving
 * arrow-key focus, keyboard- and form-aware. Data-driven via `options`; each row is
 * an item (the dot fills with `--color-primary` when selected) and its label.
 * Controlled via `value` / `onValueChange` or uncontrolled via `defaultValue`.
 *
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: 'card', label: 'Card' },
 *     { value: 'cash', label: 'Cash' },
 *   ]}
 *   value={method}
 *   onValueChange={setMethod}
 * />
 * ```
 */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <RadixRadioGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      orientation={orientation}
      className={cn('mrs-radio-group', `mrs-radio-group--${orientation}`, className)}
    >
      {options.map((opt) => {
        const itemId = name ? `${name}-${opt.value}` : undefined
        return (
          <label key={opt.value} className="mrs-radio-group__row">
            <RadixRadioGroup.Item
              value={opt.value}
              disabled={opt.disabled}
              id={itemId}
              className="mrs-radio"
            >
              <RadixRadioGroup.Indicator className="mrs-radio__dot" />
            </RadixRadioGroup.Item>
            <span className="mrs-radio-group__label">{opt.label}</span>
          </label>
        )
      })}
    </RadixRadioGroup.Root>
  )
}
