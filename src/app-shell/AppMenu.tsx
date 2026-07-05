/**
 * AppMenu — the sidebar navigation column (menu mode of the shell).
 *
 * Renders a brand/subtitle head, the top-level page list, and an action footer.
 * Requires shell context (`useShellContext`). The active row is resolved by a
 * longest-prefix match of the current pathname against `config.pages` — pure
 * logic, memoized. `groupBreak` draws a divider before a non-first entry. There
 * are no badges / pills / notifications: a row is just a `<Link>` with the
 * consumer-resolved icon plus the label thunk.
 *
 * Side-agnostic: `<AppShell>` mounts the SAME component as both the static
 * desktop column and the mobile-drawer body, so this file knows nothing about
 * which side it sits on (the wrapper carries the border). Width is driven by the
 * `data-size` attribute; action-footer spacing by `data-dense` (≤ 3 actions).
 * Icons via `config.renderIcon`; the module ships no icon kit and no i18n.
 */

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { HeaderAction, PageEntry } from './shellContract'
import { useShellContext } from './shellContext'
import { ShellAppModeControl } from './ShellAppModeControl'
import { HeaderActions } from './HeaderActions'

export interface AppMenuProps {
  /** Declarative chrome actions for the footer. `[]` for none. */
  actions: HeaderAction[]
  /** Node rendered right of the brand (badge / pill). */
  titleAdornment?: () => ReactNode
  /** Node rendered under the brand. */
  subtitle?: () => ReactNode
  /** Column width: 160 / 224 / 288 px. Default `'md'`. */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Longest-prefix match of `pathname` against the top-level pages. */
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

export function AppMenu(props: AppMenuProps): ReactNode {
  const shell = useShellContext()
  const { config } = shell
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const activePageId = useMemo(
    () => findActivePageId(config.pages, pathname),
    [config.pages, pathname],
  )

  const size = props.size ?? 'md'
  const dense = props.actions.length <= 3
  const className = props.className
    ? `mrs-app-menu ${props.className}`
    : 'mrs-app-menu'

  const brand: ReactNode = config.appNameRender
    ? config.appNameRender()
    : config.appName

  return (
    <div className={className} data-size={size}>
      <div className="mrs-app-menu__head">
        <Link to="/" className="mrs-app-menu__brand">
          {brand}
        </Link>
        {props.titleAdornment?.()}
        {props.subtitle ? (
          <div className="mrs-app-menu__subtitle">{props.subtitle()}</div>
        ) : null}
      </div>

      <ShellAppModeControl variant="menu" />

      <nav className="mrs-app-menu__nav">
        {config.pages.map((page, i) => (
          <span key={page.id}>
            {page.groupBreak && i > 0 ? (
              <div className="mrs-app-menu__divider" />
            ) : null}
            <Link
              to={page.route}
              className="mrs-app-menu__item"
              data-active={page.id === activePageId}
            >
              {config.renderIcon(page.icon, 18)}
              {page.label()}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mrs-app-menu__actions" data-dense={dense}>
        <HeaderActions actions={props.actions} />
      </div>
    </div>
  )
}
