import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from './cn'

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
  id,
  className,
  ...rest
}: SwitchProps) {
  return (
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
    >
      <RadixSwitch.Thumb className="mrs-switch__thumb" />
    </RadixSwitch.Root>
  )
}
