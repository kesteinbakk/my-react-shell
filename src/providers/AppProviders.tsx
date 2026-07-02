import { useState } from 'react'
import type { ReactNode } from 'react'
import { ConvexProvider } from 'convex/react'
import type { ConvexReactClient } from 'convex/react'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { ThemeProviderProps } from '../theme/ThemeProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import type { I18nProviderProps } from '../i18n/I18nProvider'
import { withShellCatalog } from '../i18n/shellCatalog'
import { createConvexClient } from './convexClient'
import type { AuthProvider } from '../auth/seam'

export interface AppProvidersProps {
  children: ReactNode
  /**
   * The auth seam. Omit for a plain (unauthenticated) Convex app. For the Convex
   * Auth default, import `ConvexAuthDefaultProvider` from `my-react-shell/auth/convex`
   * and pass it here; for Better Auth / SSO, pass your own `AuthProvider`.
   */
  authProvider?: AuthProvider
  /** A pre-created Convex client (tests/advanced). Defaults to one from `VITE_CONVEX_URL`. */
  client?: ConvexReactClient
  /** Options forwarded to `<ThemeProvider>` (default palette, theme set, …). */
  theme?: Omit<ThemeProviderProps, 'children'>
  /**
   * Options forwarded to `<I18nProvider>` (at minimum `messages` — locale code →
   * catalog). When given, `AppProviders` mounts i18n and **auto-merges the shell's
   * bundled chrome catalog** (the `mrs.*` namespace) under each locale, so the
   * component kit's built-in copy resolves and follows the active locale. Omit to
   * skip the provider — components then fall back to the bundled default-locale
   * (English) chrome.
   */
  i18n?: Omit<I18nProviderProps, 'children'>
}

/**
 * The single provider wrapper a consumer mounts above its router: theme + Convex
 * client + (optional) auth. Creates the Convex client once from `VITE_CONVEX_URL`
 * (throwing if absent — no silent default).
 */
export function AppProviders({
  children,
  authProvider: Auth,
  client,
  theme = {},
  i18n,
}: AppProvidersProps) {
  const [convex] = useState(() => client ?? createConvexClient())
  const convexTree = Auth ? (
    <Auth client={convex}>{children}</Auth>
  ) : (
    <ConvexProvider client={convex}>{children}</ConvexProvider>
  )
  return (
    <ThemeProvider {...theme}>
      {i18n ? (
        <I18nProvider {...i18n} messages={withShellCatalog(i18n.messages)}>
          {convexTree}
        </I18nProvider>
      ) : (
        convexTree
      )}
    </ThemeProvider>
  )
}
