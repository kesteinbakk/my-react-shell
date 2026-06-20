import type { ReactNode } from 'react';
export interface SelectOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
export interface SelectProps {
    options: SelectOption[];
    /** Selected value (controlled). */
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Accessible label for the trigger. */
    'aria-label'?: string;
    className?: string;
}
/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export declare function Select({ options, value, onValueChange, placeholder, disabled, className, ...rest }: SelectProps): import("react").JSX.Element;
