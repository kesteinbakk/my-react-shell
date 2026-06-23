export interface CheckboxProps {
    /** Checked state (controlled) — `true`, `false`, or `'indeterminate'`. */
    checked?: boolean | 'indeterminate';
    /** Initial checked state when uncontrolled. */
    defaultChecked?: boolean | 'indeterminate';
    /** Fired when the checked state changes. */
    onCheckedChange?: (checked: boolean | 'indeterminate') => void;
    disabled?: boolean;
    required?: boolean;
    /** Form field name (for submission). */
    name?: string;
    /** Submitted value when checked. Defaults to `"on"`. */
    value?: string;
    id?: string;
    /** Accessible label — required when there's no associated `<label>`. */
    'aria-label'?: string;
    className?: string;
}
/**
 * Un-opinionated checkbox on Radix Checkbox — keyboard- and form-aware, with a
 * tri-state (`checked` · unchecked · `'indeterminate'`) value. The check / dash
 * glyph is hand-rolled (stroke = `currentColor`); the checked box fills with
 * `--color-primary`. Controlled via `checked` / `onCheckedChange` or uncontrolled
 * via `defaultChecked`.
 *
 * ```tsx
 * <Checkbox checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} aria-label="Agree" />
 * ```
 */
export declare function Checkbox({ checked, defaultChecked, onCheckedChange, disabled, required, name, value, id, className, ...rest }: CheckboxProps): import("react").JSX.Element;
