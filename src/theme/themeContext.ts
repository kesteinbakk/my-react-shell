/**
 * Theme context — intentionally minimal and stable.
 *
 * `createContext` and the theme types/constants live here, isolated from the
 * effectful <ThemeProvider>, so editing the provider does not re-run
 * `createContext` and mint a new context identity on hot reload. Keep this
 * module free of effects and component imports.
 */

import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark'

/** The palettes my-react-shell ships in its `registry:base`. */
export type BuiltInThemeName = 'ocean' | 'forest' | 'sunset' | 'soft' | 'dynamic'

/**
 * A theme name. Built-ins get autocomplete; a consumer-defined palette is any
 * other string — its matching `.theme-<name>-light` / `.theme-<name>-dark`
 * class (filling the contract in `styles/base.css`) must exist.
 */
export type ThemeName = BuiltInThemeName | (string & {})

export interface ThemeInfo {
  /** Stable id used in the `.theme-<name>-<mode>` class and in persistence. */
  name: ThemeName
  /** Human-readable label for theme pickers. */
  label: string
  /** One-line description for theme pickers. */
  description: string
}

/** The five built-in palettes, in display order. `golden` is intentionally absent. */
export const BUILT_IN_THEMES: readonly ThemeInfo[] = [
  { name: 'ocean', label: 'Ocean', description: 'Deep sea blues and cool tones' },
  { name: 'forest', label: 'Forest', description: 'Natural greens and earth tones' },
  { name: 'sunset', label: 'Sunset', description: 'Warm oranges and purples' },
  { name: 'soft', label: 'Soft', description: 'Muted, gentle colors with subtle contrasts' },
  { name: 'dynamic', label: 'Dynamic', description: 'High contrast with vibrant accents' },
]

export interface ThemeContextValue {
  /** Active palette. */
  theme: ThemeName
  /** Active mode. */
  mode: ThemeMode
  /** Whether `mode` tracks the OS `prefers-color-scheme`. */
  followSystem: boolean
  /** Palettes this app exposes (the built-ins unless overridden). */
  themes: readonly ThemeInfo[]
  /** Select a palette. */
  setTheme: (theme: ThemeName) => void
  /** Set an explicit mode (stops following the system). */
  setMode: (mode: ThemeMode) => void
  /** Enable/disable following the OS color scheme. */
  setFollowSystem: (follow: boolean) => void
  /** Flip light/dark (stops following the system). */
  toggleMode: () => void
  /** Advance to the next palette in `themes`. */
  cycleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Read the theme context. Throws if used outside <ThemeProvider>. */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext must be used within <ThemeProvider>')
  }
  return ctx
}
