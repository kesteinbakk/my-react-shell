import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import { cn } from './cn';
import { TONE_COLOR } from './tone';
/**
 * Single-select segmented control — a row of mutually-exclusive options on a track,
 * the active one lifted onto a surface chip. Controlled via `value` / `onChange`.
 */
export function SegmentedControl({ options, value, onChange, size = 'md', fullWidth = false, className, style, ...rest }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": rest['aria-label'], className: cn('mrs-segmented', `mrs-segmented--${size}`, fullWidth && 'mrs-segmented--full', className), style: style, children: options.map((opt) => {
            const active = opt.value === value;
            const trailing = opt.iconPosition === 'trailing';
            const iconNode = opt.icon ? (_jsx("span", { className: "mrs-segmented__icon", children: opt.icon })) : null;
            return (_jsxs("button", { type: "button", role: "radio", "aria-checked": active, disabled: opt.disabled, className: cn('mrs-segmented__item', active && 'mrs-segmented__item--active'), 
                // Inline colour wins over the base/hover/active state rules, so a toned
                // option keeps its semantic colour in every state.
                style: opt.tone ? { color: TONE_COLOR[opt.tone] } : undefined, onClick: () => onChange(opt.value), children: [!trailing && iconNode, _jsx("span", { className: "mrs-segmented__label", children: opt.label }), trailing && iconNode] }, opt.value));
        }) }));
}
