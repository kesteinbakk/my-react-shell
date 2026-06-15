import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '../index'

export const Route = createRootRoute({
  component: RootLayout,
})

// The harness wraps its routes in react-shell's providers the way a consumer
// would. ThemeProvider is imported from the package barrel to exercise the
// public export surface.
function RootLayout() {
  return (
    <ThemeProvider>
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </ThemeProvider>
  )
}
