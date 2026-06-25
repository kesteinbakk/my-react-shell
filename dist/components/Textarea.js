import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
const CheckIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '1.15em', height: '1.15em' }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
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
        if (localStatus === 'saved') {
            setLocalStatus('idle');
        }
        onChange?.(e);
        scheduleDebounced(e.target.value);
    };
    const handleBlur = (e) => {
        if (localStatus === 'saved') {
            setLocalStatus('idle');
        }
        onBlur?.(e);
    };
    const isInvalid = invalid || localStatus === 'error';
    const textareaEl = (_jsx("textarea", { className: cn('mrs-textarea', isInvalid && 'mrs-textarea--invalid', fullWidth && 'mrs-textarea--full', localStatus === 'saved' && 'mrs-textarea--saved-icon', localStatus === 'saving' && 'mrs-textarea--saving', className), "aria-invalid": isInvalid || undefined, onChange: handleChange, onBlur: handleBlur, ...rest }));
    if (localStatus === 'saved') {
        return (_jsxs("div", { className: cn('mrs-textarea-wrapper', fullWidth && 'mrs-textarea-wrapper--full'), children: [textareaEl, _jsx("span", { className: "mrs-textarea-icon-saved", children: _jsx(CheckIcon, {}) })] }));
    }
    return textareaEl;
}
