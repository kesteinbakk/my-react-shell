import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
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
export function Textarea({ invalid = false, fullWidth = false, className, onDebouncedChange, debounceMs = 500, onChange, ...rest }) {
    const scheduleDebounced = useDebounce(onDebouncedChange, debounceMs);
    const handleChange = onChange || onDebouncedChange
        ? (e) => {
            onChange?.(e);
            scheduleDebounced(e.target.value);
        }
        : undefined;
    return (_jsx("textarea", { className: cn('mrs-textarea', invalid && 'mrs-textarea--invalid', fullWidth && 'mrs-textarea--full', className), "aria-invalid": invalid || undefined, onChange: handleChange, ...rest }));
}
