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

## The surface ladder

Beyond the palette and mode, components render against a small ladder of **surface**
tokens — semantic layers of depth, from the page canvas through the card up to floating
chrome, and down into recessed wells. Reach for a rung by its **role**, not by how light
or dark it happens to look in one palette:

| Token | Role |
|---|---|
| `--color-background-primary` | The page canvas — the lowest layer everything sits on. |
| `--color-surface-primary` | The default card / panel surface (the kit cards render here). |
| `--color-surface-raised` | Floating chrome that lifts **above** the card — popovers, dropdowns, dialogs, toasts. |
| `--color-surface-sunken` | A recessed well **below** the card — table headers, input/control wells, neutral notes, chips. |
| `--color-surface-sunken-deep` | A deeper recess — filled neutral badges, avatars, nested wells, hover-on-sunken. |

The direction is **mode-consistent**: in both light and dark, `surface-raised` reads
*above* the card and the `surface-sunken*` rungs read *below* it. Dark mode does this
with lightness (raised is lighter, sunken darker); light mode can't go lighter than
white, so `surface-raised` is pure white over a hair-off-white card and leans on a
stronger shadow, while the sunken rungs go to a darker grey. The same token therefore
means the same depth in every palette and mode — no inversion between light and dark.

(`--color-background-secondary` is a second, subtly distinct canvas zone — a rail or a
banded region — alongside the primary background.) Depth is reinforced with
**elevation**: a box-shadow whose *shade* is the palette's `--color-shadow-{sm,md,lg,xl}`
token, so the same geometry deepens automatically in dark mode. The
`my-react-shell/components` kit applies both for you (its per-component surface roles are
listed in the [API reference](../specifications/api-reference.md#surfaces--elevation)); a
consumer composing its own surfaces should follow the same role mapping so cards, menus,
and wells read consistently across every palette.

### Which rung to reach for — and don't hand-paint it

When you compose your own region, map it to a rung by **what it is**, not by how dark it
looks. The recurring mistakes: painting a raised card with a sunken/`muted` token, or
punching a nested element down to the page floor with `background-primary`.

| The thing you're building | Rung |
|---|---|
| The page itself (the app-shell body renders this) | `--color-background-primary` |
| A banded page zone — a rail, a hero strip, a section band | `--color-background-secondary` |
| A card / the default content panel | `--color-surface-primary` |
| Floating chrome — popover, dropdown, dialog, toast | `--color-surface-raised` |
| A recessed well — an input/control well, a table header, a neutral note | `--color-surface-sunken` |
| A deeper recess — a filled neutral badge, an avatar, a nested well, hover-on-sunken | `--color-surface-sunken-deep` |

**Don't reach for these tokens on a bare `<div>` at all — reach for a component.** The kit
ships a neutral, role-parameterized [`Surface`](../specifications/api-reference.md)
primitive (`<Surface level="sunken">`, `<Surface level="raised" elevation="popover">`,
`<Surface variant="outline">`) that owns the fill, border, elevation, **and** the paired
foreground colour, so nested text can't wash out and the depth can't invert between light
and dark. A full card is `<Card>` (which *is* `Surface level="primary"` with card chrome).
Hand-picking a `--color-surface-*` value onto a plain element is the drift this ladder
exists to prevent — let `Surface` / `Card` carry the token.

**Filled vs outline — pick per region, deliberately.** A **filled** surface reads as a
layer by its fill (plus optional elevation) — the default, and the right call for anything
that should read as *raised* (a card, a floating panel), because in light mode an
outline-only box leans on a hairline border that all but vanishes when the panel, canvas,
and card sit within a hair of each other in lightness. An **outline** surface (transparent
+ border, no shadow) is the deliberate choice for a *flat* grouping box on the canvas that
shouldn't claim elevation. Choose one rule per surface role and hold it — don't mix filled
and outline for the same kind of region.

### Other Base Variables

Along with the surface ladder, the base contract provides strictly named tokens for text, borders, and overlays. Use **only** these exact names:

**Text hierarchy:**
- `--color-text-primary` (main text)
- `--color-text-secondary` (dimmer, supporting text)
- `--color-text-tertiary` (even dimmer text)
- `--color-text-muted` (faint text, disabled states)

**Borders:**
- `--color-border-primary` (main structural borders)
- `--color-border-secondary` (subtler dividers)
- `--color-border-hover` (interactive border states)

**Overlays & Elevation:**
- `--color-overlay` (modal/drawer backdrops — mode-independent `rgba(0,0,0,0.5)`)
- `--mrs-elevation-popover` (the standard dropdown/dialog box-shadow variable defined internally)

## Anti-patterns & Hallucinated Tokens

> [!WARNING]
> **For AI Agents:** Do **NOT** invent, assume, or hallucinate CSS variable names based on generic patterns. The shell's tokens are strictly defined in `src/themes/contract.css`.

**Common mistakes to avoid:**
- ❌ `--color-base-root` / `--color-base-surface` / `--color-base-dim` (Hallucinated. Use `--color-surface-raised`, `--color-surface`, `--color-overlay` etc. instead.)
- ❌ `--color-text-body` (Hallucinated. Use `--color-text-primary` instead.)
- ❌ `--color-border-subtle` (Hallucinated. Use `--color-border-secondary` instead.)
- ❌ `--radius-lg` / `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl` (No generic radius/shadow utility tokens exist — the real shadow tokens carry the `-color` infix: `--color-shadow-{sm,md,lg,xl}`. Use hardcoded `rem` for borders, and `--mrs-elevation-*` or `--color-shadow-*` for shadows).

## Typography

The shell ships an opinionated default **sans face** behind an overridable token,
`--font-sans`, applied to `body` (everything inherits). Out of the box — with only
`my-react-shell/styles.css` — it's a system stack. To switch in a bundled,
self-hosted face, import **one** of the two font stylesheets **after** `styles.css`:

```ts
import 'my-react-shell/styles.css'
import 'my-react-shell/fonts/geist.css' // Geist — the recommended default, or:
// import 'my-react-shell/fonts/inter.css' // Inter
```

Each stylesheet registers its `@font-face` (self-hosted via `@fontsource` — no CDN,
no network call) and points `--font-sans` at that face; importing it after
`styles.css` lets the override win. To bring your own face instead, import neither and
set the token yourself:

```css
:root {
  --font-sans: 'Your Font', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Your Mono Font', ui-monospace, monospace;
  --font-footer: var(--font-mono); /* Force monospace footers globally */
}
```

`--font-sans` is the single source of truth for the sans family, and `--font-mono` is the single source of truth for monospace text (code blocks, stats, metrics). `--font-footer` controls the font family of structured card footers, defaulting to `inherit`. There is **no font *scale* token** yet — sizes are the consumer's Tailwind utilities and the kit's own `rem` sizing.

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
pair that fills the same token contract as the built-ins (the contract and every
built-in palette ship inside the package under `src/themes/` — see
`src/themes/contract.css` for the contract and e.g. `src/themes/ocean.css` for a
worked palette), import that CSS, then list the palette in the provider:

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
