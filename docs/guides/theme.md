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

## Typography

The shell ships an opinionated default **sans face** behind an overridable token,
`--font-sans`, applied to `body` (everything inherits). Out of the box — with only
`my-react-shell/styles.css` — it's a system stack. To switch in a bundled,
self-hosted face, import **one** of the two font stylesheets **after** `styles.css`:

```ts
import 'my-react-shell/styles.css'
import 'my-react-shell/fonts/inter.css' // Inter — the recommended default, or:
// import 'my-react-shell/fonts/geist.css' // Geist
```

Each stylesheet registers its `@font-face` (self-hosted via `@fontsource` — no CDN,
no network call) and points `--font-sans` at that face; importing it after
`styles.css` lets the override win. To bring your own face instead, import neither and
set the token yourself:

```css
:root { --font-sans: 'Your Font', ui-sans-serif, system-ui, sans-serif; }
```

`--font-sans` is the single source of truth for the sans family. There is **no font
*scale* token** yet — sizes are the consumer's Tailwind utilities and the kit's own
`rem` sizing.

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

## Using these tokens with shadcn/ui

Most React consumers pair this module with **shadcn/ui**. shadcn primitives don't
read the `--color-*` contract — they consume their own cssVar names (`--background`,
`--muted-foreground`, `--primary`, …) and Tailwind utilities (`bg-primary`,
`text-muted-foreground`). So a consumer maps the two **once**, in its own
`index.css`. This bridge is intentionally **not shipped** by my-react-shell — the
mapping carries per-app latitude (see below), so there is no single correct version
to ship. Copy the canonical mapping below and adjust the latitude lines.

**How it works** — three layers:

1. `@import 'my-react-shell/styles.css'` brings in the value-free `--color-*`
   contract, the palette classes that fill it, **and Tailwind** — don't
   `@import 'tailwindcss'` again, `styles.css` already does. `<ThemeProvider>`
   applies the active `.theme-<name>-<mode>` class to `<html>`, so every
   `--color-*` already holds the right value for the active palette *and* mode.
2. A **mode-agnostic** `:root` block maps each shadcn cssVar onto a `--color-*`
   token (names → names, no values). The active theme class supplies the
   mode-specific value, so light/dark "just works" through the chain
   `shadcn-utility → shadcn-cssVar → --color-* → theme-class value`.
3. `@theme inline { … }` (verbatim from `shadcn init`) registers those cssVars
   with Tailwind v4 so the utilities generate.

```css
@import 'my-react-shell/styles.css'; /* contract + palettes + Tailwind (don't @import tailwindcss again) */

/* ThemeProvider writes data-mode="dark" on <html> (not shadcn's .dark class), so
   rebind shadcn's dark: variant. Only needed if you author explicit dark:
   utilities — the bridged tokens already flip via the active theme class. */
@custom-variant dark (&:where([data-mode='dark'], [data-mode='dark'] *));

/* shadcn cssVar → --color-* contract. Mode-agnostic (names → names); the active
   palette+mode class supplies the values, so light/dark tracks automatically. */
:root {
  --radius: 0.625rem;                              /* literal — kept from shadcn init */
  --background: var(--color-background-primary);
  --foreground: var(--color-text-primary);
  --card: var(--color-surface-primary);
  --card-foreground: var(--color-text-primary);
  --popover: var(--color-surface-raised);
  --popover-foreground: var(--color-text-primary);
  --muted: var(--color-surface-sunken);
  --muted-foreground: var(--color-text-muted);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-primary-content);
  --secondary: var(--color-secondary-bg);          /* soft-chip rendering — see Latitude */
  --secondary-foreground: var(--color-secondary);
  --accent: var(--color-surface-sunken-deep);      /* shadcn's hover/active surface */
  --accent-foreground: var(--color-text-primary);
  --destructive: var(--color-danger);
  --destructive-foreground: var(--color-danger-content);
  --border: var(--color-border-primary);
  --input: var(--color-border-primary);
  --ring: var(--color-focus);
}

/* Register the bridged vars with Tailwind v4 so utilities (bg-primary,
   text-muted-foreground, border-input, …) generate. Verbatim from shadcn init. */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

**The two colliding names are safe.** `@theme inline` emits `--color-primary` and
`--color-secondary` — names the contract also defines. The `inline` keyword inlines
each utility's value (so `bg-primary` compiles to `var(--primary)` directly), and
the vars it emits land in `@layer theme`, which the unlayered theme-class
declarations always override. No resolution cycle.

**Latitude — these lines are a consumer choice, not a fixed mapping:**

- **`--secondary`** — the contract's secondary is a *neutral, low-emphasis* pairing
  renderable two ways (see `themes/contract.css`): a **soft chip**
  (`--secondary: var(--color-secondary-bg)` + `--secondary-foreground:
  var(--color-secondary)`, shown above) or a **solid fill**
  (`--secondary: var(--color-secondary)` + `--secondary-foreground:
  var(--color-secondary-content)`).
- **`--popover` / `--accent` / `--input`** — map to whichever surface/border reads
  best (`surface-primary` vs `surface-raised`; `hover` vs `surface-sunken-deep`;
  `border-primary` vs `border-hover`).
- **Optional surfaces** — add `--chart-1..5` and `--sidebar-*` (in *both* the
  `:root` block and `@theme inline`) only if you pull in shadcn charts or the
  sidebar; map them onto the accent ramp / surface + text + brand tokens.

## Consumer-defined palettes

To add your own palette, ship a `.theme-<name>-light` / `.theme-<name>-dark` class
pair that fills the same token contract as the built-ins (see `themes/contract.css`
for the contract and the palette files in the `themes` package — e.g.
`themes/ocean.css` — for examples), import that CSS, then list the palette in the
provider:

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
