import { useState } from 'react'
import type { ReactNode } from 'react'
import { ConvexProvider } from 'convex/react'
import type { ConvexReactClient } from 'convex/react'
import { createConvexClient } from './convexClient'

export interface ConvexClientProviderProps {
  children: ReactNode
  /** A pre-created client (tests/advanced). Defaults to one from `VITE_CONVEX_URL`. */
  client?: ConvexReactClient
}

/**
 * Plain Convex provider (no auth). Creates the client once from `VITE_CONVEX_URL`
 * (throwing if absent). For an authenticated app use `<AppProviders>` with an
 * auth provider — the auth provider supplies the Convex context itself.
 */
export function ConvexClientProvider({ children, client }: ConvexClientProviderProps) {
  const [convex] = useState(() => client ?? createConvexClient())
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
