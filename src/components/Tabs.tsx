import type { ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from './cn'

export interface TabItem {
  /** Stable identifier for this tab. */
  value: string
  /** The trigger label. */
  label: ReactNode
  /** The panel revealed when this tab is active. */
  content: ReactNode
  /** Disable this tab's trigger. */
  disabled?: boolean
}

export interface TabsProps {
  /** The tabs, in display order. */
  tabs: TabItem[]
  /** Active tab value (controlled). */
  value?: string
  /** Initial active tab when uncontrolled. Defaults to the first tab. */
  defaultValue?: string
  /** Fired when the active tab changes. */
  onValueChange?: (value: string) => void
  /** Layout axis. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical'
  className?: string
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
export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className,
}: TabsProps) {
  const initial = defaultValue ?? (value === undefined ? tabs[0]?.value : undefined)
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={initial}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn('mrs-tabs', `mrs-tabs--${orientation}`, className)}
    >
      <RadixTabs.List className="mrs-tabs__list">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="mrs-tabs__trigger"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content key={tab.value} value={tab.value} className="mrs-tabs__content">
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
