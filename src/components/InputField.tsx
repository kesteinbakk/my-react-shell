import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Field label, associated to the input. */
  label?: ReactNode
  /** Helper text under the input (hidden while an error shows). */
  description?: ReactNode
  /** Error message — sets the error styling and `aria-invalid`. */
  error?: ReactNode
  /** Class for the wrapping field; `className` styles the input itself. */
  containerClassName?: string
  /** Fires `debounceMs` after the user stops typing, with the current value. */
  onDebouncedChange?: (value: string) => void
  /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
  debounceMs?: number
}

/**
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export function InputField({
  label,
  description,
  error,
  containerClassName,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  ...inputProps
}: InputFieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  const errId = `${id}-err`
  const showError = error != null
  const showDesc = description != null && !showError
  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange =
    onChange || onDebouncedChange
      ? (e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e)
          scheduleDebounced(e.target.value)
        }
      : undefined

  return (
    <div className={cn('mrs-field', containerClassName)}>
      {label != null && (
        <label htmlFor={id} className="mrs-field__label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn('mrs-field__input', showError && 'mrs-field__input--error', className)}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errId : showDesc ? descId : undefined}
        onChange={handleChange}
        {...inputProps}
      />
      {showDesc && (
        <p id={descId} className="mrs-field__desc">
          {description}
        </p>
      )}
      {showError && (
        <p id={errId} className="mrs-field__error">
          {error}
        </p>
      )}
    </div>
  )
}
