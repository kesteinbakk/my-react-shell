/**
 * AppBottomNav — the mobile bottom tab bar (menu mode, `mobileNav='tabBar'`).
 *
 * `<AppShell>` renders it only when tab-bar nav is active; CSS hides it at the
 * `lg` breakpoint where the static sidebar takes over. The bar shows the pages
 * opted in via `PageEntry.tabBar`, each an icon-over-label `<Link>`, plus a
 * trailing "More" tab — a `<button>` that opens the same drawer the hamburger
 * does. Requires shell context. No per-page presence dots / badges. Icons via
 * `config.renderIcon`; chrome label via `config.labels` with an English
 * fallback; the module never imports i18n.
 *
 * DEV guardrails (effect-scoped, dev-only `console.warn`): warns when more than
 * five pages are marked `tabBar` (the bar gets cramped) and when zero pages are
 * marked (the bar then shows only "More").
 */

import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { PageEntry } from './shellContract'
import { useShellContext } from './shellContext'

export interface AppBottomNavProps {
  /** Opens the overflow drawer (the "More" tab + the hamburger share it). */
  onOpenMore: () => void
  /** Whether the overflow drawer is currently open (highlights the "More" tab). */
  moreOpen?: boolean
  className?: string
}

/** Longest-prefix match of `pathname` against the given pages. */
function findActivePageId(pages: PageEntry[], pathname: string): string | null {
  let activeId: string | null = null
  let bestLength = -1
  for (const page of pages) {
    const matches =
      pathname === page.route || pathname.startsWith(page.route + '/')
    if (matches && page.route.length > bestLength) {
      activeId = page.id
      bestLength = page.route.length
    }
  }
  return activeId
}

export function AppBottomNav(props: AppBottomNavProps): ReactNode {
  const shell = useShellContext()
  const { config } = shell
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const barPages = useMemo(
    () => config.pages.filter((p) => p.tabBar),
    [config.pages],
  )
  const activePageId = useMemo(
    () => findActivePageId(config.pages, pathname),
    [config.pages, pathname],
  )

  const barPageIds = useMemo(
    () => new Set(barPages.map((p) => p.id)),
    [barPages],
  )
  const moreActive =
    (props.moreOpen ?? false) ||
    (activePageId !== null && !barPageIds.has(activePageId))

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (barPages.length > 5) {
      console.warn(
        `[AppShell] AppBottomNav has ${barPages.length} pages marked tabBar; ` +
          'the bar is cramped beyond ~5. Mark fewer pages tabBar and let the rest fall to "More".',
      )
    }
    if (barPages.length === 0) {
      console.warn(
        '[AppShell] AppBottomNav has no pages marked tabBar; the bar shows only "More". ' +
          'Mark top-level pages with `tabBar: true` in shell config.',
      )
    }
  }, [barPages.length])

  const moreLabel = config.labels?.more?.() ?? 'More'
  const className = props.className
    ? `mrs-bottom-nav ${props.className}`
    : 'mrs-bottom-nav'

  return (
    <nav className={className}>
      {barPages.map((page) => (
        <Link
          key={page.id}
          to={page.route}
          className="mrs-bottom-nav__tab"
          data-active={page.id === activePageId}
        >
          {config.renderIcon(page.icon, 22)}
          <span className="mrs-bottom-nav__label">{page.label()}</span>
        </Link>
      ))}
      <button
        type="button"
        className="mrs-bottom-nav__tab"
        data-active={moreActive}
        onClick={props.onOpenMore}
        aria-label={moreLabel}
      >
        {config.renderIcon('menu', 22)}
        <span className="mrs-bottom-nav__label">{moreLabel}</span>
      </button>
    </nav>
  )
}
