// react-shell — public API barrel (the package `exports["."]` entry).
//
// This is the entire importable surface consumers get via the git-dep (D5).
// It is populated as the build phases land:
//   B theming · C providers + auth seam · D app-shell · E page/tab primitives ·
//   F i18n seam.
// The dev-harness (src/main.tsx, src/routes/**) is NOT exported.

// ── B · theming ──────────────────────────────────────────────────────────────
export { ThemeProvider } from './theme/ThemeProvider'
export type { ThemeProviderProps } from './theme/ThemeProvider'
export { useTheme } from './theme/useTheme'
export type { UseThemeResult } from './theme/useTheme'
export { BUILT_IN_THEMES } from './theme/themeContext'
export type { BuiltInThemeName, ThemeInfo, ThemeMode, ThemeName } from './theme/themeContext'
