import type { ComponentType, ReactNode } from 'react'
import type { ConvexReactClient } from 'convex/react'

/** Props every auth provider in the seam receives. */
export interface AuthProviderProps {
  /** The Convex client the auth provider wires its session into. */
  client: ConvexReactClient
  children: ReactNode
}

/**
 * The auth seam.
 *
 * An auth provider is a component that wraps the Convex client with an
 * authentication context. react-shell ships the Convex Auth default at
 * `react-shell/auth/convex`; a consumer needing Better Auth / SSO / MFA
 * implements this type and passes it to `<AppProviders authProvider={…}>`.
 */
export type AuthProvider = ComponentType<AuthProviderProps>
