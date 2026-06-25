import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 *
 * ```tsx
 * <Textarea rows={4} placeholder="Notes…" />
 * <Textarea invalid value={v} onChange={(e) => setV(e.target.value)} />
 * <Textarea onDebouncedChange={(v) => save(v)} debounceMs={800} />
 * ```
 */
export function Textarea({ invalid = false, fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, saveStatus, ...rest }) {
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
    return (_jsx("textarea", { className: cn('mrs-textarea', isInvalid && 'mrs-textarea--invalid', fullWidth && 'mrs-textarea--full', localStatus === 'saved' && 'mrs-textarea--saved', localStatus === 'saved-fading' && 'mrs-textarea--saved-fading', localStatus === 'saving' && 'mrs-textarea--saving', className), "aria-invalid": isInvalid || undefined, onChange: handleChange, ...rest }));
}
