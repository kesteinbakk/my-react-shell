# theme module

The semantic-token contract, five built-in palettes, and light/dark/system mode —
a batteries-included drop-in: import the provider, import the stylesheet, done.
The theme module is the **Convex-free core**, so it ships from the package barrel
**`my-react-shell`** rather than a sub-path.

```ts
import { ThemeProvider, useTheme, BUILT_IN_THEMES } from 'my-react-shell'
import type { ThemeName, ThemeMode, ThemeInfo, UseThemeResult } from 'my-react-shell'
import 'my-react-shell/styles.css'
```

## What it does

- A single `<ThemeProvider>` owns the active palette and mode, applies them to the
  DOM before paint, and persists the choice to localStorage.
- On every change it writes a `.theme-<name>-<mode>` class plus `data-theme`,
  `data-mode`, and `color-scheme` onto `<html>` — so native controls (scrollbars,
  form widgets, date pickers) render in the active mode too.
- It follows the OS `prefers-color-scheme` until the user picks an explicit mode,
  then tracks the user's choice. Switching back to system-follow re-reads the OS.
- `useTheme()` returns the current state plus the actions to change it.
- It ships **five built-in palettes** — `ocean`, `forest`, `sunset`, `soft`,
  `dynamic` (`golden` is intentionally absent) — exported as `BUILT_IN_THEMES`.

There is **no contract to fill and no bring-your-own** — this is a drop-in. The one
required step beyond mounting the provider is importing `my-react-shell/styles.css`,
which carries the token contract and every palette's `.theme-<name>-{light,dark}`
class. Without it the applied classes have no backing CSS.

## Wire it

```tsx
import { ThemeProvider, useTheme } from 'my-react-shell'
import 'my-react-shell/styles.css'

function App() {
  return (
    <ThemeProvider defaultTheme="ocean" defaultMode="light">
      <Page />
    </ThemeProvider>
  )
}

function Page() {
  const { theme, isDark, themes, setTheme, toggleMode } = useTheme()
  return (
    <>
      <button onClick={toggleMode}>{isDark ? 'Light' : 'Dark'}</button>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {themes.map((t) => <option key={t.name} value={t.name}>{t.label}</option>)}
      </select>
    </>
  )
}
```

When you use `<AppProviders>` from `my-react-shell/providers`, the theme provider is
already mounted for you — pass theme options through its `theme` prop instead of
mounting `<ThemeProvider>` yourself.

## `<ThemeProvider>` props

| Prop | Default | Meaning |
|------|---------|---------|
| `themes` | `BUILT_IN_THEMES` | Palettes this app exposes. Pass a stable reference. |
| `defaultTheme` | `'ocean'` | Palette used when nothing is persisted. |
| `defaultMode` | `'light'` | Mode used when nothing is persisted and not following the system. |
| `defaultFollowSystem` | `true` | Follow the OS color scheme until the user picks a mode. |
| `storageKey` | `'my-react-shell.theme'` | localStorage key for persistence. |

Persistence is best-effort: blocked storage (privacy mode) and a corrupt or
unknown persisted value fall back to the defaults rather than throwing. A persisted
palette the app no longer ships is dropped, so a stale `.theme-<name>-*` class is
never applied — the saved mode and system-follow still apply.

## `useTheme()` result

`useTheme()` reads the context and throws if called outside `<ThemeProvider>`. It
returns:

- `theme`, `mode` — the active palette and mode.
- `isDark` — `true` when the active mode is dark.
- `isSystemMode` — `true` when the mode is following the OS color scheme.
- `themes` — the palettes this app exposes.
- `setTheme(name)` — select a palette.
- `setMode(mode)` — set an explicit mode (stops following the system).
- `setSystemMode(follow)` — enable/disable following the OS color scheme.
- `toggleMode()` — flip light/dark (stops following the system).
- `cycleTheme()` — advance to the next palette in `themes`.
- `getThemeInfo(name)` — look up a palette's `{ name, label, description }`.

## Consumer-defined palettes

To add your own palette, ship a `.theme-<name>-light` / `.theme-<name>-dark` class
pair that fills the same token contract as the built-ins (see `src/styles/base.css`
for the contract and `src/styles/themes/*.css` for examples), import that CSS, then
list the palette in the provider:

```tsx
const themes: ThemeInfo[] = [
  ...BUILT_IN_THEMES,
  { name: 'brand', label: 'Brand', description: 'Our house palette' },
]

<ThemeProvider themes={themes} defaultTheme="brand">{…}</ThemeProvider>
```

A `ThemeName` is a built-in name (with autocomplete) or any other string, so a
custom name type-checks as long as its backing class exists. The class-removal
regex matches `theme-*-light` / `theme-*-dark`, so consumer palettes swap cleanly
alongside the built-ins.
