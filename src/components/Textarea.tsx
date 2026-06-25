import { type ChangeEvent, type TextareaHTMLAttributes, useState, useEffect, useRef } from 'react'
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

/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 *
 * ```tsx
 * <Textarea rows={4} placeholder="Notes…" />
 * <Textarea invalid value={v} onChange={(e) => setV(e.target.value)} />
 * <Textarea onDebouncedChange={(v) => save(v)} debounceMs={800} />
 * ```
 */
export function Textarea({
  invalid = false,
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  saveStatus,
  ...rest
}: TextareaProps) {
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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (localStatus === 'saved' || localStatus === 'saved-fading') {
      clearTimeouts()
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const isInvalid = invalid || localStatus === 'error'

  return (
    <textarea
      className={cn(
        'mrs-textarea',
        isInvalid && 'mrs-textarea--invalid',
        fullWidth && 'mrs-textarea--full',
        localStatus === 'saved' && 'mrs-textarea--saved',
        localStatus === 'saved-fading' && 'mrs-textarea--saved-fading',
        localStatus === 'saving' && 'mrs-textarea--saving',
        className,
      )}
      aria-invalid={isInvalid || undefined}
      onChange={handleChange}
      {...rest}
    />
  )
}
