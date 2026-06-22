import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { SegmentedControl } from './SegmentedControl';
import { cn } from './cn';
/**
 * The built-in theme accent vocabulary — the swatch set offered by the Theme tab
 * unless the consumer passes its own `swatches`. Each name resolves to the shared
 * `--color-accent-<name>` token (shipped by `my-react-shell/styles.css`), so a
 * swatch stays theme-adaptive: the same picked value tracks light/dark and palette.
 */
export const ACCENT_SWATCHES = [
    'indigo',
    'violet',
    'purple',
    'pink',
    'rose',
    'orange',
    'amber',
    'emerald',
    'teal',
    'sky',
];
const caretGlyph = (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
const swatchVar = (name) => `var(--color-accent-${name})`;
/** The swatch name whose `var(...)` equals `value`, or `null` when `value` is custom/absent. */
function matchSwatch(value, swatches) {
    if (!value)
        return null;
    const normalized = value.replace(/\s+/g, '');
    for (const name of swatches) {
        if (normalized === swatchVar(name).replace(/\s+/g, ''))
            return name;
    }
    return null;
}
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/**
 * Resolve any CSS color (`var(...)`, named, `oklch`, `hsl`, `rgb`, or a hex) to a
 * `#rrggbb` hex, so the full-range picker can be seeded from the current value.
 * A hidden probe resolves the cascade (so `var(--color-accent-*)` becomes concrete),
 * then a canvas normalizes the concrete color to hex. SPA-only (no SSR), so `document`
 * is always present; falls back when resolution isn't possible.
 */
function resolveToHex(input, fallback) {
    const raw = (input ?? '').trim();
    if (!raw)
        return fallback;
    if (typeof document === 'undefined')
        return fallback;
    // 1) Resolve var()/named/relative colors to a concrete computed color.
    let concrete = raw;
    if (raw.includes('var(') || !/^(#|rgb)/i.test(raw)) {
        const probe = document.createElement('span');
        probe.style.color = raw;
        probe.style.position = 'absolute';
        probe.style.opacity = '0';
        probe.style.pointerEvents = 'none';
        document.body.appendChild(probe);
        concrete = getComputedStyle(probe).color || raw;
        probe.remove();
    }
    // 2) Normalize the concrete color to #rrggbb via a canvas.
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx)
        return fallback;
    ctx.fillStyle = fallback;
    try {
        ctx.fillStyle = concrete;
    }
    catch {
        return fallback;
    }
    const out = ctx.fillStyle;
    return /^#[0-9a-f]{6}$/i.test(out) ? out.toLowerCase() : fallback;
}
/**
 * <ColorPicker> — a compact, controlled color picker with two modes behind a popover
 * trigger: **Theme** (pick a theme accent swatch — semantic, theme-adaptive) and
 * **Custom** (a full hue/saturation range + hex input, via `react-colorful`).
 *
 * Controlled via `value` / `onChange`; `value` is always a directly-usable CSS color
 * string (`var(--color-accent-<name>)` for a swatch, `#rrggbb` for custom). Persists
 * nothing itself. The full-range tab uses the `react-colorful` optional peer — install
 * it when you use this component (swatch styling and the popover stay shell-owned).
 */
export function ColorPicker({ value, onChange, swatches = ACCENT_SWATCHES, allowCustom = true, label, description, align = 'start', placeholder = 'Pick a color', disabled, swatchesLabel = 'Theme', customLabel = 'Custom', className, ...rest }) {
    const showSwatches = swatches.length > 0;
    const showCustom = allowCustom;
    const showToggle = showSwatches && showCustom;
    const activeSwatch = matchSwatch(value, swatches);
    const ariaLabel = rest['aria-label'] ?? (typeof label === 'string' ? label : undefined);
    const seedFallback = () => resolveToHex(showSwatches ? swatchVar(swatches[0]) : undefined, '#888888');
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(showSwatches ? 'swatch' : 'custom');
    const [customHex, setCustomHex] = useState(() => resolveToHex(value, seedFallback()));
    const handleOpenChange = (next) => {
        if (next) {
            // Re-derive the active tab + the full-range seed each time it opens, so both
            // reflect the latest value and theme.
            const startCustom = showCustom && (!showSwatches || (!activeSwatch && value != null));
            setMode(startCustom ? 'custom' : showSwatches ? 'swatch' : 'custom');
            setCustomHex(resolveToHex(value, seedFallback()));
        }
        setOpen(next);
    };
    const pickSwatch = (name) => onChange(swatchVar(name));
    const pickCustom = (hex) => {
        setCustomHex(hex);
        onChange(hex);
    };
    const triggerText = activeSwatch ? capitalize(activeSwatch) : (value ?? placeholder);
    return (_jsxs("div", { className: cn('mrs-color-picker', className), children: [label != null && _jsx("span", { className: "mrs-color-picker__label", children: label }), description != null && _jsx("p", { className: "mrs-color-picker__desc", children: description }), _jsxs(Popover.Root, { open: open, onOpenChange: handleOpenChange, children: [_jsx(Popover.Trigger, { asChild: true, children: _jsxs("button", { type: "button", className: "mrs-color-picker__trigger", disabled: disabled, "aria-label": ariaLabel, children: [_jsx("span", { className: "mrs-color-picker__preview", "data-empty": value == null || value === '', style: value ? { background: value } : undefined, "aria-hidden": "true" }), _jsx("span", { className: "mrs-color-picker__value", "data-placeholder": value == null, children: triggerText }), _jsx("span", { className: "mrs-color-picker__caret", children: caretGlyph })] }) }), _jsx(Popover.Portal, { children: _jsxs(Popover.Content, { className: "mrs-color-picker__panel", sideOffset: 6, align: align, children: [showToggle && (_jsx(SegmentedControl, { size: "sm", "aria-label": "Color mode", value: mode, onChange: setMode, className: "mrs-color-picker__tabs", options: [
                                        { value: 'swatch', label: swatchesLabel },
                                        { value: 'custom', label: customLabel },
                                    ] })), mode === 'swatch' && showSwatches && (_jsx("div", { className: "mrs-color-picker__swatches", role: "radiogroup", "aria-label": typeof swatchesLabel === 'string' ? swatchesLabel : 'Theme colors', children: swatches.map((name) => {
                                        const selected = activeSwatch === name;
                                        return (_jsx("button", { type: "button", role: "radio", "aria-checked": selected, "aria-label": name, title: name, className: cn('mrs-color-picker__chip', selected && 'mrs-color-picker__chip--selected'), style: { background: swatchVar(name) }, onClick: () => pickSwatch(name) }, name));
                                    }) })), mode === 'custom' && showCustom && (_jsxs("div", { className: "mrs-color-picker__custom", children: [_jsx(HexColorPicker, { color: customHex, onChange: pickCustom }), _jsxs("label", { className: "mrs-color-picker__hex", children: [_jsx("span", { className: "mrs-color-picker__hex-hash", "aria-hidden": "true", children: "#" }), _jsx(HexColorInput, { color: customHex, onChange: pickCustom, className: "mrs-color-picker__hex-input", "aria-label": "Hex color" })] })] }))] }) })] })] }));
}
