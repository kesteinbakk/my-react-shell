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
}
/**
 * Un-opinionated native `<textarea>` wrapper. All native textarea props (`value`,
 * `onChange`, `rows`, `placeholder`, `disabled`, `aria-*`, …) pass straight through;
 * the only additions are `invalid` (error styling + `aria-invalid`) and
 * `onDebouncedChange` / `debounceMs` for stop-typing callbacks.
 */
export declare function Textarea({ invalid, fullWidth, className, onDebouncedChange, debounceMs, onChange, saveStatus, onBlur, label, id: passedId, ...rest }: TextareaProps): import("react").JSX.Element;
