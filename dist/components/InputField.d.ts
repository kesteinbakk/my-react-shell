import { type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import type { InputSize } from './Input';
export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
    /** Field label, associated to the input. */
    label?: ReactNode;
    /** Helper text under the input (hidden while an error shows). */
    description?: ReactNode;
    /** Error message — sets the error styling and `aria-invalid`. */
    error?: ReactNode;
    /** Class for the wrapping field; `className` styles the input itself. */
    containerClassName?: string;
    /**
     * Size — drives height + padding + font size. Defaults to `md`.
     * Matches the `Input` height/padding scale.
     */
    inputSize?: InputSize;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    /** Fires `debounceMs` after the user stops typing, with the current value. */
    onDebouncedChange?: (value: string) => void;
    /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
    debounceMs?: number;
    /** Visual save status. If 'saved', transitions the border to success color. */
    saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
    /** Custom onChange handler. Crucial for typing tracking. */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
/**
 * Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`).
 * Spreads native input props; pass `error` to switch on error styling.
 */
export declare function InputField({ label, description, error, containerClassName, inputSize, fullWidth, className, onDebouncedChange, debounceMs, onChange, saveStatus, onBlur, ...inputProps }: InputFieldProps): import("react").JSX.Element;
