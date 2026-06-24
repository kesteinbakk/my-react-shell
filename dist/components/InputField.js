import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
/**
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export function InputField({ label, description, error, containerClassName, inputSize = 'md', fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, ...inputProps }) {
    const id = useId();
    const descId = `${id}-desc`;
    const errId = `${id}-err`;
    const showError = error != null;
    const showDesc = description != null && !showError;
    const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs);
    const handleChange = onChange || onDebouncedChange
        ? (e) => {
            onChange?.(e);
            scheduleDebounced(e.target.value);
        }
        : undefined;
    return (_jsxs("div", { className: cn('mrs-field', fullWidth && 'mrs-field--full', containerClassName), children: [label != null && (_jsx("label", { htmlFor: id, className: "mrs-field__label", children: label })), _jsx("input", { id: id, className: cn('mrs-field__input', inputSize !== 'md' && `mrs-field__input--${inputSize}`, showError && 'mrs-field__input--error', className), "aria-invalid": showError || undefined, "aria-describedby": showError ? errId : showDesc ? descId : undefined, onChange: handleChange, ...inputProps }), showDesc && (_jsx("p", { id: descId, className: "mrs-field__desc", children: description })), showError && (_jsx("p", { id: errId, className: "mrs-field__error", children: error }))] }));
}
