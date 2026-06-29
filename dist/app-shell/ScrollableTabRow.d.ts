/**
 * `<ScrollableTabRow>` — horizontal-scroll container for tab strips.
 *
 * A faithful React port of the SolidJS foundation component. Wraps any
 * horizontal row of items (tabs, chips, …) and provides:
 *   - A scroll container with `overflow-x: auto` and a hidden scrollbar.
 *   - Edge-fade gradients on the side(s) that have hidden content.
 *   - Arrow buttons on the side(s) that have hidden content. Click scrolls
 *     by ~80% of the visible width, `behavior: 'smooth'`.
 *
 * Edge fades and arrows appear only when scrollable in that direction.
 *
 * **Why this exists.** Tab strips with hidden scrollbars look clean but give
 * mouse users no affordance — a vertical mouse wheel doesn't translate to
 * horizontal scroll, and there's no draggable scrollbar. Arrows + fade restore
 * discoverability without re-introducing a chrome scrollbar.
 *
 * **Sizing contract (load-bearing).** The inner scroll container carries
 * `min-width: 0` (`.mrs-tab-row`) so its default `min-width: auto` doesn't
 * propagate the children's intrinsic width up the layout — without it the row
 * grows to fit every tab and overflows the page instead of scrolling inside its
 * own box. The outer wrapper is `shrink-0` so it won't vertically compress in a
 * flex column (e.g. the PageSections strip slot).
 *
 * **Composition.** For consumers that own their own scroll element, use the
 * lower-level pieces: `useScrollOverflow(ref)` returns the reactive
 * `canLeft` / `canRight` + a `scrollByDir` callback; render
 * `<ScrollOverflowAffordance>` as a sibling of the scroll element (its parent
 * must be `position: relative`) to surface the fade + arrows.
 * `<ScrollableTabRow>` is the convenience composition of the two.
 */
import type { AriaRole, ReactNode, RefObject } from 'react';
import type { ShellTabsVariant } from './shellContract';
export interface ScrollOverflowState {
    canLeft: boolean;
    canRight: boolean;
    scrollByDir: (dir: -1 | 1) => void;
}
/**
 * Track whether a horizontally-scrollable element has hidden content on the
 * left and/or right. Re-evaluates on scroll, on size changes (container and
 * children, via ResizeObserver), and when the child set changes (tabs added /
 * removed, via MutationObserver — adding a tab grows `scrollWidth` without
 * resizing the container, so a ResizeObserver alone would miss it).
 */
export declare function useScrollOverflow(ref: RefObject<HTMLElement | null>): ScrollOverflowState;
export interface ScrollOverflowAffordanceProps {
    canLeft: boolean;
    canRight: boolean;
    onScrollLeft: () => void;
    onScrollRight: () => void;
    /** Accessible name for the left arrow. No default — absent → the chevron stands alone. */
    scrollLeftLabel?: string;
    /** Accessible name for the right arrow. No default — absent → the chevron stands alone. */
    scrollRightLabel?: string;
}
/**
 * Renders the fade gradient + arrow button on each side that has hidden
 * content. Designed to be a SIBLING of the scroll container — the shared
 * parent must be `position: relative` (the `.mrs-tab-scroller` wrapper is).
 *
 * The arrows are `tabIndex={-1}`: they're a mouse affordance, not a tab stop.
 * Keyboard users move between tabs directly and the focused tab scrolls into
 * view via the browser's default focus handling.
 */
export declare function ScrollOverflowAffordance(props: ScrollOverflowAffordanceProps): ReactNode;
export interface ScrollableTabRowProps {
    /** Items to render inside the scroll container. */
    children: ReactNode;
    /** ARIA role for the inner scroll container (e.g. `'tablist'`). */
    role?: AriaRole;
    /** Tab visual variant — set as `data-variant` on the scroll container. */
    variant?: ShellTabsVariant;
    /** Additional classes on the inner scroll container. */
    className?: string;
    /** Accessible name for the left scroll arrow. No default — absent → the chevron stands alone. */
    scrollLeftLabel?: string;
    /** Accessible name for the right scroll arrow. No default — absent → the chevron stands alone. */
    scrollRightLabel?: string;
}
export declare function ScrollableTabRow(props: ScrollableTabRowProps): ReactNode;
