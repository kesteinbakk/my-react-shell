# icons module

The **icons↔emojis display-mode seam**. my-react-shell ships **no icon registry** —
consumers render their own glyphs (lucide, etc.). This module adds only the *preference*
("render icons or emojis") and a thin `<Icon>` that swaps a glyph for its emoji per that
preference. It's the React-era take on the SolidJS `foundation` `useEmojis` switch —
**without** pulling a `lucide-react` dependency into the library. Shipped at the sub-path
**`my-react-shell/icons`**.

```ts
import { IconModeProvider, useIconMode, Icon } from 'my-react-shell/icons'
import type { IconMode, IconProps } from 'my-react-shell/icons'
```

Pure React: no heavy peers, and **no stylesheet to import** (the `<Icon>` emoji styling
is inline).

## Why a seam, not a kit

Unlike `foundation`, this project deliberately ships no central icon component — the
app-shell renders icons via a consumer-supplied `config.renderIcon`, and consumers use
lucide directly. So there is no single `<Icon>` for an emoji toggle to hook into. This
module supplies the missing piece — the **preference** and the **swap mechanism** — and
leaves the actual glyphs to you. Pair it with [`<UserPreferences>`](component-kit.md)
to give users the toggle.

## Wire it

**1 — wrap the app** in `IconModeProvider` (uncontrolled; persists to localStorage):

```tsx
import { IconModeProvider } from 'my-react-shell/icons'

<ThemeProvider>
  <IconModeProvider>
    <App />
  </IconModeProvider>
</ThemeProvider>
```

**2 — render glyphs through `<Icon>`.** Give it the SVG node and its emoji; it shows one
or the other based on the active mode (defaults to `icon` with no provider):

```tsx
import { Icon } from 'my-react-shell/icons'
import { Palette } from 'lucide-react'

<Icon icon={<Palette size={18} />} emoji="🎨" size={18} label="Theme" />
```

**3 — route your icon map through it.** The cleanest place is the one map you already
keep. With the app-shell, that's `config.renderIcon` — return an `<Icon>` and the whole
shell (nav, hamburger, breadcrumbs) flips at once:

```tsx
const ICONS = { home: Home, palette: Palette, /* … */ }
const EMOJIS = { home: '🏠', palette: '🎨', /* … */ }

function renderIcon(key: string, size: number) {
  const Glyph = ICONS[key] ?? Circle
  return <Icon icon={<Glyph size={size} />} emoji={EMOJIS[key] ?? '●'} size={size} />
}
```

## API

### `IconModeProvider`

| Prop | Default | Meaning |
|------|---------|---------|
| `value` | — | Controlled mode. Pass with `onChange` to own state + persistence yourself. |
| `onChange` | — | Fires on change. In controlled mode it's the only writer; uncontrolled, it fires alongside the internal update. |
| `defaultMode` | `'icon'` | Initial mode when uncontrolled and nothing is persisted. |
| `storageKey` | `'my-react-shell.icon-mode'` | localStorage key for uncontrolled persistence. |

**Uncontrolled vs controlled — you choose where the preference lives:**

```tsx
// Uncontrolled — zero config, persisted to localStorage:
<IconModeProvider>…</IconModeProvider>

// Controlled — you own it (e.g. mirror to a per-user Convex preference):
<IconModeProvider value={pref} onChange={(m) => saveToBackend(m)}>…</IconModeProvider>
```

### `useIconMode()`

Returns `{ iconMode, isEmoji, setIconMode, toggleIconMode }`. Throws outside a provider.
Feed `iconMode` + `setIconMode` into `<UserPreferences>`.

### `<Icon>`

| Prop | Default | Meaning |
|------|---------|---------|
| `icon` | — | The glyph node shown in `icon` mode (e.g. a sized lucide icon). **Required.** |
| `emoji` | — | The emoji shown in `emoji` mode. **Required.** |
| `size` | `20` | Pixel size for the emoji glyph; match your icon's size. |
| `label` | — | Accessible label. Omit to render decoratively (`aria-hidden`). |
| `className` | — | Class on the wrapper span (both modes). |

## Pair with `<UserPreferences>`

`<UserPreferences>` (from `my-react-shell/components`) is the ready-made panel that
surfaces the toggle alongside the theme picker. Wire it with `useIconMode()`:

```tsx
const { iconMode, setIconMode } = useIconMode()
// …pass iconMode + onIconModeChange={setIconMode} to <UserPreferences>
```

See the [component-kit guide](component-kit.md#userpreferences) for the full panel.
