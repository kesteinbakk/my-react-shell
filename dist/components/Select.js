import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { cn } from './cn';
import { useRequiredValidation } from './useRequiredValidation';
import { Label } from './Label';
const chevron = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
const check = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) }));
/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export function Select({ options, value, onValueChange, placeholder, disabled, size = 'md', fullWidth = false, className, style, saveStatus, label, required = false, validateOnBlur = false, id: passedId, ...rest }) {
    const generatedId = useId();
    const id = passedId ?? generatedId;
    const { autoInvalid, markTouched } = useRequiredValidation({ required, validateOnBlur, value });
    const isError = saveStatus === 'error' || autoInvalid;
    const selectEl = (_jsxs(RadixSelect.Root, { value: value, onValueChange: onValueChange, disabled: disabled, children: [_jsxs(RadixSelect.Trigger, { id: id, className: cn('mrs-select__trigger', `mrs-select__trigger--${size}`, fullWidth && 'mrs-select__trigger--full', saveStatus === 'saved' && 'mrs-select__trigger--saved', isError && 'mrs-select__trigger--error', className), style: style, "aria-invalid": isError || undefined, "aria-required": required || undefined, "aria-label": rest['aria-label'], onBlur: markTouched, children: [_jsx(RadixSelect.Value, { placeholder: placeholder }), _jsx(RadixSelect.Icon, { className: "mrs-select__chevron", children: chevron })] }), _jsx(RadixSelect.Portal, { children: _jsx(RadixSelect.Content, { className: "mrs-select__content", position: "popper", sideOffset: 4, children: _jsx(RadixSelect.Viewport, { className: "mrs-select__viewport", children: options.map((opt) => (_jsxs(RadixSelect.Item, { value: opt.value, disabled: opt.disabled, className: "mrs-select__item", children: [_jsx("span", { className: "mrs-select__indicator", children: _jsx(RadixSelect.ItemIndicator, { children: check }) }), _jsx(RadixSelect.ItemText, { children: opt.label })] }, opt.value))) }) }) })] }));
    if (label != null) {
        return (_jsxs("div", { className: cn('mrs-field', fullWidth && 'mrs-field--full'), children: [_jsx(Label, { htmlFor: id, required: required, className: "mrs-field__label", children: label }), selectEl] }));
    }
    return selectEl;
}
