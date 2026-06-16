import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '../index'

export const Route = createRootRoute({
  component: RootLayout,
})

// The harness wraps its routes in my-react-shell's providers the way a consumer
// would. ThemeProvider is imported from the package barrel to exercise the
// public export surface.
function RootLayout() {
  return (
    <ThemeProvider>
      <HarnessNav />
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </ThemeProvider>
  )
}

// Top-level tabs between the harness pages. Themed entirely through the token
// contract so the nav tracks the active palette + mode like everything else.
function HarnessNav() {
  const tabStyle = {
    color: 'var(--color-text-secondary)',
    borderBottom: '2px solid transparent',
  } as const
  const activeStyle = {
    color: 'var(--color-primary)',
    borderBottom: '2px solid var(--color-primary)',
  } as const
  return (
    <nav
      className="flex items-center gap-1 px-8"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-primary)',
      }}
    >
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className="px-3 py-3 text-sm font-medium transition-colors"
        style={tabStyle}
        activeProps={{ style: { ...tabStyle, ...activeStyle } }}
      >
        Theme playground
      </Link>
      <Link
        to="/palette"
        className="px-3 py-3 text-sm font-medium transition-colors"
        style={tabStyle}
        activeProps={{ style: { ...tabStyle, ...activeStyle } }}
      >
        Color palette
      </Link>
    </nav>
  )
}
