import { type ChangeEvent, type InputHTMLAttributes } from 'react'
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

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
}

/**
 * Un-opinionated native `<input>` wrapper. All native input props (`type`, `value`,
 * `onChange`, `placeholder`, `disabled`, `aria-*`, …) pass straight through; the only
 * additions are `invalid` (error styling + `aria-invalid`), `inputSize`, and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 *
 * ```tsx
 * <Input placeholder="Email" />
 * <Input type="password" inputSize="lg" />
 * <Input invalid value={v} onChange={(e) => setV(e.target.value)} />
 * <Input onDebouncedChange={(v) => search(v)} debounceMs={300} />
 * ```
 */
export function Input({
  invalid = false,
  inputSize = 'md',
  fullWidth = false,
  className,
  onDebouncedChange,
  debounceMs = 500,
  onChange,
  ...rest
}: InputProps) {
  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange =
    onChange || onDebouncedChange
      ? (e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e)
          scheduleDebounced(e.target.value)
        }
      : undefined

  return (
    <input
      className={cn(inputVariants({ inputSize, invalid: invalid || undefined, fullWidth: fullWidth || undefined }), className)}
      aria-invalid={invalid || undefined}
      onChange={handleChange}
      {...rest}
    />
  )
}
