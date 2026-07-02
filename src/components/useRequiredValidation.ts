import { useState } from 'react'

export interface RequiredValidationOptions {
  /** Whether the field is mandatory (shell-managed — no native constraint API). */
  required?: boolean
  /** Opt in to the "empty-required-on-blur → invalid" behaviour. */
  validateOnBlur?: boolean
  /** The control's current value (controlled usage). */
  value?: string | number | readonly string[]
  /** The control's initial value (uncontrolled usage). */
  defaultValue?: string | number | readonly string[]
}

export interface RequiredValidation {
  /** `true` once an empty required field has been blurred (mirrors `:user-invalid` timing). */
  autoInvalid: boolean
  /** Call from the control's `onBlur`. */
  markTouched: () => void
  /** Call from the control's `onChange` with the new value (tracks uncontrolled usage). */
  trackValue: (value: string) => void
}

const isBlank = (v: string | number | readonly string[] | null | undefined): boolean =>
  v == null || String(v).trim() === ''

/**
 * Shell-managed "required" validation with **no** native constraint API — so the
 * browser's native validation bubble never appears and the app owns the whole UX.
 *
 * Reports an `autoInvalid` flag that mirrors the CSS `:user-invalid` timing: it only
 * turns on after the user has left an empty required field (blur), and clears the
 * moment a non-empty value is entered. `autoInvalid` is meant to be OR-ed with the
 * component's controlled `invalid`/`error` state, which still takes precedence.
 */
export function useRequiredValidation({
  required,
  validateOnBlur,
  value,
  defaultValue,
}: RequiredValidationOptions): RequiredValidation {
  const [touched, setTouched] = useState(false)
  const [uncontrolled, setUncontrolled] = useState<string | number | readonly string[]>(
    defaultValue ?? '',
  )

  // Controlled `value` is authoritative; fall back to the tracked uncontrolled value.
  const current = value !== undefined ? value : uncontrolled
  const autoInvalid = Boolean(required) && Boolean(validateOnBlur) && touched && isBlank(current)

  return {
    autoInvalid,
    markTouched: () => setTouched(true),
    trackValue: (v) => {
      if (value === undefined) setUncontrolled(v)
    },
  }
}
