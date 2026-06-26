import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import {} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { HexColorPicker, HexColorInput, RgbStringColorPicker, HslStringColorPicker, } from 'react-colorful';
import { cn } from './cn';
/** Neutral starting point for the free picker when no `value` is provided yet. */
const DEFAULT_SEED = {
    hex: '#808080',
    rgb: 'rgb(128, 128, 128)',
    hsl: 'hsl(0, 0%, 50%)',
};
const caretGlyph = (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
function FreePicker({ format, color, onChange, }) {
    switch (format) {
        case 'rgb':
            return _jsx(RgbStringColorPicker, { color: color, onChange: onChange });
        case 'hsl':
            return _jsx(HslStringColorPicker, { color: color, onChange: onChange });
        default:
            return _jsx(HexColorPicker, { color: color, onChange: onChange });
    }
}
/**
 * <ColorPicker> — a general, controlled color picker behind a compact popover trigger.
 *
 * - **Free** (default): a full hue/saturation range (via `react-colorful`, an optional
 *   peer). `onChange` emits a CSS color string in `format` (`hex` · `rgb` · `hsl`).
 * - **Constrained**: pass a `colors` set and the picker is limited to that set, shown as
 *   a swatch grid; `onChange` emits the picked entry verbatim.
 *
 * Controlled via `value` / `onChange`; persists nothing. `value` is always a
 * directly-usable CSS color string — drop it into a `style`/`background`.
 */
export function ColorPicker({ value, onChange, colors, format = 'hex', label, description, align = 'start', placeholder, disabled, size = 'md', fullWidth = false, className, style, ...rest }) {
    const [open, setOpen] = useState(false);
    const constrained = colors != null && colors.length > 0;
    const ariaLabel = rest['aria-label'] ?? (typeof label === 'string' ? label : undefined);
    const isEmpty = value == null || value === '';
    const triggerText = isEmpty ? placeholder : value;
    // react-colorful needs a concrete color at all times; seed from the value, else neutral.
    const current = value && value !== '' ? value : DEFAULT_SEED[format];
    return (_jsxs("div", { className: cn('mrs-color-picker', fullWidth && 'mrs-color-picker--full', className), style: style, children: [label != null && _jsx("span", { className: "mrs-color-picker__label", children: label }), description != null && _jsx("p", { className: "mrs-color-picker__desc", children: description }), _jsxs(Popover.Root, { open: open, onOpenChange: setOpen, children: [_jsx(Popover.Trigger, { asChild: true, children: _jsxs("button", { type: "button", className: cn('mrs-color-picker__trigger', size !== 'md' && `mrs-color-picker__trigger--${size}`), disabled: disabled, "aria-label": ariaLabel, children: [_jsx("span", { className: "mrs-color-picker__preview", "data-empty": isEmpty, style: isEmpty ? undefined : { background: value }, "aria-hidden": "true" }), _jsx("span", { className: "mrs-color-picker__value", "data-placeholder": isEmpty, children: triggerText }), _jsx("span", { className: "mrs-color-picker__caret", children: caretGlyph })] }) }), _jsx(Popover.Portal, { children: _jsx(Popover.Content, { className: "mrs-color-picker__panel", sideOffset: 6, align: align, children: constrained ? (_jsx("div", { className: "mrs-color-picker__swatches", role: "radiogroup", "aria-label": ariaLabel ?? 'Colors', children: colors.map((color, i) => {
                                    const selected = !isEmpty && value.trim() === color.trim();
                                    return (_jsx("button", { type: "button", role: "radio", "aria-checked": selected, "aria-label": color, title: color, className: cn('mrs-color-picker__chip', selected && 'mrs-color-picker__chip--selected'), style: { background: color }, onClick: () => onChange(color) }, `${i}-${color}`));
                                }) })) : (_jsxs("div", { className: "mrs-color-picker__custom", children: [_jsx(FreePicker, { format: format, color: current, onChange: onChange }), format === 'hex' ? (_jsxs("label", { className: "mrs-color-picker__hex", children: [_jsx("span", { className: "mrs-color-picker__hex-hash", "aria-hidden": "true", children: "#" }), _jsx(HexColorInput, { color: current, onChange: onChange, className: "mrs-color-picker__hex-input", "aria-label": "Hex color" })] })) : (_jsx("code", { className: "mrs-color-picker__readout", children: current }))] })) }) })] })] }));
}
