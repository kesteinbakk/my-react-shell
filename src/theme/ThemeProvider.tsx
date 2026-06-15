/**
 * ThemeProvider
 *
 * Owns theme state and its single application to the DOM: it writes the active
 * `.theme-<name>-<mode>` class, `data-theme` / `data-mode` attributes, and
 * `color-scheme` onto <html>, follows the OS color scheme until the user picks
 * a mode, and persists the choice to localStorage. SPA-only (no SSR, per D2).
 *
 * Consumer-defined palettes: pass `themes` listing them and ship a matching
 * `.theme-<name>-light` / `.theme-<name>-dark` class filling the token contract.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BUILT_IN_THEMES, ThemeContext } from './themeContext'
import type { ThemeContextValue, ThemeInfo, ThemeMode, ThemeName } from './themeContext'

export type { ThemeMode, ThemeName, ThemeInfo } from './themeContext'

const DEFAULT_STORAGE_KEY = 'react-shell.theme'

interface PersistedTheme {
  theme: ThemeName
  mode: ThemeMode
  followSystem: boolean
}

export interface ThemeProviderProps {
  children: ReactNode
  /** Palettes this app exposes. Defaults to the five built-ins. Pass a stable reference. */
  themes?: readonly ThemeInfo[]
  /** Palette used when nothing is persisted. Default `'ocean'`. */
  defaultTheme?: ThemeName
  /** Mode used when nothing is persisted and not following the system. Default `'light'`. */
  defaultMode?: ThemeMode
  /** Follow the OS color scheme until the user picks a mode. Default `true`. */
  defaultFollowSystem?: boolean
  /** localStorage key for persistence. Default `'react-shell.theme'`. */
  storageKey?: string
}

function getSystemMode(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readPersisted(
  storageKey: string,
  themes: readonly ThemeInfo[],
): Partial<PersistedTheme> | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    return null // storage blocked (e.g. privacy mode)
  }
  if (raw === null) return null
  let parsed: Partial<PersistedTheme>
  try {
    parsed = JSON.parse(raw) as Partial<PersistedTheme>
  } catch {
    return null // corrupt value
  }
  // Drop a persisted palette the app no longer ships, so we never apply a
  // `.theme-<name>-*` class that has no backing CSS. Mode/system-follow still apply.
  if (parsed.theme !== undefined && !themes.some((t) => t.name === parsed.theme)) {
    return { mode: parsed.mode, followSystem: parsed.followSystem }
  }
  return parsed
}

function applyThemeToDom(theme: ThemeName, mode: ThemeMode): void {
  const root = document.documentElement
  // Render native controls (scrollbars, form widgets, date pickers) in this mode.
  root.style.colorScheme = mode
  // Remove any previously-applied palette class (built-in or consumer-defined),
  // then apply the active one. The regex keeps this open to consumer themes.
  for (const cls of Array.from(root.classList)) {
    if (/^theme-.+-(light|dark)$/.test(cls)) root.classList.remove(cls)
  }
  root.classList.add(`theme-${theme}-${mode}`)
  root.setAttribute('data-theme', String(theme))
  root.setAttribute('data-mode', mode)
}

export function ThemeProvider({
  children,
  themes = BUILT_IN_THEMES,
  defaultTheme = 'ocean',
  defaultMode = 'light',
  defaultFollowSystem = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [state, setState] = useState<PersistedTheme>(() => {
    const persisted = readPersisted(storageKey, themes)
    const followSystem = persisted?.followSystem ?? defaultFollowSystem
    const theme = persisted?.theme ?? defaultTheme
    const mode = followSystem ? getSystemMode() : (persisted?.mode ?? defaultMode)
    return { theme, mode, followSystem }
  })

  // Apply to the DOM before paint, so theme changes never flash the old palette.
  useLayoutEffect(() => {
    applyThemeToDom(state.theme, state.mode)
  }, [state.theme, state.mode])

  // Persist (best-effort — storage may be unavailable).
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state, storageKey])

  // Track the OS color scheme while following the system.
  useEffect(() => {
    if (!state.followSystem) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      setState((s) => (s.followSystem ? { ...s, mode: e.matches ? 'dark' : 'light' } : s))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [state.followSystem])

  const setTheme = useCallback((theme: ThemeName) => {
    setState((s) => ({ ...s, theme }))
  }, [])

  const setMode = useCallback((mode: ThemeMode) => {
    setState((s) => ({ ...s, mode, followSystem: false }))
  }, [])

  const setFollowSystem = useCallback((follow: boolean) => {
    setState((s) => ({ ...s, followSystem: follow, mode: follow ? getSystemMode() : s.mode }))
  }, [])

  const toggleMode = useCallback(() => {
    setState((s) => ({ ...s, mode: s.mode === 'light' ? 'dark' : 'light', followSystem: false }))
  }, [])

  const cycleTheme = useCallback(() => {
    setState((s) => {
      const names = themes.map((t) => t.name)
      if (names.length === 0) return s
      const next = names[(names.indexOf(s.theme) + 1) % names.length] ?? s.theme
      return { ...s, theme: next }
    })
  }, [themes])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: state.theme,
      mode: state.mode,
      followSystem: state.followSystem,
      themes,
      setTheme,
      setMode,
      setFollowSystem,
      toggleMode,
      cycleTheme,
    }),
    [state, themes, setTheme, setMode, setFollowSystem, toggleMode, cycleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
