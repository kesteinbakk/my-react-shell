import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, Link, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { EmptyState } from './components'
import './index.css'
import './components/components.css'

// Dev-harness entry (D7). Consumers create their own router and wrap it in
// my-react-shell's providers — this file only boots the harness app.
//
// `defaultNotFoundComponent` is the router-level 404 catch for an unmatched URL.
// It is the consumer's to wire — no shipped module owns the router — so the harness
// wires it the way a consumer would: the kit's <EmptyState> as the not-found body.
// Mounted inside a root route that renders <AppShell>, it would keep the shell
// chrome; the harness root is theme-only, so here it stands alone. (Separate
// concern: the static host also needs a catch-all rewrite to index.html so a hard
// refresh on a deep link reaches the SPA at all — see docs/guides/app-shell.md.)
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <EmptyState
      title="Page not found"
      description="This route doesn't exist in the harness."
      action={
        <Link to="/" className="link">
          Back to the theme smoke-test
        </Link>
      }
    />
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// No silent default: a missing mount point is a hard error, not a no-op.
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('my-react-shell harness: #root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
