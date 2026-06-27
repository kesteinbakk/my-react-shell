/**
 * Type definitions for `<PageSections>` and its mode renderers.
 *
 * Lives in its own file so `PageSections.tsx` and `modes.tsx` can both import
 * `PageSection` without a circular dependency. No `badge` field — the
 * notification surface is out of scope for this module.
 */

import type { ReactNode } from 'react'
import type { ShellIcon } from '../shellContract'

export interface PageSection {
  /** Unique identifier. */
  id: string
  /**
   * Display label. A thunk (`() => t('foo.bar')`) so resolution happens inside
   * the tracked render path and the label updates on locale change. The module
   * never imports i18n — the consumer wires `t()`.
   */
  label: () => string
  /** Optional icon key — resolved by the consumer-supplied `renderIcon`. */
  icon?: ShellIcon
  /**
   * Section content. A thunk — `() => <X />` — never eager JSX.
   *
   * The SSR hydration-walker rationale from the SolidJS source is moot here (no
   * SSR, no hydration walker). The lazy-mount half holds: `single` mode mounts
   * only the active section, and eager `children: <SectionThatCallsHooks/>` in
   * the caller's `sections` array would mount/run every section's component
   * eagerly regardless of active state (paying its effects/queries up front).
   * The thunk defers each section's element creation to the branch that
   * actually renders it.
   *
   * LOAD-BEARING: keep this `() => ReactNode`. Do NOT widen to
   * `ReactNode | (() => ReactNode)`.
   */
  children: () => ReactNode
  /**
   * Tooltip shown on hover over the tab trigger. Same thunk-only pattern as
   * `label` — pass a function so the text reacts to locale changes.
   */
  tooltip?: () => string
  /**
   * Section-level action thunks rendered right-aligned in the **list-mode**
   * header bar, mirroring the page-header band's `actions` slot. Each entry is a
   * `() => ReactNode` so it evaluates inside the rendered branch.
   *
   * Only rendered in `list` mode — `single` mode mounts section content with no
   * header bar, so it has no surface to host actions.
   */
  actions?: Array<() => ReactNode>
  /** Lazy load: mount children only when scrolled into view (list mode only). */
  lazy?: boolean
}

export type PageSectionsMode = 'list' | 'single'

export interface PageSectionsProps {
  /** Section definitions. */
  sections: PageSection[]
  /** Display mode. Default `'single'`. */
  mode?: PageSectionsMode
  /** Additional CSS classes for the container. */
  className?: string
  /** Callback when the active section changes. */
  onActiveChange?: (sectionId: string) => void
  /** Externally controlled active section. */
  activeId?: string
  /** URL query param key for persistence (e.g. `'tab'`). Omit to disable. */
  persistKey?: string
}
