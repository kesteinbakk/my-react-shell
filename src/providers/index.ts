// my-react-shell/providers — the Convex-coupled providers module.
//
// Lives behind a sub-path (not the main barrel) so `convex` stays an *optional*
// peer: a theme-only consumer never imports this and never installs Convex. An
// app that wants the Convex client context / the single `AppProviders` wrapper
// imports from here and provides `convex` (and `VITE_CONVEX_URL`).
//
// The Convex Auth default provider is NOT exported here — it lives at the
// `my-react-shell/auth/convex` sub-path so `@convex-dev/auth` stays optional too.

export { AppProviders } from './AppProviders'
export type { AppProvidersProps } from './AppProviders'
export { ConvexClientProvider } from './ConvexClientProvider'
export type { ConvexClientProviderProps } from './ConvexClientProvider'
export { createConvexClient } from './convexClient'

// The auth seam contract (a type — erased at runtime). The default implementation
// is at `my-react-shell/auth/convex`; bring-your-own implements this type.
export type { AuthProvider, AuthProviderProps } from '../auth/seam'
