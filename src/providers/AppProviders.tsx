import { useState } from 'react'
import type { ReactNode } from 'react'
import { ConvexProvider } from 'convex/react'
import type { ConvexReactClient } from 'convex/react'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { ThemeProviderProps } from '../theme/ThemeProvider'
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
}: AppProvidersProps) {
  const [convex] = useState(() => client ?? createConvexClient())
  return (
    <ThemeProvider {...theme}>
      {Auth ? (
        <Auth client={convex}>{children}</Auth>
      ) : (
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      )}
    </ThemeProvider>
  )
}
