import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode, useState, useEffect, type FocusEvent } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'
import { useRequiredValidation } from './useRequiredValidation'
import { Label } from './Label'
import type { InputSize } from './Input'

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  /** Field label, associated to the input. */
  label?: ReactNode
  /** Helper text under the input (hidden while an error shows). */
  description?: ReactNode
  /** Error message — sets the error styling and `aria-invalid`. */
  error?: ReactNode
  /** Class for the wrapping field; `className` styles the input itself. */
  containerClassName?: string
  /**
   * Size — drives height + padding + font size. Defaults to `md`.
   * Matches the `Input` height/padding scale.
   */
  inputSize?: InputSize
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  /** Fires `debounceMs` after the user stops typing, with the current value. */
  onDebouncedChange?: (value: string) => void
  /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
  debounceMs?: number
  /** Visual save status. If 'saved', transitions the border to success color. */
  saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  /** Custom onChange handler. Crucial for typing tracking. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Marks the field as mandatory: renders the red asterisk on the `label` and sets
   * `aria-required`. Shell-managed — the native `required` attribute is **not** set,
   * so the browser's native validation bubble never appears.
   */
  required?: boolean
  /**
   * Opt in to shell-owned validation: once the user blurs an empty `required` field,
   * the error (red-border) state shows and clears the moment a value is typed. OR-ed
   * with the controlled `error`, which always takes precedence. Default `false`.
   */
  validateOnBlur?: boolean
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="4 5 16 13"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '0.8em', height: '0.65em' }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="2 2 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '0.95em', height: '0.95em' }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/**
 * Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`).
 * Spreads native input props; pass `error` to switch on error styling.
 */
export function InputField({
  label,
  description,
  error,
  containerClassName,
  inputSize = 'md',
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  saveStatus,
  onBlur,
  required = false,
  validateOnBlur = false,
  ...inputProps
}: InputFieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  const errId = `${id}-err`
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)
  const { autoInvalid, markTouched, trackValue } = useRequiredValidation({
    required,
    validateOnBlur,
    value: inputProps.value,
    defaultValue: inputProps.defaultValue,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    trackValue(e.target.value)
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    markTouched()
    onBlur?.(e)
  }

  const isError = error != null || localStatus === 'error' || autoInvalid
  const showError = error != null
  const showDesc = description != null && !showError

  const wrappedInput = (
    <div className={cn('mrs-input-wrapper', fullWidth && 'mrs-input-wrapper--full')}>
      <input
        id={id}
        className={cn(
          'mrs-field__input',
          inputSize !== 'md' && `mrs-field__input--${inputSize}`,
          isError && 'mrs-field__input--error',
          localStatus === 'saved' && 'mrs-field__input--saved-icon',
          localStatus === 'error' && 'mrs-field__input--error-icon',
          localStatus === 'saving' && 'mrs-field__input--saving',
          className,
        )}
        aria-invalid={isError || undefined}
        aria-required={required || undefined}
        aria-describedby={showError ? errId : showDesc ? descId : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        {...inputProps}
      />
      {localStatus === 'saved' && (
        <span className="mrs-input-icon-saved">
          <CheckIcon />
        </span>
      )}
      {localStatus === 'error' && (
        <span className="mrs-input-icon-error">
          <ErrorIcon />
        </span>
      )}
    </div>
  )

  return (
    <div className={cn('mrs-field', fullWidth && 'mrs-field--full', containerClassName)}>
      {label != null && (
        <Label htmlFor={id} required={required} className="mrs-field__label">
          {label}
        </Label>
      )}
      {wrappedInput}
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
