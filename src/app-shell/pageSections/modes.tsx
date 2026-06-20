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

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ScrollableTabRow } from '../ScrollableTabRow'
import { useShellContextOptional } from '../shellContext'
import type { ShellTabsVariant } from '../shellContract'
import type { PageSection } from './types'

// ----------------------------------------------------------------------------
// LazyContent — render placeholder until in-view OR forceMountAll fires
// ----------------------------------------------------------------------------

interface LazyContentProps {
  lazy?: boolean
  forceMountAll: boolean
  /**
   * Scroll container (`<AppShell>`'s body cell) — used as the
   * IntersectionObserver `root`. See module docstring for why this is
   * load-bearing. May be undefined while the body-cell ref is still resolving;
   * `LazyContent` waits for it when a shell is present, and falls back to the
   * viewport (`root: null`) standalone (no shell).
   */
  scrollRoot?: HTMLElement
  children: ReactNode
}

export function LazyContent(props: LazyContentProps): ReactNode {
  if (!props.lazy) return props.children
  return <LazyContentInner {...props} />
}

function LazyContentInner(props: LazyContentProps): ReactNode {
  const [visible, setVisible] = useState(false)
  // Inside an <AppShell> the IO root is the body cell, whose ref can resolve
  // AFTER this mounts. Observing against a premature `root: null` would extend
  // `rootMargin` over the viewport and mount every lazy section at once. So when
  // a shell is present we wait (reactively, via the effect's scrollRoot dep) for
  // it to resolve; standalone (no shell) legitimately observes the viewport.
  const shell = useShellContextOptional()
  // Presence of a shell is stable for the component's lifetime. Key the effect
  // on this boolean rather than the whole context value, whose identity changes
  // on every unrelated context update — which would needlessly tear down and
  // re-create the observer.
  const hasShell = shell !== null
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (visible || !ref.current) return
    const root = props.scrollRoot ?? null
    if (hasShell && !root) return // body cell not resolved yet — wait for it (effect re-runs on scrollRoot)
    const node = ref.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { root, rootMargin: '200px 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [visible, hasShell, props.scrollRoot])

  return (
    <div ref={ref}>
      {visible || props.forceMountAll ? props.children : <div className="mrs-section__placeholder" />}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Mode renderers
// ----------------------------------------------------------------------------

interface ListModeProps {
  sections: PageSection[]
  registerRef: (id: string, el: HTMLElement | null) => void
  forceMountAll: boolean
  /** Scroll container — threaded through to LazyContent as IO root. */
  scrollRoot?: HTMLElement
  renderIcon?: (key: string, size: number) => ReactNode
}

interface SingleModeProps {
  sections: PageSection[]
  activeId: string
}

interface SectionTabsStripProps {
  sections: PageSection[]
  activeId: string
  onTabClick: (id: string) => void
  className?: string
}

export function SectionsListMode(props: ListModeProps): ReactNode {
  return (
    <>
      {props.sections.map((section) => (
        <div
          key={section.id}
          ref={(el) => props.registerRef(section.id, el)}
          data-section-id={section.id}
          // `margin-right` (via .mrs-section): the card's rounded right edge
          // would otherwise butt against the scroll container's vertical
          // scrollbar — the gap keeps the rounded corner clear of the track.
          className="mrs-section"
        >
          <div className="mrs-section__card">
            <div className="mrs-section__head">
              {section.icon && props.renderIcon?.(section.icon, 18)}
              <h3 className="mrs-section__title">{section.label()}</h3>
              {(section.actions?.length ?? 0) > 0 && (
                <div className="mrs-section__actions">
                  {section.actions!.map((thunk, i) => (
                    // eslint-disable-next-line react/no-array-index-key -- action thunks have no stable id
                    <span key={i}>{thunk()}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="mrs-section__body">
              <LazyContent
                lazy={section.lazy}
                forceMountAll={props.forceMountAll}
                scrollRoot={props.scrollRoot}
              >
                {section.children()}
              </LazyContent>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function SectionsSingleMode(props: SingleModeProps): ReactNode {
  return (
    <>
      {props.sections.map((section) =>
        section.id === props.activeId ? <div key={section.id}>{section.children()}</div> : null,
      )}
    </>
  )
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
export function SectionTabsStrip(props: SectionTabsStripProps): ReactNode {
  const shell = useShellContextOptional()
  const variant: ShellTabsVariant = shell?.config.tabs?.variant ?? 'underline'
  const renderIcon = shell?.config.renderIcon

  return (
    <ScrollableTabRow role="tablist" variant={variant} className={props.className}>
      {props.sections.map((section) => {
        const active = section.id === props.activeId
        return (
          <div key={section.id} className="mrs-tab" data-active={active}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              title={section.tooltip?.()}
              onClick={() => props.onTabClick(section.id)}
              className="mrs-tab__button"
            >
              {section.icon && renderIcon?.(section.icon, 16)}
              <span>{section.label()}</span>
            </button>
          </div>
        )
      })}
    </ScrollableTabRow>
  )
}
