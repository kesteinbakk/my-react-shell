/**
 * AppShell — the outer chrome orchestrator.
 *
 * Renders EITHER an <AppHeader> (top banner) OR an <AppMenu> (sidebar), never
 * both. Splits its content area into a pinned page-header chrome slot (the band,
 * which renders automatically from the URL breadcrumb chain, plus any chrome a
 * `usePageHeader` call contributes) and a single scrolling body cell
 * (`[data-shell-content]`, the only scroller — Hard Rule #1). Owns the shell
 * context (config + scroll container + page-header registration + dynamic
 * pages), the document title, and the mobile drawer.
 *
 * SPA only — no SSR scars. Responsive show/hide is CSS media queries (app-shell.css);
 * the only breakpoint JS is the auto-close-drawer-past-1024px effect.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import * as Dialog from '@radix-ui/react-dialog'
import { SHELL_CONFIG_BRAND } from './shellContract'
import type { ShellConfig, ShellDocumentTitleMode, ShellPageHeaderSpec, PageHeaderAlertSpec } from './shellContract'
import {
  ShellContext,
  ShellAPIContext,
  type DynamicPagesEntry,
  type ShellAPIContextValue,
  type ShellContextValue,
} from './shellContext'
import { ShellPageHeaderUI, findActiveChain } from './ShellPageHeader'
import type { ShellAppModeRuntime } from './shellContext'
import { useMenuSizeOptional } from './useMenuSize'
import { AppHeader } from './AppHeader'
import { AppMenu } from './AppMenu'
import { AppBottomNav } from './AppBottomNav'

const DEFAULT_APP_MODE_STORAGE_KEY = 'my-react-shell.app-mode'

/** Best-effort read of the persisted app-mode — dropped if storage is blocked
 * (e.g. privacy mode), unset, or names a mode the config no longer ships. */
function readPersistedAppMode(storageKey: string, modes: string[]): string | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    return null
  }
  return raw !== null && modes.includes(raw) ? raw : null
}

/**
 * Empty chrome spec — handed to the band renderer when only breadcrumbs exist (no
 * `usePageHeader` contributed chrome). A stable module-level ref so the renderer
 * isn't fed a fresh object every render.
 */
const EMPTY_HEADER_SPEC: ShellPageHeaderSpec = {}

export type AppShellContentPadding = 'default' | 'none'
export type AppShellMobileNav = 'drawer' | 'tabBar'

export interface AppShellProps {
  /** Must be built by `defineShellConfig` (branded — checked at runtime). */
  config: ShellConfig
  /** `true` → sidebar (`AppMenu`); `false` → top banner (`AppHeader`). */
  useMenu: boolean
  /** Chrome action item thunks (theme toggle, language, bell, …). `[]` for none. */
  actions: Array<() => ReactNode>
  /** Under the brand. */
  subtitle?: () => ReactNode
  /** Right of the brand (badge/pill). */
  titleAdornment?: () => ReactNode
  footer?: () => ReactNode
  /** Content container padding. Default `'default'`. */
  contentPadding?: AppShellContentPadding
  /** Mobile nav style (menu mode only). Default `'drawer'`. */
  mobileNav?: AppShellMobileNav
  /** Sidebar side — a user preference, not a route decision. Default `'left'`. */
  menuSide?: 'left' | 'right'
  children: ReactNode
}

interface MobileMenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side: 'left' | 'right'
  /** Visually-hidden accessible name for the drawer. No language default — absent → unnamed (consumer omitted `labels.mainNavigation`). */
  title?: string
  children: ReactNode
}

function MobileMenuDrawer({ open, onOpenChange, side, title, children }: MobileMenuDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-drawer__overlay" />
        <Dialog.Content
          className={`mrs-drawer__content mrs-drawer__content--${side}`}
          aria-describedby={undefined}
        >
          <Dialog.Title className="mrs-visually-hidden">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function AppShell({
  config,
  useMenu,
  actions,
  subtitle,
  titleAdornment,
  footer,
  contentPadding,
  mobileNav,
  menuSide,
  children,
}: AppShellProps) {
  if (config[SHELL_CONFIG_BRAND] !== true) {
    throw new Error('<AppShell> requires a `config` built by defineShellConfig().')
  }

  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Soft read of the menu-size preference (header-chrome size). Absent provider →
  // null → 'medium' (normal), so a standalone consumer is unaffected.
  const menuSize = useMenuSizeOptional()?.menuSize ?? 'medium'

  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)

  // App-mode runtime — seeded from the `appMode` config block (static: modes +
  // labels), then driven at runtime via `useAppMode()`. All four slots are plain
  // React state so a consumer's `setAppMode`/`setVisible`/… re-renders the tree.
  // `appModeRuntime` is `null` when the config declares no `appMode`.
  const appModeConfig = config.appMode
  const appModeStorageKey = appModeConfig?.storageKey ?? DEFAULT_APP_MODE_STORAGE_KEY
  const [appModeValue, setAppModeValue] = useState<string>(
    () =>
      (appModeConfig && readPersistedAppMode(appModeStorageKey, appModeConfig.modes)) ??
      appModeConfig?.defaultMode ??
      appModeConfig?.modes[0] ??
      '',
  )
  const [appModeOptions, setAppModeOptions] = useState<string[]>(() => appModeConfig?.modes ?? [])
  const [appModeVisible, setAppModeVisible] = useState<boolean>(() => appModeConfig?.visible ?? true)
  const [appModeSelectable, setAppModeSelectable] = useState<boolean>(
    () => appModeConfig?.selectable ?? true,
  )
  // Persist the user's selection (best-effort — storage may be unavailable), so a
  // reload restores it via the lazy initializer above. Mirrors the theme/i18n/
  // menu-size modules' persistence convention.
  useEffect(() => {
    if (appModeConfig === undefined) return
    try {
      window.localStorage.setItem(appModeStorageKey, appModeValue)
    } catch {
      /* ignore */
    }
  }, [appModeConfig, appModeValue, appModeStorageKey])
  // `appModeRuntime` is built after `activeChain` below — it depends on the active
  // leaf page's `supportedModes` to narrow the available set.

  // Page-chrome contributors (`usePageHeader`), keyed by a stable id + a render-order
  // token. The band renders the chrome of the entry with the HIGHEST order — the
  // deepest-mounted contributor (React renders parent→child, so an ancestor's order
  // is lower than a descendant's), matching foundation's parent-first `onMount`.
  // `update` rewrites an entry's spec in place (same id + order), never reordering,
  // so the winner can't flip when a contributor re-renders with fresh inline thunks.
  const [headerStack, setHeaderStack] = useState<
    { id: symbol; order: number; spec: ShellPageHeaderSpec }[]
  >([])
  const pageHeaderSpec =
    headerStack.reduce<{ order: number; spec: ShellPageHeaderSpec } | null>(
      (best, e) => (best === null || e.order > best.order ? e : best),
      null,
    )?.spec ?? null
  const registerPageHeader = useCallback((order: number, spec: ShellPageHeaderSpec) => {
    const id = Symbol('shell-page-header')
    setHeaderStack((prev) => [...prev, { id, order, spec }])
    return {
      update: (next: ShellPageHeaderSpec) =>
        setHeaderStack((prev) =>
          prev.map((e) => (e.id === id ? { id, order, spec: next } : e)),
        ),
      unregister: () => setHeaderStack((prev) => prev.filter((e) => e.id !== id)),
    }
  }, [])

  const [alertStack, setAlertStack] = useState<
    { id: symbol; spec: PageHeaderAlertSpec }[]
  >([])
  const pageAlertSpec = alertStack.at(-1)?.spec ?? null

  // A plain-string prefix prepended to `document.title` (e.g. an unread badge
  // `(3)`). A single reactive slot — one intended producer — set via
  // `useDocumentTitlePrefix`; `null`/'' means no prefix. Folded into
  // `documentTitleText` below so the single title-owner effect writes it.
  const [documentTitlePrefix, setDocumentTitlePrefix] = useState<string | null>(null)

  const registerPageAlert = useCallback((spec: PageHeaderAlertSpec) => {
    const id = Symbol('shell-page-alert')
    setAlertStack((prev) => [...prev, { id, spec }])
    return {
      update: (next: PageHeaderAlertSpec) =>
        setAlertStack((prev) =>
          prev.map((e) => (e.id === id ? { id, spec: next } : e)),
        ),
      unregister: () => setAlertStack((prev) => prev.filter((e) => e.id !== id)),
    }
  }, [])

  // Per-registrant state: parent → registrantId → items.
  // Multiple layout components can each contribute children to the same parent
  // route without clobbering each other. The flat view below is what context
  // and findActiveChain read.
  const [dynamicPages, setDynamicPages] = useState<
    Record<string, Record<string, DynamicPagesEntry[]>>
  >({})
  const registerDynamicPages = useCallback(
    (registrantId: string, parent: string, items: DynamicPagesEntry[]) => {
      setDynamicPages((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent] ?? {}), [registrantId]: items },
      }))
      return () =>
        setDynamicPages((prev) => {
          const byRegistrant = { ...(prev[parent] ?? {}) }
          delete byRegistrant[registrantId]
          const next = { ...prev }
          if (Object.keys(byRegistrant).length === 0) {
            delete next[parent]
          } else {
            next[parent] = byRegistrant
          }
          return next
        })
    },
    [],
  )

  // Flat view: parent → merged children across all registrants.
  const flatDynamicPages = useMemo<Record<string, DynamicPagesEntry[]>>(
    () =>
      Object.fromEntries(
        Object.entries(dynamicPages).map(([parent, byId]) => [
          parent,
          Object.values(byId).flat(),
        ]),
      ),
    [dynamicPages],
  )

  // The breadcrumb chain for the current URL — drives the document title, and the
  // automatic band-visibility gate below. Pure function of (pages, pathname,
  // dynamic children); the band shows whenever this resolves to ≥1 level, so a page
  // never mounts a header just to surface breadcrumbs.
  const activeChain = useMemo(
    () => findActiveChain(config.pages, pathname, flatDynamicPages),
    [config.pages, pathname, flatDynamicPages],
  )

  // App-mode ↔ page support. The active breadcrumb leaf's `supportedModes` narrows
  // the control (intersected with any runtime `setModes` role-narrowing); undefined
  // → all modes, no narrowing. `effectiveModes` is both what the control renders and
  // what `useAppMode().modes` reports.
  const appModeLeaf = activeChain.at(-1)?.entry
  const pageSupportedModes = appModeLeaf?.supportedModes
  const effectiveModes = useMemo(
    () =>
      pageSupportedModes
        ? appModeOptions.filter((m) => pageSupportedModes.includes(m))
        : appModeOptions,
    [pageSupportedModes, appModeOptions],
  )

  // Current mode vs the leaf's declared support. Undefined support → no-op. When the
  // leaf excludes the current mode we honour `appMode.onUnsupportedMode`: 'jump'
  // switches to the first supported mode + warns (here); 'throw' (default) is raised
  // below in render, after all hooks, so it aborts the bad render without skipping any.
  const appModeUnsupported =
    appModeConfig !== undefined &&
    pageSupportedModes !== undefined &&
    !pageSupportedModes.includes(appModeValue)
  const onUnsupportedMode = appModeConfig?.onUnsupportedMode ?? 'throw'
  useEffect(() => {
    if (!appModeUnsupported || onUnsupportedMode !== 'jump') return
    const target = effectiveModes[0] ?? pageSupportedModes?.[0]
    if (target === undefined) return
    console.warn(
      `[app-shell] The current page does not support app-mode "${appModeValue}"; ` +
        `switching to "${target}".`,
    )
    setAppModeValue(target)
  }, [appModeUnsupported, onUnsupportedMode, effectiveModes, pageSupportedModes, appModeValue])

  const appModeRuntime = useMemo<ShellAppModeRuntime | null>(
    () =>
      appModeConfig === undefined
        ? null
        : {
            appMode: appModeValue,
            setAppMode: setAppModeValue,
            modes: effectiveModes,
            setModes: setAppModeOptions,
            visible: appModeVisible,
            setVisible: setAppModeVisible,
            selectable: appModeSelectable,
            setSelectable: setAppModeSelectable,
          },
    [appModeConfig, appModeValue, effectiveModes, appModeVisible, appModeSelectable],
  )

  const ctx = useMemo<ShellContextValue>(
    () => ({
      config,
      scrollContainer: scrollEl,
      setScrollContainer: setScrollEl,
      dynamicPages: flatDynamicPages,
      registerDynamicPages,
      pageAlertSpec,
      registerPageAlert,
      pageHeaderSpec,
      registerPageHeader,
      setDocumentTitlePrefix,
      appMode: appModeRuntime,
    }),
    [config, scrollEl, flatDynamicPages, registerDynamicPages, pageAlertSpec, registerPageAlert, pageHeaderSpec, registerPageHeader, appModeRuntime],
  )

  const apiCtx = useMemo<ShellAPIContextValue>(
    () => ({
      setScrollContainer: setScrollEl,
      registerDynamicPages,
      registerPageAlert,
      registerPageHeader,
      setDocumentTitlePrefix,
    }),
    [setScrollEl, registerDynamicPages, registerPageAlert, registerPageHeader],
  )

  // Document title — single owner; routes without a header fall through to appName.
  // An optional `documentTitlePrefix` (e.g. an unread badge `(3)`) is prepended with
  // a single space, so a producer never has to touch `document.title` directly (any
  // direct write would be clobbered on the next title recompute — this is the only
  // safe seam for a prefix).
  const documentTitleText = useMemo(() => {
    const spec = pageHeaderSpec
    const base = (() => {
      if (spec && typeof spec.documentTitle === 'function') return spec.documentTitle()
      const mode: ShellDocumentTitleMode =
        (typeof spec?.documentTitle === 'string' ? spec.documentTitle : undefined) ??
        config.shellPageHeader?.documentTitle ??
        'composed'
      if (mode === 'app') return config.appName
      const leaf = spec?.title?.() ?? activeChain.at(-1)?.entry.label() ?? config.appName
      if (mode === 'leaf') return leaf
      return leaf === config.appName ? config.appName : `${leaf} · ${config.appName}`
    })()
    return documentTitlePrefix ? `${documentTitlePrefix} ${base}` : base
  }, [config, pageHeaderSpec, activeChain, documentTitlePrefix])

  useEffect(() => {
    document.title = documentTitleText
  }, [documentTitleText])

  // Mobile drawer.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const showMenu = useMenu
  const useTabBar = showMenu && (mobileNav ?? 'drawer') === 'tabBar'
  const menuOnLeft = (menuSide ?? 'left') !== 'right'
  const maxWidth = config.pageContainer?.defaultMaxWidth ?? 'x-wide'
  const containerPadding = contentPadding ?? 'default'

  // Automatic band visibility — the band shows whenever the URL resolves to
  // breadcrumbs, OR a `usePageHeader` contributed chrome (actions/search/tabs). No
  // registered spec is needed for breadcrumbs. `title` alone never shows the band
  // (it only relabels an existing leaf crumb). At `/` (empty chain, no chrome) the
  // band is omitted, as before.
  const hasPageChrome =
    pageHeaderSpec !== null &&
    ((pageHeaderSpec.actions?.length ?? 0) > 0 ||
      pageHeaderSpec.search !== undefined ||
      pageHeaderSpec.tabs !== undefined)
  const showBand = activeChain.length > 0 || hasPageChrome

  const brand = (): ReactNode => (config.appNameRender ? config.appNameRender() : config.appName)
  const openMenuLabel = config.labels?.openMenu?.()
  const navLabel = config.labels?.mainNavigation?.()

  const menu = (
    <AppMenu actions={actions} subtitle={subtitle} titleAdornment={titleAdornment} />
  )

  // Hard stop for an unsupported current mode when the consumer kept the default
  // 'throw' policy: treat "navigated to a page in a mode it doesn't support" as a
  // routing/config bug. Raised here — after every hook — so the throw never skips a
  // hook, and the bad page never commits ('jump' is handled in the effect above).
  if (appModeUnsupported && onUnsupportedMode === 'throw') {
    throw new Error(
      `App-mode "${appModeValue}" is not supported by the current page` +
        (appModeLeaf ? ` (${appModeLeaf.route})` : '') +
        `. Its supportedModes are [${pageSupportedModes?.join(', ')}]. Gate navigation so ` +
        `this can't happen, or set appMode.onUnsupportedMode: 'jump' to auto-switch instead.`,
    )
  }

  return (
    <ShellAPIContext.Provider value={apiCtx}>
      <ShellContext.Provider value={ctx}>
        <div
          className="mrs-shell"
          data-content-padding={containerPadding}
          data-max-width={maxWidth}
          data-menu-size={menuSize}
        >
          {!showMenu && (
            <div className="mrs-shell__header-row">
              <AppHeader actions={actions} subtitle={subtitle} titleAdornment={titleAdornment} />
            </div>
          )}

          <div className="mrs-shell__middle">
            {showMenu && menuOnLeft && (
              <div className="mrs-shell__sidebar mrs-shell__sidebar--left">{menu}</div>
            )}

            <div className="mrs-shell__page-area">
              {showBand ? (
                <div className="mrs-shell__chrome">
                  <div className="mrs-shell__container">
                    <ShellPageHeaderUI
                      spec={pageHeaderSpec ?? EMPTY_HEADER_SPEC}
                      shell={ctx}
                      showMenuButton={showMenu && !useTabBar}
                      onOpenMenu={() => setMobileMenuOpen(true)}
                    />
                  </div>
                </div>
              ) : (
                showMenu && (
                  <div className="mrs-shell__mobile-brand">
                    {!useTabBar && (
                      <button
                        type="button"
                        className="mrs-shell__hamburger"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label={openMenuLabel}
                      >
                        {config.renderIcon('menu', 20)}
                      </button>
                    )}
                    <Link to="/" className="mrs-shell__brand-link">
                      {brand()}
                    </Link>
                  </div>
                )
              )}

              <div ref={setScrollEl} className="mrs-shell__content" data-shell-content>
                <div className="mrs-shell__container mrs-shell__container--fill">{children}</div>
              </div>
            </div>

            {showMenu && !menuOnLeft && (
              <div className="mrs-shell__sidebar mrs-shell__sidebar--right">{menu}</div>
            )}
          </div>

          {footer && (
            <div
              className={
                useTabBar ? 'mrs-shell__footer mrs-shell__footer--hide-mobile' : 'mrs-shell__footer'
              }
            >
              {footer()}
            </div>
          )}

          {useTabBar && (
            <AppBottomNav onOpenMore={() => setMobileMenuOpen(true)} moreOpen={mobileMenuOpen} />
          )}
        </div>

        {showMenu && (
          <MobileMenuDrawer
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            side={menuOnLeft ? 'left' : 'right'}
            title={navLabel}
          >
            {menu}
          </MobileMenuDrawer>
        )}
      </ShellContext.Provider>
    </ShellAPIContext.Provider>
  )
}
