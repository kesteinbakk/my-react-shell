import { useState } from 'react';
const isBlank = (v) => v == null || String(v).trim() === '';
/**
 * Shell-managed "required" validation with **no** native constraint API — so the
 * browser's native validation bubble never appears and the app owns the whole UX.
 *
 * Reports an `autoInvalid` flag that mirrors the CSS `:user-invalid` timing: it only
 * turns on after the user has left an empty required field (blur), and clears the
 * moment a non-empty value is entered. `autoInvalid` is meant to be OR-ed with the
 * component's controlled `invalid`/`error` state, which still takes precedence.
 */
export function useRequiredValidation({ required, validateOnBlur, value, defaultValue, }) {
    const [touched, setTouched] = useState(false);
    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
    // Controlled `value` is authoritative; fall back to the tracked uncontrolled value.
    const current = value !== undefined ? value : uncontrolled;
    const autoInvalid = Boolean(required) && Boolean(validateOnBlur) && touched && isBlank(current);
    return {
        autoInvalid,
        markTouched: () => setTouched(true),
        trackValue: (v) => {
            if (value === undefined)
                setUncontrolled(v);
        },
    };
}
