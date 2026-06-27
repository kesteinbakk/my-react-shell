import { type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
export type SearchInputSize = 'sm' | 'md' | 'lg';
export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
    /** Custom icon on the left (overrides the magnifier glass). */
    icon?: ReactNode;
    /** Custom icon at the end (positioned on the right). */
    endIcon?: ReactNode;
    /** Callback fired debounced when the user types. */
    onDebounceSearch?: (value: string) => void;
    /** Debounce delay in ms (default: 500). */
    debounceMs?: number;
    /** Controlled value. */
    value?: string;
    /** Default initial value. */
    defaultValue?: string;
    /** Size variant — sm (1.75rem height), md (2.25rem height), or lg (2.75rem height). Defaults to md. */
    inputSize?: SearchInputSize;
    /** Custom change handler. */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /**
     * State configuration for a loaded indicator. Accepts true or an object.
     * If true (or enabled: true), fades in a green check mark.
     */
    loadedIconState?: boolean | {
        icon?: ReactNode;
        duration?: number;
        enabled?: boolean;
        transitionMs?: number;
    };
}
/**
 * An opinionated search input component with built-in debouncing, left magnifier glass icon,
 * end icon support, and a loaded icon state (fades in a green check mark).
 */
export declare const SearchInput: import("react").ForwardRefExoticComponent<SearchInputProps & import("react").RefAttributes<HTMLInputElement>>;
