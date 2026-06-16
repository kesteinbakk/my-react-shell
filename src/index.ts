// my-react-shell — public API barrel (the package `exports["."]` entry).
//
// This is the entire importable surface consumers get via the git-dep (D5).
// It grows as modules land: theme (B) and providers + auth seam (C) ship today;
// i18n is planned. App-shell / page-tab primitives are NOT part of this package —
// they were dropped in the modular pivot (strategy D8).
// The dev-harness (src/main.tsx, src/routes/**) is NOT exported.

// ── B · theming ──────────────────────────────────────────────────────────────
export { ThemeProvider } from './theme/ThemeProvider'
export type { ThemeProviderProps } from './theme/ThemeProvider'
export { useTheme } from './theme/useTheme'
export type { UseThemeResult } from './theme/useTheme'
export { BUILT_IN_THEMES } from './theme/themeContext'
export type { BuiltInThemeName, ThemeInfo, ThemeMode, ThemeName } from './theme/themeContext'

// ── C · providers + auth seam ────────────────────────────────────────────────
// The Convex Auth default provider is NOT exported here — it lives at the
// `my-react-shell/auth/convex` sub-path so `@convex-dev/auth` stays an optional peer.
export { AppProviders } from './providers/AppProviders'
export type { AppProvidersProps } from './providers/AppProviders'
export { ConvexClientProvider } from './providers/ConvexClientProvider'
export type { ConvexClientProviderProps } from './providers/ConvexClientProvider'
export { createConvexClient } from './providers/convexClient'
export type { AuthProvider, AuthProviderProps } from './auth/seam'
