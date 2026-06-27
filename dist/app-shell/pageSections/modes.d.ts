/**
 * Render components for the two `<PageSections>` modes.
 *
 * Each mode is a small read-only renderer — all reactive state stays in
 * `<PageSections>` and is passed in as values / refs / callbacks.
 *
 * - `<SectionsListMode>`   — every section mounted with a header bar.
 *                            Click-to-scroll + scrollspy live in PageSections.
 * - `<SectionsSingleMode>` — only the section with the active id is rendered
 *                            (single-mount, like classic tabs).
 * - `<SectionTabsStrip>`   — the tab buttons (both modes), wrapped in the
 *                            scrollable `mrs-tab-row`.
 *
 * `LazyContent` is the lazy-mount wrapper used by list mode. Lazy sections
 * render a placeholder until either:
 *   1. they scroll into view (IntersectionObserver), or
 *   2. `forceMountAll` is true (PageSections sets this on tab click so the
 *      target's pre-scroll offset is correct — see scrollspy.ts).
 *
 * **IO root contract (load-bearing).** The IntersectionObserver root MUST be
 * the element that actually scrolls — `<AppShell>`'s body cell
 * (`shell.scrollContainer`), threaded in via `scrollRoot`. With `root: null`
 * (viewport), `rootMargin: '200px 0px'` extends the wrong reference frame:
 * placeholders inside the scrolling body cell can appear "intersecting" the
 * viewport regardless of scroll position, so every lazy section mounts
 * immediately on first paint. So when a shell is present we wait (reactively)
 * for `scrollRoot()` to resolve before creating the observer; `root: null` is
 * only the standalone fallback.
 */
import type { ReactNode } from 'react';
import type { PageSection as PageSectionConfig } from './types';
interface LazyContentProps {
    lazy?: boolean;
    forceMountAll: boolean;
    /**
     * Scroll container (`<AppShell>`'s body cell) — used as the
     * IntersectionObserver `root`. See module docstring for why this is
     * load-bearing. May be undefined while the body-cell ref is still resolving;
     * `LazyContent` waits for it when a shell is present, and falls back to the
     * viewport (`root: null`) standalone (no shell).
     */
    scrollRoot?: HTMLElement;
    children: ReactNode;
}
export declare function LazyContent(props: LazyContentProps): ReactNode;
interface ListModeProps {
    sections: PageSectionConfig[];
    registerRef: (id: string, el: HTMLElement | null) => void;
    forceMountAll: boolean;
    /** Scroll container — threaded through to LazyContent as IO root. */
    scrollRoot?: HTMLElement;
    renderIcon?: (key: string, size: number) => ReactNode;
}
interface SingleModeProps {
    sections: PageSectionConfig[];
    activeId: string;
}
interface SectionTabsStripProps {
    sections: PageSectionConfig[];
    activeId: string;
    onTabClick: (id: string) => void;
    className?: string;
}
export declare function SectionsListMode(props: ListModeProps): ReactNode;
export declare function SectionsSingleMode(props: SingleModeProps): ReactNode;
/**
 * Section tab strip — rendered above content for both modes.
 *
 * Visual mirrors `<PageTabs>` (route-level) so the tab rhythm is consistent
 * whether a tab navigates or flips activeId. Click behavior is owned by
 * PageSections's `handleTabClick`:
 *   - single → flip activeId, replace mounted section
 *   - list   → flip activeId + scroll to that section
 *
 * Wraps in `<ScrollableTabRow>` so the strip scrolls horizontally with edge
 * fades + arrow affordances when it overflows. `useShellContextOptional` for
 * the variant + icon renderer; tolerates standalone use.
 */
export declare function SectionTabsStrip(props: SectionTabsStripProps): ReactNode;
export {};
