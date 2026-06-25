import { type ChangeEvent, type TextareaHTMLAttributes, useState, useEffect, type FocusEvent } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'

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
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  /** Custom onChange handler. Crucial for typing tracking. */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '1.15em', height: '1.15em' }}
  >
    <polyline points="20 6 9 17 4 12" />
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
  ...rest
}: TextareaProps) {
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved') {
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved') {
      setLocalStatus('idle')
    }
    onBlur?.(e)
  }

  const isInvalid = invalid || localStatus === 'error'

  const textareaEl = (
    <textarea
      className={cn(
        'mrs-textarea',
        isInvalid && 'mrs-textarea--invalid',
        fullWidth && 'mrs-textarea--full',
        localStatus === 'saved' && 'mrs-textarea--saved-icon',
        localStatus === 'saving' && 'mrs-textarea--saving',
        className,
      )}
      aria-invalid={isInvalid || undefined}
      onChange={handleChange}
      onBlur={handleBlur}
      {...rest}
    />
  )

  if (localStatus === 'saved') {
    return (
      <div className={cn('mrs-textarea-wrapper', fullWidth && 'mrs-textarea-wrapper--full')}>
        {textareaEl}
        <span className="mrs-textarea-icon-saved">
          <CheckIcon />
        </span>
      </div>
    )
  }

  return textareaEl
}
