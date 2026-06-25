import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
const CheckIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '1.15em', height: '1.15em' }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const ErrorIcon = () => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '1.15em', height: '1.15em' }, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export function Textarea({ invalid = false, fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, onBlur, ...rest }) {
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
    const isInvalid = invalid || localStatus === 'error';
    return (_jsxs("div", { className: cn('mrs-textarea-wrapper', fullWidth && 'mrs-textarea-wrapper--full'), children: [_jsx("textarea", { className: cn('mrs-textarea', isInvalid && 'mrs-textarea--invalid', fullWidth && 'mrs-textarea--full', localStatus === 'saved' && 'mrs-textarea--saved-icon', localStatus === 'error' && 'mrs-textarea--error-icon', localStatus === 'saving' && 'mrs-textarea--saving', className), "aria-invalid": isInvalid || undefined, onChange: handleChange, onBlur: handleBlur, ...rest }), localStatus === 'saved' && (_jsx("span", { className: "mrs-textarea-icon-saved", children: _jsx(CheckIcon, {}) })), localStatus === 'error' && (_jsx("span", { className: "mrs-textarea-icon-error", children: _jsx(ErrorIcon, {}) }))] }));
}
