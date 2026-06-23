import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixSelect from '@radix-ui/react-select';
import { cn } from './cn';
const chevron = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
const check = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) }));
/**
 * Opinionated select on Radix Select (keyboard nav, typeahead, portal, collision
 * handling), styled on the theme tokens. Pass an `options` list; controlled via
 * `value` / `onValueChange`.
 */
export function Select({ options, value, onValueChange, placeholder = 'Select…', disabled, size = 'md', className, ...rest }) {
    return (_jsxs(RadixSelect.Root, { value: value, onValueChange: onValueChange, disabled: disabled, children: [_jsxs(RadixSelect.Trigger, { className: cn('mrs-select__trigger', `mrs-select__trigger--${size}`, className), "aria-label": rest['aria-label'], children: [_jsx(RadixSelect.Value, { placeholder: placeholder }), _jsx(RadixSelect.Icon, { className: "mrs-select__chevron", children: chevron })] }), _jsx(RadixSelect.Portal, { children: _jsx(RadixSelect.Content, { className: "mrs-select__content", position: "popper", sideOffset: 4, children: _jsx(RadixSelect.Viewport, { className: "mrs-select__viewport", children: options.map((opt) => (_jsxs(RadixSelect.Item, { value: opt.value, disabled: opt.disabled, className: "mrs-select__item", children: [_jsx("span", { className: "mrs-select__indicator", children: _jsx(RadixSelect.ItemIndicator, { children: check }) }), _jsx(RadixSelect.ItemText, { children: opt.label })] }, opt.value))) }) }) })] }));
}
