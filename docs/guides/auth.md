# auth module

A pluggable auth **seam** — the `AuthProvider` TypeScript contract — plus the
shipped Convex Auth default and a bring-your-own path. This is the template
"contract + default + bring-your-own" module: the seam type erases at runtime and
ships with the providers module, while the default implementation lives behind the
sub-path **`my-react-shell/auth/convex`** so `@convex-dev/auth` stays an *optional*
peer.

```ts
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
import type { AuthProvider, AuthProviderProps } from 'my-react-shell/providers'
```

## What it does

- The **seam** is a single type: `AuthProvider` is a component that wraps the
  Convex client with an authentication context. Every auth provider receives the
  same `AuthProviderProps` — `{ client, children }`.
- The **default** is `ConvexAuthDefaultProvider` — Convex Auth (`@convex-dev/auth`)
  running entirely in Convex, with no auth server and no cross-domain cookies. It
  is the only place my-react-shell imports `@convex-dev/auth`, which is what keeps
  that package an optional peer.
- An auth provider is passed to `<AppProviders authProvider={…}>`; `AppProviders`
  then renders it around the children, and the provider supplies the Convex context
  itself (so there is no separate `<ConvexProvider>` when auth is present).

It ships **no UI** — no sign-in form, no account menu. Those are app-owned; the
seam only governs how the auth context is wired above your router.

## The seam contract

```ts
import type { ComponentType, ReactNode } from 'react'
import type { ConvexReactClient } from 'convex/react'

export interface AuthProviderProps {
  /** The Convex client the auth provider wires its session into. */
  client: ConvexReactClient
  children: ReactNode
}

export type AuthProvider = ComponentType<AuthProviderProps>
```

Any component matching `AuthProvider` is a valid provider: it takes the Convex
client and children, attaches its authentication context, and renders the children.

## Wire it (the Convex Auth default)

```tsx
import { AppProviders } from 'my-react-shell/providers'
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'

function Root({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders authProvider={ConvexAuthDefaultProvider}>
      {children}
    </AppProviders>
  )
}
```

The default needs the Convex side of Convex Auth configured in your `convex/`
backend (`@convex-dev/auth` providers, the auth tables, the HTTP routes) — the seam
covers only the React client wiring. Omit `authProvider` entirely for a plain,
unauthenticated Convex app.

## Bring your own

A consumer needing Better Auth (`@convex-dev/better-auth`, crossDomain, Convex ≥
1.25), SSO, or MFA implements the `AuthProvider` contract itself and passes it to
`<AppProviders>` — the shipped default is never imported, so `@convex-dev/auth` is
never installed:

```tsx
import type { AuthProviderProps } from 'my-react-shell/providers'
import { AppProviders } from 'my-react-shell/providers'
import { MyAuthProvider as BackingProvider } from './my-auth'

function MyAuth({ client, children }: AuthProviderProps) {
  return <BackingProvider client={client}>{children}</BackingProvider>
}

<AppProviders authProvider={MyAuth}>{…}</AppProviders>
```

Because your provider satisfies the same `AuthProvider` type, the rest of the app
wiring is identical to the default — you can swap implementations without touching
`AppProviders` or your routes.
