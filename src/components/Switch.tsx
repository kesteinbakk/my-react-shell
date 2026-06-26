import * as RadixSwitch from '@radix-ui/react-switch'
import { useId, type ReactNode, type CSSProperties } from 'react'
import { cn } from './cn'
import { Label } from './Label'

export interface SwitchProps {
  /** Checked state (controlled). */
  checked?: boolean
  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean
  /** Fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** Form field name (for submission). */
  name?: string
  /** Submitted value when checked. Defaults to `"on"`. */
  value?: string
  id?: string
  /** Accessible label — required when there's no associated `<label>`. */
  'aria-label'?: string
  className?: string
  style?: CSSProperties
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  /** Optional label. If provided, renders a label next to the switch. */
  label?: ReactNode
  /** Placement of the label relative to the switch. Defaults to `'right'`. */
  labelPlacement?: 'left' | 'right'
}

/**
 * Un-opinionated toggle switch on Radix Switch — a track with a sliding thumb,
 * keyboard- and form-aware. The checked track fills with `--color-primary`; the
 * thumb slides off the `[data-state=checked]` attribute. Controlled via
 * `checked` / `onCheckedChange` or uncontrolled via `defaultChecked`.
 *
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Notifications" />
 * ```
 */
export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  value,
  id: passedId,
  className,
  style,
  fullWidth = false,
  label,
  labelPlacement = 'right',
  ...rest
}: SwitchProps) {
  const generatedId = useId()
  const id = passedId ?? generatedId

  const switchEl = (
    <RadixSwitch.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      id={id}
      aria-label={rest['aria-label']}
      className={cn('mrs-switch', className)}
      style={label == null ? style : undefined}
    >
      <RadixSwitch.Thumb className="mrs-switch__thumb" />
    </RadixSwitch.Root>
  )

  if (label != null) {
    return (
      <div
        className={cn(
          'mrs-switch-wrapper',
          fullWidth && 'mrs-switch-wrapper--full'
        )}
        style={style}
      >
        {labelPlacement === 'left' && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        {switchEl}
        {labelPlacement === 'right' && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
      </div>
    )
  }

  return switchEl
}

