import { useId, type ReactNode } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from './cn'
import { Label } from './Label'

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps {
  options: SelectOption[]
  /** Selected value (controlled). */
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Accessible label for the trigger. */
  'aria-label'?: string
  /** Trigger height / padding — matches the `Input` size scale. Defaults to `'md'`. */
  size?: SelectSize
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  className?: string
  /** Visual save status. If 'saved', transitions the trigger border to success. */
  saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  /** Optional label. If provided, renders a small label above the select trigger. */
  label?: ReactNode
  id?: string
}

const chevron = (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const check = (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  disabled,
  size = 'md',
  fullWidth = false,
  className,
  saveStatus,
  label,
  id: passedId,
  ...rest
}: SelectProps) {
  const isError = saveStatus === 'error'
  const generatedId = useId()
  const id = passedId ?? generatedId

  const selectEl = (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        className={cn(
          'mrs-select__trigger',
          `mrs-select__trigger--${size}`,
          fullWidth && 'mrs-select__trigger--full',
          saveStatus === 'saved' && 'mrs-select__trigger--saved',
          isError && 'mrs-select__trigger--error',
          className,
        )}
        aria-invalid={isError || undefined}
        aria-label={rest['aria-label']}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="mrs-select__chevron">{chevron}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="mrs-select__content"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="mrs-select__viewport">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="mrs-select__item"
              >
                <span className="mrs-select__indicator">
                  <RadixSelect.ItemIndicator>{check}</RadixSelect.ItemIndicator>
                </span>
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )

  if (label != null) {
    return (
      <div className={cn('mrs-field', fullWidth && 'mrs-field--full')}>
        <Label htmlFor={id} className="mrs-field__label">
          {label}
        </Label>
        {selectEl}
      </div>
    )
  }

  return selectEl
}

