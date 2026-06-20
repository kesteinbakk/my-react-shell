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
}
/**
 * A complete form field: label + input + helper/error, wired for accessibility
 * (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads native input props, so
 * `type`, `value`, `onChange`, `placeholder`, etc. pass straight through.
 */
export declare function InputField({ label, description, error, containerClassName, className, ...inputProps }: InputFieldProps): import("react").JSX.Element;
