# providers module

The Convex client provider and the single `AppProviders` wrapper that composes
theme + Convex + (optional) auth above your router. Shipped at the sub-path
**`my-react-shell/providers`** so `convex` stays an *optional* peer and the package
barrel stays Convex-free — a theme-only app never imports this and never installs
Convex.

```ts
import {
  AppProviders,
  ConvexClientProvider,
  createConvexClient,
} from 'my-react-shell/providers'
import type {
  AppProvidersProps,
  ConvexClientProviderProps,
  AuthProvider,
} from 'my-react-shell/providers'
```

## What it does

- `createConvexClient()` builds a `ConvexReactClient` from `VITE_CONVEX_URL`. It
  **throws** when the URL is absent or empty — no silent `localhost`-shaped default
  that passes locally and fails in production — and **rejects a trailing slash**,
  which would break the Convex sync websocket (close code 1006).
- `<ConvexClientProvider>` is the plain (unauthenticated) Convex provider: it
  creates the client once and supplies the Convex context.
- `<AppProviders>` is the single wrapper a consumer mounts above its router. It
  composes `<ThemeProvider>` + the Convex client + an optional auth provider. Omit
  the auth seam for a plain Convex app; pass one to get an authenticated context.

The client is created **once** (held in `useState`), so it survives re-renders and
hot reloads without reconnecting. You may pass a pre-created `client` (tests or
advanced setups) instead of letting the module read the env var.

## Wire it

`<AppProviders>` goes above your TanStack Router instance, at the app root:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AppProviders } from 'my-react-shell/providers'
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
import 'my-react-shell/styles.css'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders
      authProvider={ConvexAuthDefaultProvider}
      theme={{ defaultTheme: 'ocean' }}
    >
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
```

For a plain Convex app with no auth, drop `authProvider`. For a theme-only app with
no Convex at all, skip this module entirely and mount `<ThemeProvider>` from the
barrel directly.

## `<AppProviders>` props

| Prop | Default | Meaning |
|------|---------|---------|
| `authProvider` | — | The auth seam. Omit for a plain (unauthenticated) Convex app. See below. |
| `client` | from `VITE_CONVEX_URL` | A pre-created Convex client (tests/advanced). |
| `theme` | `{}` | Options forwarded to `<ThemeProvider>` (`Omit<ThemeProviderProps, 'children'>`). |

`authProvider` is an `AuthProvider` — a component receiving `{ client, children }`.
When present, `AppProviders` renders `<Auth client={convex}>` instead of the plain
`<ConvexProvider>`, because the auth provider supplies the Convex context itself.
When absent, it renders the plain `<ConvexProvider>`.

## The auth seam, re-exported here

The `AuthProvider` / `AuthProviderProps` **types** are re-exported from this module
for convenience (they are types — erased at runtime, so importing them pulls in no
Convex Auth code). The shipped default implementation lives at
`my-react-shell/auth/convex`; a bring-your-own provider implements the
`AuthProvider` contract. See the [auth guide](auth.md) for the seam, the default,
and the BYO path.

## Environment

`VITE_CONVEX_URL` is required and must **not** end with a trailing slash — both
checks live in `createConvexClient`. The URL is written into `.env.local` by
`convex dev`, or set in your host environment for a deployed build. The module
deliberately does not default it.
