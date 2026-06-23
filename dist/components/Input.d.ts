import type { InputHTMLAttributes } from 'react';
export type InputSize = 'sm' | 'md' | 'lg';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Error state — sets `aria-invalid` and the error styling. */
    invalid?: boolean;
    /**
     * Size — drives height + padding + font size. Defaults to `md`. Named `inputSize`
     * (not `size`) so it never clashes with the native `<input size>` attribute.
     */
    inputSize?: InputSize;
}
/**
 * Un-opinionated native `<input>` wrapper. All native input props (`type`, `value`,
 * `onChange`, `placeholder`, `disabled`, `aria-*`, …) pass straight through; the only
 * additions are `invalid` (error styling + `aria-invalid`) and `inputSize`.
 *
 * ```tsx
 * <Input placeholder="Email" />
 * <Input type="password" inputSize="lg" />
 * <Input invalid value={v} onChange={(e) => setV(e.target.value)} />
 * ```
 */
export declare function Input({ invalid, inputSize, className, ...rest }: InputProps): import("react").JSX.Element;
