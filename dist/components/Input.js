import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
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
export function Input({ invalid = false, inputSize = 'md', fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, ...rest }) {
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
    const isInvalid = invalid || localStatus === 'error';
    return (_jsx("input", { className: cn(inputVariants({ inputSize, invalid: isInvalid || undefined, fullWidth: fullWidth || undefined }), localStatus === 'saved' && 'mrs-input--saved', localStatus === 'saved-fading' && 'mrs-input--saved-fading', localStatus === 'saving' && 'mrs-input--saving', className), "aria-invalid": isInvalid || undefined, onChange: handleChange, ...rest }));
}
