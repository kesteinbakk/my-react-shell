import { type ChangeEvent, type InputHTMLAttributes, useState, useEffect, type FocusEvent } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './cn'
import { useDebounce } from './useDebounce'

export type InputSize = 'sm' | 'md' | 'lg'

const inputVariants = cva('mrs-input', {
  variants: {
    inputSize: {
      sm: 'mrs-input--sm',
      md: 'mrs-input--md',
      lg: 'mrs-input--lg',
    },
    invalid: { true: 'mrs-input--invalid' },
    fullWidth: { true: 'mrs-input--full' },
  },
  defaultVariants: { inputSize: 'md' },
})

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Error state — sets `aria-invalid` and the error styling. */
  invalid?: boolean
  /**
   * Size — drives height + padding + font size. Defaults to `md`. Named `inputSize`
   * (not `size`) so it never clashes with the native `<input size>` attribute.
   */
  inputSize?: InputSize
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  /** Fires `debounceMs` after the user stops typing, with the current value. */
  onDebouncedChange?: (value: string) => void
  /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
  debounceMs?: number
  /** Visual save status. If 'saved', transitions the border to success color. */
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  /** Custom onChange handler. Crucial for typing tracking. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
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

const ErrorIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/**
 * Un-opinionated native `<input>` wrapper. All native input props (`type`, `value`,
 * `onChange`, `placeholder`, `disabled`, `aria-*`, …) pass straight through; the only
 * additions are `invalid` (error styling + `aria-invalid`), `inputSize`, and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export function Input({
  invalid = false,
  inputSize = 'md',
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  saveStatus,
  onBlur,
  ...rest
}: InputProps) {
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (localStatus === 'saved' || localStatus === 'error') {
      setLocalStatus('idle')
    }
    onBlur?.(e)
  }

  const isInvalid = invalid || localStatus === 'error'

  return (
    <div className={cn('mrs-input-wrapper', fullWidth && 'mrs-input-wrapper--full')}>
      <input
        className={cn(
          inputVariants({ inputSize, invalid: isInvalid || undefined, fullWidth: fullWidth || undefined }),
          localStatus === 'saved' && 'mrs-input--saved-icon',
          localStatus === 'error' && 'mrs-input--error-icon',
          localStatus === 'saving' && 'mrs-input--saving',
          className,
        )}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
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
}
