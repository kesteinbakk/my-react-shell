/**
 * `<PageTabs>` — route-level tab strip.
 *
 * Each tab points at a route; click navigates. Active state matches the router
 * pathname against `tab.route`. Visual shape mirrors the in-component tab bar
 * that `<PageSections>` renders for intra-page section tabs — same horizontal
 * row, so the rhythm is consistent whether tabs navigate or flip activeId.
 *
 * Mounted by parent layouts that have multiple sub-routes (e.g. a `sites` layout
 * rendering `<PageTabs>` then its child routes). To pin the strip into the
 * page-header band, register it via `usePageHeader({ tabs: () => <PageTabs … /> })`.
 *
 * No registration channel — the parent layout owns the tab list as a prop.
 *
 * Active match defaults to **prefix** — `/sites/all/whatever` highlights the tab
 * whose route is `/sites/all`. Pass `match='exact'` to require strict pathname
 * equality. `useShellContextOptional` for the variant; tolerates standalone use.
 */

import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ScrollableTabRow } from './ScrollableTabRow'
import { useShellContextOptional } from './shellContext'
import type { ShellTabsVariant, ShellIcon } from './shellContract'

export interface PageTab {
  /** Stable id (used as render key). */
  id: string
  /** Display label (literal string — the consumer pre-translates if needed). */
  label: string
  /** Optional icon key — resolved by the consumer-supplied `renderIcon`. */
  icon?: ShellIcon
  /** Route this tab points at. Click navigates here. */
  route: string
}

export interface PageTabsProps {
  tabs: PageTab[]
  /**
   * Active-state matching strategy.
   *   - `'exact'` — only when `pathname === tab.route`.
   *   - `'prefix'` (default) — when pathname matches `tab.route` OR
   *     `pathname.startsWith(tab.route + '/')`.
   */
  match?: 'exact' | 'prefix'
  /** Additional classes on the outer container. */
  className?: string
}

/**
 * Resolve which tab is active using longest-route-wins. Without this, a
 * prefix-mode tab whose route is `/x` would also match on `/x/anything`,
 * lighting up alongside whichever sub-route tab is the actual match. Same rule
 * AppMenu and the breadcrumb chain use to disambiguate sibling routes that
 * prefix-match each other.
 */
export function findActiveTabId(
  pathname: string,
  tabs: PageTab[],
  match: 'exact' | 'prefix',
): string | null {
  if (match === 'exact') {
    return tabs.find((t) => t.route === pathname)?.id ?? null
  }
  let bestId: string | null = null
  let bestLen = -1
  for (const tab of tabs) {
    const matches =
      tab.route === pathname || (tab.route !== '/' && pathname.startsWith(tab.route + '/'))
    if (!matches) continue
    if (tab.route.length > bestLen) {
      bestLen = tab.route.length
      bestId = tab.id
    }
  }
  return bestId
}

export function PageTabs(props: PageTabsProps): ReactNode {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const shell = useShellContextOptional()
  const match: 'exact' | 'prefix' = props.match ?? 'prefix'
  const variant: ShellTabsVariant = shell?.config.tabs?.variant ?? 'underline'
  const renderIcon = shell?.config.renderIcon
  const activeTabId = findActiveTabId(pathname, props.tabs, match)

  return (
    <ScrollableTabRow role="tablist" variant={variant} className={props.className}>
      {props.tabs.map((tab) => {
        const active = activeTabId === tab.id
        return (
          <div key={tab.id} className="mrs-tab" data-active={active}>
            <Link to={tab.route} role="tab" aria-selected={active} className="mrs-tab__link">
              {tab.icon && renderIcon?.(tab.icon, 16)}
              <span>{tab.label}</span>
            </Link>
          </div>
        )
      })}
    </ScrollableTabRow>
  )
}
