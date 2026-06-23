import { jsx as _jsx } from "react/jsx-runtime";
import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from './cn';
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
export function Switch({ checked, defaultChecked, onCheckedChange, disabled, name, value, id, className, ...rest }) {
    return (_jsx(RadixSwitch.Root, { checked: checked, defaultChecked: defaultChecked, onCheckedChange: onCheckedChange, disabled: disabled, name: name, value: value, id: id, "aria-label": rest['aria-label'], className: cn('mrs-switch', className), children: _jsx(RadixSwitch.Thumb, { className: "mrs-switch__thumb" }) }));
}
