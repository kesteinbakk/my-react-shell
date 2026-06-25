import { type ChangeEvent, type InputHTMLAttributes, useState, useEffect } from 'react'
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
  saveStatus,
  ...rest
}: InputProps) {
  const [localStatus, setLocalStatus] = useState<typeof saveStatus>(saveStatus)

  useEffect(() => {
    setLocalStatus(saveStatus)
  }, [saveStatus])

  const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (localStatus === 'saved') {
      setLocalStatus('idle')
    }
    onChange?.(e)
    scheduleDebounced(e.target.value)
  }

  const isInvalid = invalid || localStatus === 'error'

  return (
    <input
      className={cn(
        inputVariants({ inputSize, invalid: isInvalid || undefined, fullWidth: fullWidth || undefined }),
        localStatus === 'saved' && 'mrs-input--saved',
        localStatus === 'saving' && 'mrs-input--saving',
        className,
      )}
      aria-invalid={isInvalid || undefined}
      onChange={handleChange}
      {...rest}
    />
  )
}
