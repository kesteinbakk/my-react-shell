import type { ReactNode } from 'react';
export interface TabItem {
    /** Stable identifier for this tab. */
    value: string;
    /** The trigger label. */
    label: ReactNode;
    /** The panel revealed when this tab is active. */
    content: ReactNode;
    /** Disable this tab's trigger. */
    disabled?: boolean;
}
export interface TabsProps {
    /** The tabs, in display order. */
    tabs: TabItem[];
    /** Active tab value (controlled). */
    value?: string;
    /** Initial active tab when uncontrolled. Defaults to the first tab. */
    defaultValue?: string;
    /** Fired when the active tab changes. */
    onValueChange?: (value: string) => void;
    /** Layout axis. Defaults to `horizontal`. */
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}
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
export declare function Tabs({ tabs, value, defaultValue, onValueChange, orientation, className, }: TabsProps): import("react").JSX.Element;
