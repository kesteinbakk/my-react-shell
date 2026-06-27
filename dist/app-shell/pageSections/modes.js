import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useRef, useState } from 'react';
import { ScrollableTabRow } from '../ScrollableTabRow';
import { useShellContextOptional } from '../shellContext';
import { PageSection } from '../PageSection';
export function LazyContent(props) {
    if (!props.lazy)
        return props.children;
    return _jsx(LazyContentInner, { ...props });
}
function LazyContentInner(props) {
    const [visible, setVisible] = useState(false);
    // Inside an <AppShell> the IO root is the body cell, whose ref can resolve
    // AFTER this mounts. Observing against a premature `root: null` would extend
    // `rootMargin` over the viewport and mount every lazy section at once. So when
    // a shell is present we wait (reactively, via the effect's scrollRoot dep) for
    // it to resolve; standalone (no shell) legitimately observes the viewport.
    const shell = useShellContextOptional();
    // Presence of a shell is stable for the component's lifetime. Key the effect
    // on this boolean rather than the whole context value, whose identity changes
    // on every unrelated context update — which would needlessly tear down and
    // re-create the observer.
    const hasShell = shell !== null;
    const ref = useRef(null);
    useEffect(() => {
        if (visible || !ref.current)
            return;
        const root = props.scrollRoot ?? null;
        if (hasShell && !root)
            return; // body cell not resolved yet — wait for it (effect re-runs on scrollRoot)
        const node = ref.current;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                obs.disconnect();
            }
        }, { root, rootMargin: '200px 0px' });
        obs.observe(node);
        return () => obs.disconnect();
    }, [visible, hasShell, props.scrollRoot]);
    return (_jsx("div", { ref: ref, children: visible || props.forceMountAll ? props.children : _jsx("div", { className: "mrs-section__placeholder" }) }));
}
export function SectionsListMode(props) {
    return (_jsx(_Fragment, { children: props.sections.map((section) => (_jsx("div", { ref: (el) => props.registerRef(section.id, el), "data-section-id": section.id, 
            // `margin-right` (via .mrs-section): the card's rounded right edge
            // would otherwise butt against the scroll container's vertical
            // scrollbar — the gap keeps the rounded corner clear of the track.
            className: "mrs-section", children: _jsx(PageSection, { title: section.label(), icon: section.icon, actions: section.actions?.map((thunk) => thunk()), children: _jsx(LazyContent, { lazy: section.lazy, forceMountAll: props.forceMountAll, scrollRoot: props.scrollRoot, children: section.children() }) }) }, section.id))) }));
}
export function SectionsSingleMode(props) {
    return (_jsx(_Fragment, { children: props.sections.map((section) => section.id === props.activeId ? _jsx("div", { children: section.children() }, section.id) : null) }));
}
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
export function SectionTabsStrip(props) {
    const shell = useShellContextOptional();
    const variant = shell?.config.tabs?.variant ?? 'underline';
    const renderIcon = shell?.config.renderIcon;
    return (_jsx(ScrollableTabRow, { role: "tablist", variant: variant, className: props.className, children: props.sections.map((section) => {
            const active = section.id === props.activeId;
            return (_jsx("div", { className: "mrs-tab", "data-active": active, children: _jsxs("button", { type: "button", role: "tab", "aria-selected": active, title: section.tooltip?.(), onClick: () => props.onTabClick(section.id), className: "mrs-tab__button", children: [section.icon && renderIcon?.(section.icon, 16), _jsx("span", { children: section.label() })] }) }, section.id));
        }) }));
}
