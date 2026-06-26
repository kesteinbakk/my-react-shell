import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixSwitch from '@radix-ui/react-switch';
import { useId } from 'react';
import { cn } from './cn';
import { Label } from './Label';
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
export function Switch({ checked, defaultChecked, onCheckedChange, disabled, name, value, id: passedId, className, style, fullWidth = false, label, labelPlacement = 'right', ...rest }) {
    const generatedId = useId();
    const id = passedId ?? generatedId;
    const switchEl = (_jsx(RadixSwitch.Root, { checked: checked, defaultChecked: defaultChecked, onCheckedChange: onCheckedChange, disabled: disabled, name: name, value: value, id: id, "aria-label": rest['aria-label'], className: cn('mrs-switch', className), style: label == null ? style : undefined, children: _jsx(RadixSwitch.Thumb, { className: "mrs-switch__thumb" }) }));
    if (label != null) {
        return (_jsxs("div", { className: cn('mrs-switch-wrapper', fullWidth && 'mrs-switch-wrapper--full'), style: style, children: [labelPlacement === 'left' && (_jsx(Label, { htmlFor: id, className: "text-sm font-medium", children: label })), switchEl, labelPlacement === 'right' && (_jsx(Label, { htmlFor: id, className: "text-sm font-medium", children: label }))] }));
    }
    return switchEl;
}
