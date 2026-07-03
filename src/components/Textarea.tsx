import { useId, type ChangeEvent, type TextareaHTMLAttributes, useState, useEffect, type FocusEvent, type ReactNode, type Ref } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'
import { useRequiredValidation } from './useRequiredValidation'
import { Label } from './Label'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Error state — sets `aria-invalid` and the error styling. */
  invalid?: boolean
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  /** Fires `debounceMs` after the user stops typing, with the current value. */
  onDebouncedChange?: (value: string) => void
  /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
  debounceMs?: number
  /** Visual save status. If 'saved', transitions the border to success color. */
  saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  /** Custom onChange handler. Crucial for typing tracking. */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  /** Optional label. If provided, renders a small label above the textarea. */
  label?: ReactNode
  /**
   * Marks the field as mandatory: renders the red asterisk on the built-in `label`
   * and sets `aria-required`. Shell-managed — the native `required` attribute is
   * **not** set, so the browser's native validation bubble never appears.
   */
  required?: boolean
  /**
   * Shell-owned validation: once the user blurs an empty `required` field, the invalid
   * (red-border) state shows and clears the moment a value is typed. **Enabled by
   * default when `required` is set** — pass `false` to opt out (asterisk only). OR-ed
   * with the controlled `invalid`, which always takes precedence.
   */
  validateOnBlur?: boolean
  /**
   * Forwarded to the underlying `<textarea>` element. Lets a caller reach the DOM
   * node for imperative needs (focus, `selectionStart`/`selectionEnd`,
   * `setSelectionRange`) — e.g. inserting text at the caret. React-19 ref-as-prop
   * (no `forwardRef` wrapper needed).
   */
  ref?: Ref<HTMLTextAreaElement>
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
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export function Textarea({
  invalid = false,
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  saveStatus,
  onBlur,
  label,
  required = false,
  validateOnBlur = true,
  id: passedId,
  ref,
  ...rest
}: TextareaProps) {
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)
  const generatedId = useId()
  const id = passedId ?? generatedId

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)
  const { autoInvalid, markTouched, trackValue } = useRequiredValidation({
    required,
    validateOnBlur,
    value: rest.value,
    defaultValue: rest.defaultValue,
  })

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    trackValue(e.target.value)
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    markTouched()
    onBlur?.(e)
  }

  const isInvalid = invalid || localStatus === 'error' || autoInvalid

  const textareaEl = (
    <div className={cn('mrs-textarea-wrapper', fullWidth && 'mrs-textarea-wrapper--full')}>
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'mrs-textarea',
          isInvalid && 'mrs-textarea--invalid',
          fullWidth && 'mrs-textarea--full',
          localStatus === 'saved' && 'mrs-textarea--saved-icon',
          localStatus === 'error' && 'mrs-textarea--error-icon',
          localStatus === 'saving' && 'mrs-textarea--saving',
          className,
        )}
        aria-invalid={isInvalid || undefined}
        aria-required={required || undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
      />
      {localStatus === 'saved' && (
        <span className="mrs-textarea-icon-saved">
          <CheckIcon />
        </span>
      )}
      {localStatus === 'error' && (
        <span className="mrs-textarea-icon-error">
          <ErrorIcon />
        </span>
      )}
    </div>
  )

  if (label != null) {
    return (
      <div className={cn('mrs-field', fullWidth && 'mrs-field--full')}>
        <Label htmlFor={id} required={required} className="mrs-field__label">
          {label}
        </Label>
        {textareaEl}
      </div>
    )
  }

  return textareaEl
}

