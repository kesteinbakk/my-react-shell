import { ConvexAuthProvider } from '@convex-dev/auth/react'
import type { AuthProviderProps } from './seam'

/**
 * my-react-shell's default auth provider: Convex Auth (`@convex-dev/auth`) — runs
 * entirely in Convex, with no auth server and no cross-domain cookies.
 *
 * This module is the ONLY place my-react-shell imports `@convex-dev/auth`, which is
 * what keeps it an *optional* peer dependency: a consumer that wires its own auth
 * (Better Auth, SSO, …) never imports this module and never installs the package.
 *
 * Import path: `my-react-shell/auth/convex`. Pass it to `<AppProviders>`:
 *
 * ```tsx
 * import { AppProviders } from 'my-react-shell'
 * import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
 *
 * <AppProviders authProvider={ConvexAuthDefaultProvider}>{…}</AppProviders>
 * ```
 */
export function ConvexAuthDefaultProvider({ client, children }: AuthProviderProps) {
  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>
}
