import { useId, type ChangeEvent, type TextareaHTMLAttributes, useState, useEffect, type FocusEvent, type ReactNode } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'
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
  id: passedId,
  ...rest
}: TextareaProps) {
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)
  const generatedId = useId()
  const id = passedId ?? generatedId

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    onBlur?.(e)
  }

  const isInvalid = invalid || localStatus === 'error'

  const textareaEl = (
    <div className={cn('mrs-textarea-wrapper', fullWidth && 'mrs-textarea-wrapper--full')}>
      <textarea
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
        <Label htmlFor={id} className="mrs-field__label">
          {label}
        </Label>
        {textareaEl}
      </div>
    )
  }

  return textareaEl
}

