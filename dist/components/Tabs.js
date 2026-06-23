import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from './cn';
/**
 * General content tabs on Radix Tabs — a list of triggers over swappable panels,
 * with roving arrow-key focus and `aria` wiring. Data-driven via `tabs`; the active
 * trigger is marked with a `--color-primary` indicator. Controlled via `value` /
 * `onValueChange` or uncontrolled via `defaultValue` (defaults to the first tab).
 * Distinct from the app-shell's page tabs.
 *
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { value: 'details', label: 'Details', content: <Details /> },
 *     { value: 'activity', label: 'Activity', content: <Activity /> },
 *   ]}
 * />
 * ```
 */
export function Tabs({ tabs, value, defaultValue, onValueChange, orientation = 'horizontal', className, }) {
    const initial = defaultValue ?? (value === undefined ? tabs[0]?.value : undefined);
    return (_jsxs(RadixTabs.Root, { value: value, defaultValue: initial, onValueChange: onValueChange, orientation: orientation, className: cn('mrs-tabs', `mrs-tabs--${orientation}`, className), children: [_jsx(RadixTabs.List, { className: "mrs-tabs__list", children: tabs.map((tab) => (_jsx(RadixTabs.Trigger, { value: tab.value, disabled: tab.disabled, className: "mrs-tabs__trigger", children: tab.label }, tab.value))) }), tabs.map((tab) => (_jsx(RadixTabs.Content, { value: tab.value, className: "mrs-tabs__content", children: tab.content }, tab.value)))] }));
}
