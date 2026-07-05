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
import type { ReactNode } from 'react';
import type { ShellIcon } from './shellContract';
import { type Tone } from '../components/tone';
export interface PageTab {
    /** Stable id (used as render key). */
    id: string;
    /** Display label (literal string — the consumer pre-translates if needed). */
    label: string;
    /** Optional icon key — resolved by the consumer-supplied `renderIcon`. */
    icon?: ShellIcon;
    /** Route this tab points at. Click navigates here. */
    route: string;
    /**
     * Semantic tone — colours this tab's label + icon across active/inactive
     * states (an icon using `currentColor` inherits it). Omitted → default
     * neutral chrome (secondary → primary on active/hover), same as
     * `SegmentedOption.tone`.
     */
    tone?: Tone;
}
export interface PageTabsProps {
    tabs: PageTab[];
    /**
     * Active-state matching strategy.
     *   - `'exact'` — only when `pathname === tab.route`.
     *   - `'prefix'` (default) — when pathname matches `tab.route` OR
     *     `pathname.startsWith(tab.route + '/')`.
     */
    match?: 'exact' | 'prefix';
    /** Additional classes on the outer container. */
    className?: string;
    /**
     * Whether the `underline` variant draws its full-width baseline. Default
     * `false` — see `ScrollableTabRowProps.showBaseline`.
     */
    showBaseline?: boolean;
}
/**
 * Resolve which tab is active using longest-route-wins. Without this, a
 * prefix-mode tab whose route is `/x` would also match on `/x/anything`,
 * lighting up alongside whichever sub-route tab is the actual match. Same rule
 * AppMenu and the breadcrumb chain use to disambiguate sibling routes that
 * prefix-match each other.
 */
export declare function findActiveTabId(pathname: string, tabs: PageTab[], match: 'exact' | 'prefix'): string | null;
export declare function PageTabs(props: PageTabsProps): ReactNode;
