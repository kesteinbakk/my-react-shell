import { type ReactNode, type CSSProperties } from 'react';
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
    /** Placeholder text when nothing is selected — **required**; pass a translated string. */
    placeholder: string;
    disabled?: boolean;
    /** Accessible label for the trigger. */
    'aria-label'?: string;
    /** Trigger height / padding — matches the `Input` size scale. Defaults to `'md'`. */
    size?: SelectSize;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    className?: string;
    style?: CSSProperties;
    /** Visual save status. If 'saved', transitions the trigger border to success. */
    saveStatus?: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
    /** Optional label. If provided, renders a small label above the select trigger. */
    label?: ReactNode;
    /**
     * Marks the field as mandatory: renders the red asterisk on the built-in `label`
     * and sets `aria-required` on the trigger. Shell-managed — no native constraint,
     * so the browser's native validation bubble never appears.
     */
    required?: boolean;
    /**
     * Shell-owned validation: once the user blurs the trigger with no value selected, the
     * invalid (red-border) state shows and clears on selection. **Enabled by default when
     * `required` is set** — pass `false` to opt out (asterisk only). OR-ed with
     * `saveStatus === 'error'`, which always takes precedence.
     */
    validateOnBlur?: boolean;
    id?: string;
}
/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export declare function Select({ options, value, onValueChange, placeholder, disabled, size, fullWidth, className, style, saveStatus, label, required, validateOnBlur, id: passedId, ...rest }: SelectProps): import("react").JSX.Element;
