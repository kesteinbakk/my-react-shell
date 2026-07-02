import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
import { useRequiredValidation } from './useRequiredValidation';
import { Label } from './Label';
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
});
const CheckIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "4 5 16 13", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '0.8em', height: '0.65em' }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const ErrorIcon = () => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "2 2 20 20", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '0.95em', height: '0.95em' }, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
/**
 * Un-opinionated native `<input>` wrapper. All native input props (`type`, `value`,
 * `onChange`, `placeholder`, `disabled`, `aria-*`, …) pass straight through; the only
 * additions are `invalid` (error styling + `aria-invalid`), `inputSize`, and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export function Input({ invalid = false, inputSize = 'md', fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, onBlur, label, required = false, validateOnBlur = false, id: passedId, ...rest }) {
    const [localStatus, setLocalStatus] = useState(saveStatus);
    const generatedId = useId();
    const id = passedId ?? generatedId;
    useEffect(() => {
        setLocalStatus(saveStatus);
    }, [saveStatus]);
    const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs);
    const { autoInvalid, markTouched, trackValue } = useRequiredValidation({
        required,
        validateOnBlur,
        value: rest.value,
        defaultValue: rest.defaultValue,
    });
    const handleChange = (e) => {
        if (localStatus === 'saved' || localStatus === 'error') {
            setLocalStatus('idle');
        }
        trackValue(e.target.value);
        onChange?.(e);
        scheduleDebounced(e.target.value);
    };
    const handleBlur = (e) => {
        if (localStatus === 'saved' || localStatus === 'error') {
            setLocalStatus('idle');
        }
        markTouched();
        onBlur?.(e);
    };
    const isInvalid = invalid || localStatus === 'error' || autoInvalid;
    const inputEl = (_jsxs("div", { className: cn('mrs-input-wrapper', fullWidth && 'mrs-input-wrapper--full'), children: [_jsx("input", { id: id, className: cn(inputVariants({ inputSize, invalid: isInvalid || undefined, fullWidth: fullWidth || undefined }), localStatus === 'saved' && 'mrs-input--saved-icon', localStatus === 'error' && 'mrs-input--error-icon', localStatus === 'saving' && 'mrs-input--saving', className), "aria-invalid": isInvalid || undefined, "aria-required": required || undefined, onChange: handleChange, onBlur: handleBlur, ...rest }), localStatus === 'saved' && (_jsx("span", { className: "mrs-input-icon-saved", children: _jsx(CheckIcon, {}) })), localStatus === 'error' && (_jsx("span", { className: "mrs-input-icon-error", children: _jsx(ErrorIcon, {}) }))] }));
    if (label != null) {
        return (_jsxs("div", { className: cn('mrs-field', fullWidth && 'mrs-field--full'), children: [_jsx(Label, { htmlFor: id, required: required, className: "mrs-field__label", children: label }), inputEl] }));
    }
    return inputEl;
}
