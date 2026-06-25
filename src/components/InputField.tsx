import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode, useState, useEffect, useRef } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'
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
   * Size — drives the input height + padding + font size. Defaults to `md`. Named `inputSize`
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
  inputSize = 'md',
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  saveStatus,
  ...inputProps
}: InputFieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  const errId = `${id}-err`
  const [localStatus, setLocalStatus] = useState<typeof saveStatus | 'saved-fading'>(saveStatus)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimeouts = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
  }

  useEffect(() => {
    clearTimeouts()
    setLocalStatus(saveStatus)

    if (saveStatus === 'saved') {
      fadeTimeoutRef.current = setTimeout(() => {
        setLocalStatus('saved-fading')
        idleTimeoutRef.current = setTimeout(() => {
          setLocalStatus('idle')
        }, 1000) // matches the 1000ms transition duration
      }, 1500) // stay green for 1.5s before fading
    }

    return () => clearTimeouts()
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (localStatus === 'saved' || localStatus === 'saved-fading') {
      clearTimeouts()
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const isError = error != null || localStatus === 'error'
  const showError = error != null
  const showDesc = description != null && !showError

  return (
    <div className={cn('mrs-field', fullWidth && 'mrs-field--full', containerClassName)}>
      {label != null && (
        <label htmlFor={id} className="mrs-field__label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'mrs-field__input',
          inputSize !== 'md' && `mrs-field__input--${inputSize}`,
          isError && 'mrs-field__input--error',
          localStatus === 'saved' && 'mrs-field__input--saved',
          localStatus === 'saved-fading' && 'mrs-field__input--saved-fading',
          localStatus === 'saving' && 'mrs-field__input--saving',
          className,
        )}
        aria-invalid={isError || undefined}
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
