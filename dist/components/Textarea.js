import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only addition is `invalid` (error styling + `aria-invalid`).
 *
 * ```tsx
 * <Textarea rows={4} placeholder="Notes…" />
 * <Textarea invalid value={v} onChange={(e) => setV(e.target.value)} />
 * ```
 */
export function Textarea({ invalid = false, className, ...rest }) {
    return (_jsx("textarea", { className: cn('mrs-textarea', invalid && 'mrs-textarea--invalid', className), "aria-invalid": invalid || undefined, ...rest }));
}
