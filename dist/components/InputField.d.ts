import { type InputHTMLAttributes, type ReactNode } from 'react';
export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    /** Field label, associated to the input. */
    label?: ReactNode;
    /** Helper text under the input (hidden while an error shows). */
    description?: ReactNode;
    /** Error message — sets the error styling and `aria-invalid`. */
    error?: ReactNode;
    /** Class for the wrapping field; `className` styles the input itself. */
    containerClassName?: string;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    /** Fires `debounceMs` after the user stops typing, with the current value. */
    onDebouncedChange?: (value: string) => void;
    /** Debounce delay in ms for `onDebouncedChange` (default: 500). */
    debounceMs?: number;
}
/**
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export declare function InputField({ label, description, error, containerClassName, fullWidth, className, onDebouncedChange, debounceMs, onChange, ...inputProps }: InputFieldProps): import("react").JSX.Element;
