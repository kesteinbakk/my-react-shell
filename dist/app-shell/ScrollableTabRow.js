import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useCallback, useEffect, useRef, useState } from 'react';
const SCROLL_BY_FRACTION = 0.8;
/**
 * Track whether a horizontally-scrollable element has hidden content on the
 * left and/or right. Re-evaluates on scroll, on size changes (container and
 * children, via ResizeObserver), and when the child set changes (tabs added /
 * removed, via MutationObserver — adding a tab grows `scrollWidth` without
 * resizing the container, so a ResizeObserver alone would miss it).
 */
export function useScrollOverflow(ref) {
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);
    const scrollByDir = useCallback((dir) => {
        const el = ref.current;
        if (!el)
            return;
        el.scrollBy({ left: dir * el.clientWidth * SCROLL_BY_FRACTION, behavior: 'smooth' });
    }, [ref]);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const update = () => {
            setCanLeft(el.scrollLeft > 0);
            // -1 absorbs sub-pixel rounding (Chrome occasionally reports
            // scrollLeft + clientWidth as scrollWidth - 0.5 at the end).
            setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        };
        update();
        el.addEventListener('scroll', update, { passive: true });
        // Observe the container and its children so content-size changes (lazy
        // mounts, label edits) re-evaluate the overflow state. Re-`observe`ing an
        // already-observed element is a no-op.
        const ro = new ResizeObserver(update);
        const observeAll = () => {
            ro.observe(el);
            for (const child of Array.from(el.children))
                ro.observe(child);
        };
        observeAll();
        // Catch tabs being added/removed — re-observe the new children, re-measure.
        const mo = new MutationObserver(() => {
            observeAll();
            update();
        });
        mo.observe(el, { childList: true });
        return () => {
            el.removeEventListener('scroll', update);
            ro.disconnect();
            mo.disconnect();
        };
    }, [ref]);
    return { canLeft, canRight, scrollByDir };
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
export function ScrollOverflowAffordance(props) {
    return (_jsxs(_Fragment, { children: [props.canLeft ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mrs-tab-fade mrs-tab-fade--left", "aria-hidden": "true" }), _jsx("button", { type: "button", "aria-label": props.scrollLeftLabel, tabIndex: -1, onClick: props.onScrollLeft, className: "mrs-tab-scroll-btn mrs-tab-scroll-btn--left", children: _jsx(Chevron, { dir: "left" }) })] })) : null, props.canRight ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mrs-tab-fade mrs-tab-fade--right", "aria-hidden": "true" }), _jsx("button", { type: "button", "aria-label": props.scrollRightLabel, tabIndex: -1, onClick: props.onScrollRight, className: "mrs-tab-scroll-btn mrs-tab-scroll-btn--right", children: _jsx(Chevron, { dir: "right" }) })] })) : null] }));
}
/**
 * Self-contained chevron glyph. The app-shell ships no icon dependency, and the
 * scroll arrows are shell chrome — they must render even standalone (no
 * `renderIcon`) and without the consumer registering a chevron key — so the SVG
 * is inlined here rather than routed through `config.renderIcon`.
 */
function Chevron({ dir }) {
    return (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6' }) }));
}
export function ScrollableTabRow(props) {
    const scrollRef = useRef(null);
    const overflow = useScrollOverflow(scrollRef);
    return (_jsxs("div", { className: "mrs-tab-scroller", children: [_jsx("div", { ref: scrollRef, role: props.role, "data-variant": props.variant, "data-baseline": props.showBaseline === false ? 'false' : undefined, className: `mrs-tab-row scrollbar-hidden${props.className ? ` ${props.className}` : ''}`, children: props.children }), _jsx(ScrollOverflowAffordance, { canLeft: overflow.canLeft, canRight: overflow.canRight, onScrollLeft: () => overflow.scrollByDir(-1), onScrollRight: () => overflow.scrollByDir(1), scrollLeftLabel: props.scrollLeftLabel, scrollRightLabel: props.scrollRightLabel })] }));
}
