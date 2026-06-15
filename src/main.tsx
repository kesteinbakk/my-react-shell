import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

// Dev-harness entry (D7). Consumers create their own router and wrap it in
// react-shell's providers — this file only boots the harness app.
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// No silent default: a missing mount point is a hard error, not a no-op.
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('react-shell harness: #root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
