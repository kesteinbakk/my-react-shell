import { type ChangeEvent, type TextareaHTMLAttributes, type ReactNode } from 'react';
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    /** Error state — sets `aria-invalid` and the error styling. */
    invalid?: boolean;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    /** Fires `debounceMs` after the user stops typing, with the current value. */
    onDebouncedChange?: (value: string) => void;
    /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
    debounceMs?: number;
    /** Visual save status. If 'saved', transitions the border to success color. */
    saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
    /** Custom onChange handler. Crucial for typing tracking. */
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    /** Optional label. If provided, renders a small label above the textarea. */
    label?: ReactNode;
    /**
     * Marks the field as mandatory: renders the red asterisk on the built-in `label`
     * and sets `aria-required`. Shell-managed — the native `required` attribute is
     * **not** set, so the browser's native validation bubble never appears.
     */
    required?: boolean;
    /**
     * Shell-owned validation: once the user blurs an empty `required` field, the invalid
     * (red-border) state shows and clears the moment a value is typed. **Enabled by
     * default when `required` is set** — pass `false` to opt out (asterisk only). OR-ed
     * with the controlled `invalid`, which always takes precedence.
     */
    validateOnBlur?: boolean;
}
/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export declare function Textarea({ invalid, fullWidth, className, onDebouncedChange, debounceMs, onChange, saveStatus, onBlur, label, required, validateOnBlur, id: passedId, ...rest }: TextareaProps): import("react").JSX.Element;
