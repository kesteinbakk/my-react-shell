import type { ReactNode } from 'react'
import * as RadixToggleGroup from '@radix-ui/react-toggle-group'
import type { ToggleSize, ToggleVariant } from './Toggle'
import { cn } from './cn'

export interface ToggleGroupOption<T extends string> {
  value: T
  /** Item contents — typically an icon glyph or short label. */
  label: ReactNode
  disabled?: boolean
  /** Accessible label — required when the contents are icon-only. */
  'aria-label'?: string
}

interface ToggleGroupBaseProps<T extends string> {
  options: ToggleGroupOption<T>[]
  /** Structural style, shared by every item. Defaults to `ghost`. */
  variant?: ToggleVariant
  /** Item size. Defaults to `md`. */
  size?: ToggleSize
  disabled?: boolean
  /** Accessible label for the group. */
  'aria-label'?: string
  className?: string
}

export interface ToggleGroupSingleProps<T extends string> extends ToggleGroupBaseProps<T> {
  /** One-of-a-set selection (default). */
  type?: 'single'
  /** Selected value (controlled); `undefined` when nothing is pressed. */
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

export interface ToggleGroupMultipleProps<T extends string> extends ToggleGroupBaseProps<T> {
  /** Independent multi-select. */
  type: 'multiple'
  /** Selected values (controlled). */
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (value: T[]) => void
}

export type ToggleGroupProps<T extends string> =
  | ToggleGroupSingleProps<T>
  | ToggleGroupMultipleProps<T>

/**
 * Un-opinionated set of toggle buttons on Radix ToggleGroup — a data-driven row of
 * `options`, each a pressable {@link Toggle}-styled item. `type="single"` is one-of-a-set
 * (value is the chosen string, or `undefined`); `type="multiple"` is independent toggles
 * (value is an array). `variant` / `size` apply to every item. Controlled via `value` /
 * `onValueChange`, or uncontrolled via `defaultValue`.
 *
 * ```tsx
 * <ToggleGroup
 *   aria-label="Text alignment"
 *   value={align}
 *   onValueChange={setAlign}
 *   options={[
 *     { value: 'left', label: <AlignLeft />, 'aria-label': 'Left' },
 *     { value: 'center', label: <AlignCenter />, 'aria-label': 'Center' },
 *     { value: 'right', label: <AlignRight />, 'aria-label': 'Right' },
 *   ]}
 * />
 * ```
 */
export function ToggleGroup<T extends string>(props: ToggleGroupProps<T>) {
  const {
    options,
    variant = 'ghost',
    size = 'md',
    disabled,
    className,
  } = props
  const items = options.map((opt) => (
    <RadixToggleGroup.Item
      key={opt.value}
      value={opt.value}
      disabled={opt.disabled}
      aria-label={opt['aria-label']}
      className={cn('mrs-toggle', `mrs-toggle--${variant}`, `mrs-toggle--${size}`)}
    >
      {opt.label}
    </RadixToggleGroup.Item>
  ))

  const common = {
    disabled,
    'aria-label': props['aria-label'],
    className: cn('mrs-toggle-group', className),
  }

  // Radix types `single` and `multiple` as distinct root shapes; branch so each
  // gets its correctly-typed `value` / `onValueChange`.
  if (props.type === 'multiple') {
    return (
      <RadixToggleGroup.Root
        type="multiple"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange as (value: string[]) => void}
        {...common}
      >
        {items}
      </RadixToggleGroup.Root>
    )
  }
  return (
    <RadixToggleGroup.Root
      type="single"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange as (value: string) => void}
      {...common}
    >
      {items}
    </RadixToggleGroup.Root>
  )
}
