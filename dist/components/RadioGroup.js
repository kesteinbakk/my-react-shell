import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { cn } from './cn';
/**
 * Un-opinionated radio group on Radix RadioGroup — a single-select set with roving
 * arrow-key focus, keyboard- and form-aware. Data-driven via `options`; each row is
 * an item (the dot fills with `--color-primary` when selected) and its label.
 * Controlled via `value` / `onValueChange` or uncontrolled via `defaultValue`.
 *
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: 'card', label: 'Card' },
 *     { value: 'cash', label: 'Cash' },
 *   ]}
 *   value={method}
 *   onValueChange={setMethod}
 * />
 * ```
 */
export function RadioGroup({ options, value, defaultValue, onValueChange, name, disabled, orientation = 'vertical', className, style, }) {
    return (_jsx(RadixRadioGroup.Root, { value: value, defaultValue: defaultValue, onValueChange: onValueChange, name: name, disabled: disabled, orientation: orientation, className: cn('mrs-radio-group', `mrs-radio-group--${orientation}`, className), style: style, children: options.map((opt) => {
            const itemId = name ? `${name}-${opt.value}` : undefined;
            return (_jsxs("label", { className: "mrs-radio-group__row", children: [_jsx(RadixRadioGroup.Item, { value: opt.value, disabled: opt.disabled, id: itemId, className: "mrs-radio", children: _jsx(RadixRadioGroup.Indicator, { className: "mrs-radio__dot" }) }), _jsx("span", { className: "mrs-radio-group__label", children: opt.label })] }, opt.value));
        }) }));
}
