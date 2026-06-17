/**
 * Scrollspy + click-to-scroll for `<PageSections>` (list mode).
 *
 * Single mode does not scroll-spy (only the active section is mounted), so
 * neither helper is invoked there.
 *
 * ## Why these are split out
 *
 * The scroll-machinery is dense, race-prone, and almost entirely independent
 * of the rest of the component:
 *   - `setupScrollspy` listens on the scroll container and updates the active
 *     section as the user scrolls (suppressed during programmatic scroll).
 *   - `scrollToSection` performs click-to-scroll. The trick: lazy sections
 *     above the target are short placeholders. Without forcing them to mount
 *     before measuring, scroll-target offset is computed against placeholder
 *     positions; sections then mount during the smooth scroll, push the target
 *     past its computed offset, and the scroll lands short.
 *
 * Both functions take plain references and primitive callbacks — no framework
 * reactivity inside. This module is pure DOM glue: no React, no router imports.
 * Reactivity lives in `<PageSections>`. The two-rAF wait in `scrollToSection`
 * still applies in React — it covers the React commit/flush plus browser layout
 * after lazy sections force-mount.
 */

const ACTIVE_THRESHOLD_PX = -30
const PROGRAMMATIC_SCROLL_GUARD_MS = 800

export interface ScrollspyHooks {
  /** Returns the current active section id (read inside the scroll listener). */
  getActiveId: () => string
  /**
   * Set the active section id. The consumer-facing `onActiveChange` callback is
   * driven off this state in `<PageSections>`, so scrollspy only sets the id.
   */
  setActiveId: (id: string) => void
  /** Returns true while a programmatic scroll is in progress (suppresses spy). */
  isProgrammatic: () => boolean
  /**
   * Height of the sticky tab strip pinned at the top of the scroll container,
   * in px. The "active" reference line is the strip's bottom edge, so a section
   * counts as active once its top reaches just under the pinned tabs (not the
   * very top of the container). Defaults to 0 when omitted.
   */
  getTopOffset?: () => number
}

/**
 * Attach a scroll listener to `container` that updates the active section based
 * on which section's top edge is closest to the container's top.
 *
 * Returns a cleanup function. Caller must invoke it on unmount.
 */
export function setupScrollspy(
  container: HTMLElement,
  sectionRefs: Map<string, HTMLElement>,
  hooks: ScrollspyHooks,
): () => void {
  const onScroll = () => {
    if (hooks.isProgrammatic()) return

    // Reference line = the bottom edge of the pinned tab strip. Sections are
    // measured against it so the one sitting just under the tabs is "active".
    const refTop = container.getBoundingClientRect().top + (hooks.getTopOffset?.() ?? 0)
    let closestId: string | null = null
    let closestDistance = Infinity

    for (const [id, sectionEl] of sectionRefs) {
      const distance = refTop - sectionEl.getBoundingClientRect().top
      if (distance >= ACTIVE_THRESHOLD_PX && distance < closestDistance) {
        closestDistance = distance
        closestId = id
      }
    }

    if (closestId && closestId !== hooks.getActiveId()) {
      hooks.setActiveId(closestId)
    }
  }

  container.addEventListener('scroll', onScroll, { passive: true })
  return () => container.removeEventListener('scroll', onScroll)
}

export interface ScrollToOptions {
  /** Element to scroll to (must be inside `container` when one is given). */
  el: HTMLElement
  /**
   * The element that actually scrolls — normally `<AppShell>`'s body cell
   * (`shell.scrollContainer`). When omitted (standalone, no shell) we fall back
   * to `el.scrollIntoView()`, which walks up to whatever scrolls.
   */
  container?: HTMLElement
  /**
   * Height of the sticky tab strip to leave above the target so the section
   * lands just below the pinned tabs rather than under them. Only applied on the
   * `container` path; the `scrollIntoView` fallback relies on the section's
   * `scroll-margin-top` instead.
   */
  offsetTop?: number
  /** Set true on the next frame; clear after the smooth scroll has settled. */
  setProgrammatic: (next: boolean) => void
  /**
   * Two-rAF wait toggle. On the FIRST scroll-to-section call we force lazy
   * sections to mount, then need to wait two animation frames before measuring
   * (React flush + browser layout). On subsequent calls everything is already
   * mounted — measure immediately.
   */
  waitForLayout: boolean
  /**
   * Scroll behavior. Defaults to `'smooth'` (tab clicks). The initial deep-link
   * scroll on mount passes `'instant'` so a refresh / shared link lands directly
   * on the section instead of animating down from the top.
   */
  behavior?: ScrollBehavior
}

/**
 * Scroll `el` so it lands just below the pinned tab strip (smooth by default;
 * pass `behavior: 'instant'` for the on-mount deep-link jump). `container` is
 * the element that actually scrolls — `<AppShell>`'s body cell — and `offsetTop`
 * is the sticky tab strip's height, subtracted so the section sits under the
 * tabs rather than behind them. Without a `container` (standalone) we use
 * `scrollIntoView`, which relies on the section's `scroll-margin-top` instead.
 *
 * `waitForLayout` defers the call by two rAFs (React flush + browser layout) so
 * freshly-mounted lazy sections have laid out before we measure their position.
 *
 * The `programmatic` flag is set for ~800ms so the scrollspy listener doesn't
 * fight the smooth scroll.
 */
export function scrollToSection(opts: ScrollToOptions): void {
  const { el, container, offsetTop, setProgrammatic, waitForLayout, behavior } = opts
  setProgrammatic(true)

  const performScroll = () => {
    if (container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const scrollOffset =
        elRect.top - containerRect.top + container.scrollTop - (offsetTop ?? 0)
      container.scrollTo({ top: Math.max(0, scrollOffset), behavior: behavior ?? 'smooth' })
    } else {
      // No known scroll container (standalone use). Let the browser find the
      // nearest scrollable ancestor; the section's scroll-margin-top covers the
      // sticky tab strip.
      el.scrollIntoView({ block: 'start', behavior: behavior ?? 'smooth' })
    }
    setTimeout(() => {
      setProgrammatic(false)
    }, PROGRAMMATIC_SCROLL_GUARD_MS)
  }

  if (waitForLayout) {
    requestAnimationFrame(() => requestAnimationFrame(performScroll))
  } else {
    performScroll()
  }
}
