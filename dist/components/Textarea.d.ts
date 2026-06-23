import type { TextareaHTMLAttributes } from 'react';
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Error state — sets `aria-invalid` and the error styling. */
    invalid?: boolean;
}
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
export declare function Textarea({ invalid, className, ...rest }: TextareaProps): import("react").JSX.Element;
