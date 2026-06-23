import { jsx as _jsx } from "react/jsx-runtime";
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from './cn';
/**
 * Un-opinionated set of toggle buttons on Radix ToggleGroup — a data-driven row of
 * `options`, each a pressable {@link Toggle}-styled item. `type="single"` is one-of-a-set
 * (value is the chosen string, or `undefined`); `type="multiple"` is independent toggles
 * (value is an array). `variant` / `size` apply to every item. Controlled via `value` /
 * `onValueChange`, or uncontrolled via `defaultValue`.
 *
 * ```tsx
 * <ToggleGroup
 *   aria-label="Text alignment"
 *   value={align}
 *   onValueChange={setAlign}
 *   options={[
 *     { value: 'left', label: <AlignLeft />, 'aria-label': 'Left' },
 *     { value: 'center', label: <AlignCenter />, 'aria-label': 'Center' },
 *     { value: 'right', label: <AlignRight />, 'aria-label': 'Right' },
 *   ]}
 * />
 * ```
 */
export function ToggleGroup(props) {
    const { options, variant = 'ghost', size = 'md', disabled, className, } = props;
    const items = options.map((opt) => (_jsx(RadixToggleGroup.Item, { value: opt.value, disabled: opt.disabled, "aria-label": opt['aria-label'], className: cn('mrs-toggle', `mrs-toggle--${variant}`, `mrs-toggle--${size}`), children: opt.label }, opt.value)));
    const common = {
        disabled,
        'aria-label': props['aria-label'],
        className: cn('mrs-toggle-group', className),
    };
    // Radix types `single` and `multiple` as distinct root shapes; branch so each
    // gets its correctly-typed `value` / `onValueChange`.
    if (props.type === 'multiple') {
        return (_jsx(RadixToggleGroup.Root, { type: "multiple", value: props.value, defaultValue: props.defaultValue, onValueChange: props.onValueChange, ...common, children: items }));
    }
    return (_jsx(RadixToggleGroup.Root, { type: "single", value: props.value, defaultValue: props.defaultValue, onValueChange: props.onValueChange, ...common, children: items }));
}
