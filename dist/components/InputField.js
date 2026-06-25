import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState, useEffect } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
const CheckIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "4 5 16 13", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '0.8em', height: '0.65em' }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const ErrorIcon = () => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "2 2 20 20", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '0.95em', height: '0.95em' }, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
/**
 * Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`).
 * Spreads native input props; pass `error` to switch on error styling.
 */
export function InputField({ label, description, error, containerClassName, inputSize = 'md', fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, onBlur, ...inputProps }) {
    const id = useId();
    const descId = `${id}-desc`;
    const errId = `${id}-err`;
    const [localStatus, setLocalStatus] = useState(saveStatus);
    useEffect(() => {
        setLocalStatus(saveStatus);
    }, [saveStatus]);
    const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs);
    const handleChange = (e) => {
        if (localStatus === 'saved' || localStatus === 'error') {
            setLocalStatus('idle');
        }
        onChange?.(e);
        scheduleDebounced(e.target.value);
    };
    const handleBlur = (e) => {
        if (localStatus === 'saved' || localStatus === 'error') {
            setLocalStatus('idle');
        }
        onBlur?.(e);
    };
    const isError = error != null || localStatus === 'error';
    const showError = error != null;
    const showDesc = description != null && !showError;
    const wrappedInput = (_jsxs("div", { className: cn('mrs-input-wrapper', fullWidth && 'mrs-input-wrapper--full'), children: [_jsx("input", { id: id, className: cn('mrs-field__input', inputSize !== 'md' && `mrs-field__input--${inputSize}`, isError && 'mrs-field__input--error', localStatus === 'saved' && 'mrs-field__input--saved-icon', localStatus === 'error' && 'mrs-field__input--error-icon', localStatus === 'saving' && 'mrs-field__input--saving', className), "aria-invalid": isError || undefined, "aria-describedby": showError ? errId : showDesc ? descId : undefined, onChange: handleChange, onBlur: handleBlur, ...inputProps }), localStatus === 'saved' && (_jsx("span", { className: "mrs-input-icon-saved", children: _jsx(CheckIcon, {}) })), localStatus === 'error' && (_jsx("span", { className: "mrs-input-icon-error", children: _jsx(ErrorIcon, {}) }))] }));
    return (_jsxs("div", { className: cn('mrs-field', fullWidth && 'mrs-field--full', containerClassName), children: [label != null && (_jsx("label", { htmlFor: id, className: "mrs-field__label", children: label })), wrappedInput, showDesc && (_jsx("p", { id: descId, className: "mrs-field__desc", children: description })), showError && (_jsx("p", { id: errId, className: "mrs-field__error", children: error }))] }));
}
