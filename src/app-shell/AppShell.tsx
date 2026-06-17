/**
 * AppShell — the outer chrome orchestrator.
 *
 * Renders EITHER an <AppHeader> (top banner) OR an <AppMenu> (sidebar), never
 * both. Splits its content area into a pinned page-header chrome slot (where a
 * registered <ShellPageHeader> lands) and a single scrolling body cell
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
import type { ShellConfig, ShellDocumentTitleMode, ShellPageHeaderSpec } from './shellContract'
import { ShellContext } from './shellContext'
import type { DynamicPagesEntry, ShellContextValue } from './shellContext'
import { ShellPageHeaderUI, findActiveChain } from './ShellPageHeader'
import { AppHeader } from './AppHeader'
import { AppMenu } from './AppMenu'
import { AppBottomNav } from './AppBottomNav'

export type AppShellContentPadding = 'default' | 'none'
export type AppShellMobileNav = 'drawer' | 'tabBar'

export interface AppShellProps {
  /** Must be built by `defineShellConfig` (branded — checked at runtime). */
  config: ShellConfig
  /** `true` → sidebar (`AppMenu`); `false` → top banner (`AppHeader`). */
  useMenu: boolean
  /** Chrome action thunks (theme toggle, language, bell, …). `[]` for none. */
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
  title: string
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

  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)

  const [headerStack, setHeaderStack] = useState<ShellPageHeaderSpec[]>([])
  const pageHeaderSpec = headerStack.at(-1) ?? null
  const registerPageHeader = useCallback((spec: ShellPageHeaderSpec) => {
    setHeaderStack((prev) => [...prev, spec])
    return () => setHeaderStack((prev) => prev.filter((s) => s !== spec))
  }, [])

  const [dynamicPages, setDynamicPages] = useState<Record<string, DynamicPagesEntry[]>>({})
  const registerDynamicPages = useCallback((parent: string, items: DynamicPagesEntry[]) => {
    setDynamicPages((prev) => ({ ...prev, [parent]: items }))
    return () =>
      setDynamicPages((prev) => {
        const next = { ...prev }
        delete next[parent]
        return next
      })
  }, [])

  const ctx = useMemo<ShellContextValue>(
    () => ({
      config,
      scrollContainer: scrollEl,
      setScrollContainer: setScrollEl,
      dynamicPages,
      registerDynamicPages,
      pageHeaderSpec,
      registerPageHeader,
    }),
    [config, scrollEl, dynamicPages, registerDynamicPages, pageHeaderSpec, registerPageHeader],
  )

  // Document title — single owner; routes without a header fall through to appName.
  const documentTitleText = useMemo(() => {
    const spec = pageHeaderSpec
    if (spec && typeof spec.documentTitle === 'function') return spec.documentTitle()
    const mode: ShellDocumentTitleMode =
      (typeof spec?.documentTitle === 'string' ? spec.documentTitle : undefined) ??
      config.shellPageHeader?.documentTitle ??
      'composed'
    if (mode === 'app') return config.appName
    const chain = findActiveChain(config.pages, pathname, dynamicPages)
    const leaf = spec?.title?.() ?? chain.at(-1)?.entry.label() ?? config.appName
    if (mode === 'leaf') return leaf
    return leaf === config.appName ? config.appName : `${leaf} · ${config.appName}`
  }, [config, pageHeaderSpec, pathname, dynamicPages])

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
  const maxWidth = config.pageContainer?.defaultMaxWidth ?? '2xl'
  const containerPadding = contentPadding ?? 'default'
  const border = config.shellPageHeader?.border ?? true

  const brand = (): ReactNode => (config.appNameRender ? config.appNameRender() : config.appName)
  const openMenuLabel = config.labels?.openMenu?.() ?? 'Open menu'
  const navLabel = config.labels?.mainNavigation?.() ?? 'Main navigation'

  const menu = (
    <AppMenu actions={actions} subtitle={subtitle} titleAdornment={titleAdornment} />
  )

  return (
    <ShellContext.Provider value={ctx}>
      <div className="mrs-shell" data-content-padding={containerPadding} data-max-width={maxWidth}>
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
            {pageHeaderSpec ? (
              <div className="mrs-shell__chrome">
                <div
                  className="mrs-shell__container"
                  data-border={border}
                  data-menu-only={false}
                >
                  <ShellPageHeaderUI
                    spec={pageHeaderSpec}
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
  )
}
