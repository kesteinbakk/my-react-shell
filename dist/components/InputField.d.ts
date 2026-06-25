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
     * Size — drives the input height + padding + font size. Defaults to `md`. Named `inputSize`
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
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export declare function InputField({ label, description, error, containerClassName, inputSize, fullWidth, className, onDebouncedChange, debounceMs, onChange, saveStatus, ...inputProps }: InputFieldProps): import("react").JSX.Element;
