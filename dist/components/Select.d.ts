import type { ReactNode } from 'react';
export interface SelectOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
export type SelectSize = 'sm' | 'md' | 'lg';
export interface SelectProps {
    options: SelectOption[];
    /** Selected value (controlled). */
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Accessible label for the trigger. */
    'aria-label'?: string;
    /** Trigger height / padding — matches the `Input` size scale. Defaults to `'md'`. */
    size?: SelectSize;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    className?: string;
    /** Visual save status. If 'saved', transitions the trigger border to success. */
    saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
}
/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export declare function Select({ options, value, onValueChange, placeholder, disabled, size, fullWidth, className, saveStatus, ...rest }: SelectProps): import("react").JSX.Element;
