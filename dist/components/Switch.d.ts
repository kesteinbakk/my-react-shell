export interface SwitchProps {
    /** Checked state (controlled). */
    checked?: boolean;
    /** Initial checked state when uncontrolled. */
    defaultChecked?: boolean;
    /** Fired when the checked state changes. */
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    /** Form field name (for submission). */
    name?: string;
    /** Submitted value when checked. Defaults to `"on"`. */
    value?: string;
    id?: string;
    /** Accessible label — required when there's no associated `<label>`. */
    'aria-label'?: string;
    className?: string;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
}
/**
 * Un-opinionated toggle switch on Radix Switch — a track with a sliding thumb,
 * keyboard- and form-aware. The checked track fills with `--color-primary`; the
 * thumb slides off the `[data-state=checked]` attribute. Controlled via
 * `checked` / `onCheckedChange` or uncontrolled via `defaultChecked`.
 *
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Notifications" />
 * ```
 */
export declare function Switch({ checked, defaultChecked, onCheckedChange, disabled, name, value, id, className, fullWidth, ...rest }: SwitchProps): import("react").JSX.Element;
