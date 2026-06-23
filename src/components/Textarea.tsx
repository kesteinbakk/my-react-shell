import { type ChangeEvent, type TextareaHTMLAttributes } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state — sets `aria-invalid` and the error styling. */
  invalid?: boolean
  /** Fires `debounceMs` after the user stops typing, with the current value. */
  onDebouncedChange?: (value: string) => void
  /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
  debounceMs?: number
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
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  ...rest
}: TextareaProps) {
  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange =
    onChange || onDebouncedChange
      ? (e: ChangeEvent<HTMLTextAreaElement>) => {
          onChange?.(e)
          scheduleDebounced(e.target.value)
        }
      : undefined

  return (
    <textarea
      className={cn('mrs-textarea', invalid && 'mrs-textarea--invalid', className)}
      aria-invalid={invalid || undefined}
      onChange={handleChange}
      {...rest}
    />
  )
}
