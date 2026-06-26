import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cn } from './cn';
const check = (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) }));
const dash = (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M5 12h14" }) }));
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
export function Checkbox({ checked, defaultChecked, onCheckedChange, disabled, required, name, value, id, className, style, ...rest }) {
    return (_jsx(RadixCheckbox.Root, { checked: checked, defaultChecked: defaultChecked, onCheckedChange: onCheckedChange, disabled: disabled, required: required, name: name, value: value, id: id, "aria-label": rest['aria-label'], className: cn('mrs-checkbox', className), style: style, children: _jsxs(RadixCheckbox.Indicator, { className: "mrs-checkbox__indicator", children: [_jsx("span", { className: "mrs-checkbox__check", children: check }), _jsx("span", { className: "mrs-checkbox__dash", children: dash })] }) }));
}
