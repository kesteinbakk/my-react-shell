/**
 * AppHeader — the full-width top banner (header mode of the shell).
 *
 * Works inside `<AppShell>` (reads `config.appName` / `appNameRender` from
 * context) and standalone (the consumer passes `title`). Actions are plain
 * render thunks — no built-in keys, no registry, no validator; the consumer
 * composes the row from its own widgets. Every user-facing string is a thunk or
 * a config value; the module never imports i18n. The home link is a TanStack
 * `<Link>`; classes are `mrs-app-header*` from app-shell.css.
 */

import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useShellContextOptional } from './shellContext'

export interface AppHeaderProps {
  /** Action item render thunks, rendered in the right zone. `[]` for none. */
  actions: Array<() => ReactNode>
  /** Brand text. Required standalone; inside the shell falls back to `config.appName`. */
  title?: string
  /** Home-link target. Default `'/'`. */
  homeRoute?: string
  /** Node rendered right of the brand (badge / pill). */
  titleAdornment?: () => ReactNode
  /** Node rendered under / beside the brand. */
  subtitle?: () => ReactNode
  className?: string
}

export function AppHeader(props: AppHeaderProps): ReactNode {
  const shell = useShellContextOptional()

  const resolvedTitle = props.title ?? shell?.config.appName
  if (resolvedTitle === undefined) {
    throw new Error(
      'AppHeader requires a `title` when used outside <AppShell> (no shell config to fall back to)',
    )
  }

  // Use the consumer's custom wordmark only when we are showing the config app
  // name (i.e. no explicit `title` prop override).
  const showConfigBrand = props.title === undefined && shell !== null
  const appNameRender = shell?.config.appNameRender
  const brand: ReactNode =
    showConfigBrand && appNameRender ? appNameRender() : resolvedTitle

  const homeRoute = props.homeRoute ?? '/'
  const className = props.className
    ? `mrs-app-header ${props.className}`
    : 'mrs-app-header'

  return (
    <header className={className}>
      <Link to={homeRoute} className="mrs-app-header__brand">
        {brand}
      </Link>
      {props.titleAdornment?.()}
      {props.subtitle ? (
        <span className="mrs-app-header__subtitle">{props.subtitle()}</span>
      ) : null}
      <div className="mrs-app-header__actions">
        {props.actions.map((thunk, i) => (
          <span key={i}>{thunk()}</span>
        ))}
      </div>
    </header>
  )
}
