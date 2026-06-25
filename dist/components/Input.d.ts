import { type ChangeEvent, type InputHTMLAttributes } from 'react';
export type InputSize = 'sm' | 'md' | 'lg';
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    /** Error state — sets `aria-invalid` and the error styling. */
    invalid?: boolean;
    /**
     * Size — drives height + padding + font size. Defaults to `md`. Named `inputSize`
     * (not `size`) so it never clashes with the native `<input size>` attribute.
     */
    inputSize?: InputSize;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    /** Fires `debounceMs` after the user stops typing, with the current value. */
    onDebouncedChange?: (value: string) => void;
    /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
    debounceMs?: number;
    /** Visual save status. If 'saved', transitions the border to success color. */
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    /** Custom onChange handler. Crucial for typing tracking. */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
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
export declare function Input({ invalid, inputSize, fullWidth, className, onDebouncedChange, debounceMs, onChange, saveStatus, ...rest }: InputProps): import("react").JSX.Element;
