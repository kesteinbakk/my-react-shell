// my-react-shell — public API barrel (the package `exports["."]` entry).
//
// The barrel is the **Convex-free core**: the theme module only. Anything that
// imports Convex lives behind a sub-path, so a theme-only consumer never pulls it:
//   • providers (Convex client + AppProviders + the auth seam) → `my-react-shell/providers`
//   • Convex Auth default                                       → `my-react-shell/auth/convex`
//   • i18n (t() seam + missing-key surface, zero-dep)           → `my-react-shell/i18n`
// The dev-harness (src/main.tsx, src/routes/**) is NOT exported.

// ── theme ───────────────────────────────────────────────────────────────────
export { ThemeProvider } from './theme/ThemeProvider'
export type { ThemeProviderProps } from './theme/ThemeProvider'
export { useTheme } from './theme/useTheme'
export type { UseThemeResult } from './theme/useTheme'
export { BUILT_IN_THEMES } from './theme/themeContext'
export type { BuiltInThemeName, ThemeInfo, ThemeMode, ThemeName } from './theme/themeContext'
