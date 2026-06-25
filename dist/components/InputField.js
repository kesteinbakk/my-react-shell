import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState, useEffect, useRef } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
/**
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export function InputField({ label, description, error, containerClassName, inputSize = 'md', fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, ...inputProps }) {
    const id = useId();
    const descId = `${id}-desc`;
    const errId = `${id}-err`;
    const [localStatus, setLocalStatus] = useState(saveStatus);
    const fadeTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const clearTimeouts = () => {
        if (fadeTimeoutRef.current)
            clearTimeout(fadeTimeoutRef.current);
        if (idleTimeoutRef.current)
            clearTimeout(idleTimeoutRef.current);
    };
    useEffect(() => {
        clearTimeouts();
        setLocalStatus(saveStatus);
        if (saveStatus === 'saved') {
            fadeTimeoutRef.current = setTimeout(() => {
                setLocalStatus('saved-fading');
                idleTimeoutRef.current = setTimeout(() => {
                    setLocalStatus('idle');
                }, 1000); // matches the 1000ms transition duration
            }, 1500); // stay green for 1.5s before fading
        }
        return () => clearTimeouts();
    }, [saveStatus]);
    const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs);
    const handleChange = (e) => {
        if (localStatus === 'saved' || localStatus === 'saved-fading') {
            clearTimeouts();
            setLocalStatus('idle');
        }
        onChange?.(e);
        scheduleDebounced(e.target.value);
    };
    const isError = error != null || localStatus === 'error';
    const showError = error != null;
    const showDesc = description != null && !showError;
    return (_jsxs("div", { className: cn('mrs-field', fullWidth && 'mrs-field--full', containerClassName), children: [label != null && (_jsx("label", { htmlFor: id, className: "mrs-field__label", children: label })), _jsx("input", { id: id, className: cn('mrs-field__input', inputSize !== 'md' && `mrs-field__input--${inputSize}`, isError && 'mrs-field__input--error', localStatus === 'saved' && 'mrs-field__input--saved', localStatus === 'saved-fading' && 'mrs-field__input--saved-fading', localStatus === 'saving' && 'mrs-field__input--saving', className), "aria-invalid": isError || undefined, "aria-describedby": showError ? errId : showDesc ? descId : undefined, onChange: handleChange, ...inputProps }), showDesc && (_jsx("p", { id: descId, className: "mrs-field__desc", children: description })), showError && (_jsx("p", { id: errId, className: "mrs-field__error", children: error }))] }));
}
