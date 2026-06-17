/**
 * PageSections — page-level tabbed content, rendered inside the scrolling body
 * of `<AppShell>` (below the pinned `<ShellPageHeader>` chrome).
 *
 * Two display modes (`mode` prop, default `'single'`):
 *   - `single` — only the active section is mounted (traditional tabs).
 *   - `list`   — all sections mounted with headers; click-to-scroll + scroll-spy.
 *
 * **Tab strip.** Rendered inline as a `position: sticky` strip at the top of
 * PageSections (`.mrs-sections__strip`), so the tabs stay pinned while the page
 * scrolls beneath them.
 *
 * **URL persistence (`persistKey` prop).** When set (e.g. `'tab'`), the active
 * section id round-trips to `?<persistKey>=<id>`. Read on mount + reactively
 * after mount (so same-path deep-links update the tab). Write-back uses TanStack
 * `navigate({ …, replace: true })` — never raw `history.replaceState`. TanStack
 * `search` is an OBJECT: read it via `useRouterState({ select: s => s.location.search })`
 * and write it by merging (`search: prev => ({ ...prev, [key]: value })`), never
 * via `window.location.search`. During an in-flight transition the committed
 * `window.location` can lag the router's location, so the router state is the
 * sole source of truth in both directions.
 *
 * **Return-from-descendant memory (single mode only).** When the user leaves a
 * tab page via a sub-route and comes back via breadcrumb, the last-active
 * section is restored from a module-scoped `Map<pathname, sectionId>`.
 *
 * **Scroll container, scrollspy + click-to-scroll (list mode).** The element
 * that scrolls is `<AppShell>`'s body cell (`shell.scrollContainer`), NOT an
 * inner container — PageSections isn't reliably height-bounded, so an inner
 * `overflow` would never engage. The container is resolved REACTIVELY (its ref
 * can arrive after PageSections mounts), via an effect keyed on
 * `shell?.scrollContainer`. Reading it once on mount would skip scrollspy + the
 * deep-link scroll forever.
 *
 * **Section children must be thunks** (`() => ReactNode`); see
 * `PageSection.children`.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useShellContextOptional } from './shellContext'
import { SectionsListMode, SectionsSingleMode, SectionTabsStrip } from './pageSections/modes'
import { scrollToSection, setupScrollspy } from './pageSections/scrollspy'
import type { PageSectionsMode, PageSectionsProps } from './pageSections/types'

// Public re-exports — keep the barrel's import surface on this file.
export type { PageSection, PageSectionsMode, PageSectionsProps } from './pageSections/types'

// Track the previous pathname so single mode can detect a return from a
// descendant route and restore the tab the user had open. Lives at module scope
// so the value survives PageSections unmount/remount.
let previousPath = ''
function getPreviousPath(): string {
  return previousPath
}
function setPreviousPath(p: string): void {
  previousPath = p
}

// Per-pathname last-active section id, so that when a user re-enters a page
// coming from one of its descendant routes we can restore the tab they had open.
// Lives at module scope so the state survives component unmount/remount across
// the brief sub-page detour.
const lastSingleByPath = new Map<string, string>()

function isReturnFromDescendant(currentPath: string): boolean {
  const prev = getPreviousPath()
  return prev !== '' && prev.startsWith(currentPath + '/')
}

type SearchRecord = Record<string, unknown>

/**
 * Read `?<key>=` from the router's `search` object.
 *
 * Always pass the router's `search` (TanStack reactive state) — NOT
 * `window.location.search`. During in-flight route transitions the committed
 * window location can briefly reflect the previous URL, so a stale window read
 * would bleed the previous route's tab into a freshly-mounted PageSections.
 */
function getTabFromSearch(key: string, search: SearchRecord): string | null {
  const value = search[key]
  return typeof value === 'string' ? value : null
}

export function PageSections(props: PageSectionsProps): ReactNode {
  const mode: PageSectionsMode = props.mode ?? 'single'
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.search as SearchRecord })
  // PageSections normally lives inside <AppShell>, which exposes the scroll
  // container needed by list-mode scrollspy. Optional context tolerates
  // stand-alone use (no scrollspy in that case).
  const shell = useShellContextOptional()
  const scrollContainer = shell?.scrollContainer ?? undefined

  // Track section DOM elements for scrollspy.
  const sectionRefs = useRef(new Map<string, HTMLElement>())
  // The sticky tab strip — its height is the offset the deep-link/click scroll
  // leaves above the target section, and the scrollspy reference line.
  const stripRef = useRef<HTMLDivElement | null>(null)
  const programmaticScroll = useRef(false)

  // Force-mount-all flag: when a tab is clicked we need every lazy section to
  // mount, otherwise placeholders above the target grow during the smooth
  // scroll and the target gets pushed past the computed offset. Once flipped on
  // we leave it on — sections above the active one are already mounted from
  // being scrolled past.
  const [forceMountAll, setForceMountAll] = useState(false)
  const forceMountAllRef = useRef(false)

  // Resolve initial active:
  //   external prop > URL param > (single mode + return-from-descendant) > first
  const initialId = (): string => {
    if (props.activeId !== undefined) return props.activeId
    if (props.persistKey) {
      const fromUrl = getTabFromSearch(props.persistKey, search)
      if (fromUrl && props.sections.some((s) => s.id === fromUrl)) return fromUrl
    }
    if (mode === 'single' && isReturnFromDescendant(pathname)) {
      const remembered = lastSingleByPath.get(pathname)
      if (remembered && props.sections.some((s) => s.id === remembered)) {
        return remembered
      }
    }
    return props.sections[0]?.id ?? ''
  }

  const [activeId, setActiveIdState] = useState(initialId)
  // Mirror activeId into a ref so the URL→state effect can read the current
  // value WITHOUT depending on it (the load-bearing untrack — see below).
  const activeIdRef = useRef(activeId)
  const setActiveId = (id: string): void => {
    activeIdRef.current = id
    setActiveIdState(id)
  }

  // setTabInUrl — merge into the router's search object and replace-navigate.
  // Source of truth is the router (NOT window.location). Early-return if the
  // value already matches (saves a redundant replace during URL→state echoes).
  const setTabInUrl = (key: string, value: string): void => {
    if (getTabFromSearch(key, search) === value) return
    navigate({
      to: pathname,
      search: (prev: SearchRecord) => ({ ...prev, [key]: value }),
      replace: true,
    })
  }

  // Sync external activeId.
  useEffect(() => {
    if (props.activeId !== undefined) {
      setActiveId(props.activeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror controlled prop only
  }, [props.activeId])

  // Notify the consumer whenever the active section changes. EVERY path that
  // mutates the active section flows through this one callback (resolved initial
  // value, tab clicks, scrollspy, external URL changes, controlled prop) so a
  // future mutation path can't forget to report the change.
  useEffect(() => {
    props.onActiveChange?.(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire on every activeId change
  }, [activeId])

  // URL → state: react to `?<persistKey>=` changes after mount (same-path deep
  // links the router doesn't remount for, e.g. a notification dropdown
  // navigating to `?<persistKey>=<id>` while already on this page).
  //
  // The load-bearing untrack: `activeId` is NOT in the deps (so the effect runs
  // on URL changes only, not on our own tab clicks), and the equality check
  // reads the current value via `activeIdRef`. Without it, the effect would
  // re-run on user clicks and snap the tab back to the URL value just navigated
  // away from.
  useEffect(() => {
    if (!props.persistKey) return
    if (props.activeId !== undefined) return
    const fromUrl = getTabFromSearch(props.persistKey, search)
    if (!fromUrl) return
    if (!props.sections.some((s) => s.id === fromUrl)) return
    if (fromUrl === activeIdRef.current) return
    setActiveId(fromUrl)
    // Same-path deep link: the route doesn't remount, so the on-mount scroll
    // never runs. Scroll the newly-active section into view here. Smooth — this
    // is an in-session navigation, not a fresh load.
    if (mode !== 'single') scrollActiveIntoView(fromUrl, 'smooth')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- untrack activeId; keyed on search
  }, [search, props.persistKey, props.activeId, props.sections])

  // State → URL: edge-triggered, skips the initial activeId value. Writing on
  // mount can cancel an in-flight cross-page navigation — when the user clicks a
  // sidebar link from /risk → /trust, TanStack begins rendering /trust's tree
  // before the location commits; a replace-navigate at that moment would land
  // the user on /risk?tab=<first-section> instead of /trust. Skipping the first
  // write keeps the URL mutated only in response to settled tab clicks /
  // external URL changes.
  const prevActiveForUrl = useRef<string | undefined>(undefined)
  useEffect(() => {
    const current = activeId
    if (
      props.persistKey &&
      prevActiveForUrl.current !== undefined &&
      prevActiveForUrl.current !== current
    ) {
      setTabInUrl(props.persistKey, current)
    }
    prevActiveForUrl.current = current
    // Remember last-active section per path so return-from-descendant restores it.
    if (mode === 'single' && current) {
      lastSingleByPath.set(pathname, current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- edge-triggered on activeId
  }, [activeId])

  // previousPath tracking: store the prior pathname (module scope) so single-mode
  // return-from-descendant detection survives the brief unmount/remount of the
  // outer page when navigating away and back via a sub-route.
  const prevPathRef = useRef(pathname)
  useEffect(() => {
    const prev = prevPathRef.current
    if (pathname !== prev) {
      setPreviousPath(prev)
      prevPathRef.current = pathname
    }
  }, [pathname])

  // Scroll the section with `id` so it lands just below the pinned tab strip
  // (list mode only). Used by tab clicks (smooth), the on-mount deep-link jump
  // (instant), and same-path URL navigations (smooth). Forces every lazy section
  // to mount BEFORE measuring (see scrollspy.ts).
  function scrollActiveIntoView(id: string, behavior: ScrollBehavior): void {
    const el = sectionRefs.current.get(id)
    if (!el) return

    const wasForced = forceMountAllRef.current
    if (!wasForced) {
      forceMountAllRef.current = true
      setForceMountAll(true)
    }

    scrollToSection({
      el,
      container: scrollContainer,
      offsetTop: stripRef.current?.offsetHeight ?? 0,
      setProgrammatic: (next) => {
        programmaticScroll.current = next
      },
      waitForLayout: !wasForced,
      behavior,
    })
  }

  // Resolve scroll container & scrollspy. REACTIVE, not a once-on-mount read:
  // <AppShell> sets its body-cell ref via state that can resolve AFTER
  // PageSections mounts. The effect re-runs when the container resolves (deps
  // include scrollContainer) and attaches once per container. The one-shot
  // initial deep-link scroll is guarded by a ref.
  const didInitialScroll = useRef(false)
  useEffect(() => {
    if (mode === 'single') return
    const sc = scrollContainer

    let cleanup: (() => void) | undefined
    if (sc) {
      cleanup = setupScrollspy(sc, sectionRefs.current, {
        getActiveId: () => activeIdRef.current,
        setActiveId,
        isProgrammatic: () => programmaticScroll.current,
        getTopOffset: () => stripRef.current?.offsetHeight ?? 0,
      })
    }

    // Initial deep-link scroll, once. When the page loads with a non-first
    // initial active section, the strip highlights it but the container is still
    // parked at the top. Jump it just below the pinned tabs — instant, since a
    // refresh / shared link should land directly on it. Shell case waits for the
    // container; standalone (no shell) goes straight to the scrollIntoView
    // fallback.
    if (!didInitialScroll.current && (sc || !shell)) {
      didInitialScroll.current = true
      const initial = activeIdRef.current
      if (initial && initial !== props.sections[0]?.id) {
        scrollActiveIntoView(initial, 'instant')
      }
    }

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when the body-cell ref resolves
  }, [mode, scrollContainer, shell])

  function handleTabClick(id: string): void {
    setActiveId(id)
    // onActiveChange fires via the centralized activeId effect above.
    if (mode === 'single') return
    scrollActiveIntoView(id, 'smooth')
  }

  const registerRef = useCallback((id: string, el: HTMLElement | null): void => {
    if (el) sectionRefs.current.set(id, el)
    else sectionRefs.current.delete(id)
  }, [])

  return (
    <div className={`mrs-sections${props.className ? ` ${props.className}` : ''}`}>
      {/*
        Pinned tab strip — sticky to the top of the scroll container (the
        AppShell body cell). The opaque background occludes section content
        scrolling underneath. z-index keeps it above section cards but below
        portalled overlays.
      */}
      <div ref={stripRef} className="mrs-sections__strip">
        <SectionTabsStrip sections={props.sections} activeId={activeId} onTabClick={handleTabClick} />
      </div>

      <div className="mrs-sections__body">
        {mode === 'list' ? (
          <SectionsListMode
            sections={props.sections}
            registerRef={registerRef}
            forceMountAll={forceMountAll}
            scrollRoot={scrollContainer}
            renderIcon={shell?.config.renderIcon}
          />
        ) : (
          <SectionsSingleMode sections={props.sections} activeId={activeId} />
        )}
      </div>
    </div>
  )
}
