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
leaves the actual glyphs to you. Pair it with `<UserPreferences>` (see the
[API reference → components](../specifications/api-reference.md)) to give users the toggle.

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

**3 — route your icon map through `createIconRenderer`.** The cleanest place is the
one map you already keep. With the app-shell, that's `config.renderIcon`, and the whole
shell (nav, hamburger, breadcrumbs) flips at once. Rather than hand-roll the lookup,
let `createIconRenderer` build the `renderIcon` from a key→glyph map and a key→emoji map
— it adds the two guardrails a bare `<Icon>` can't (see *Guardrails* below):

```tsx
import { createIconRenderer, type IconGlyph } from 'my-react-shell/icons'
import type { LucideIcon } from 'lucide-react'
import { Home, Palette } from 'lucide-react'

// Glyphs are library-neutral — each key maps to a (size) => node factory. With lucide,
// the adapter is a one-liner:
const glyph = (G: LucideIcon): IconGlyph => (size) => <G size={size} />

const ICONS = { home: glyph(Home), palette: glyph(Palette) /* … */ }   // keys infer a union
const EMOJIS: Record<keyof typeof ICONS, string> = { home: '🏠', palette: '🎨' /* … */ }

export const renderIcon = createIconRenderer(ICONS, EMOJIS)             // → config.renderIcon
```

Typing `EMOJIS` as `Record<keyof typeof ICONS, string>` is what makes a forgotten emoji a
**compile error** instead of a silent `●`. (You can still hand-roll a `renderIcon` with
the bare `<Icon>` from step 2 if you don't want the helper — it's optional.)

### Guardrails

`createIconRenderer` ports the two things `foundation`'s registry gave you, without a
registry or a `lucide-react` dependency:

1. **Missing-emoji check, at compile time *and* dev-time.** With the typed `EMOJIS`
   above, a glyph with no emoji won't compile. For maps built dynamically (where the
   compiler can't verify coverage), a one-time **dev** `console.warn` lists every glyph
   key lacking an emoji on first construction — plus any emoji key with no matching glyph
   (a likely typo). Production builds carry neither check.
2. **Force a key to stay a glyph** even in emoji mode — for brand marks, spinners, or
   symbols whose emoji would misread. Pass `force`; those keys also skip the missing-emoji
   warning (they're icon-only by intent):

   ```tsx
   createIconRenderer(ICONS, EMOJIS, { force: ['spinner', 'brand'] })
   ```

   The per-call equivalent is `<Icon forceIcon>` (step 2), which `force` is sugar over.

**Options:** `force` (icon-only keys) · `fallbackEmoji` (default `'●'`, shown for an
unmapped key in emoji mode) · `fallbackGlyph` (`(size) => node`, shown for a key absent
from `icons`).

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
| `forceIcon` | `false` | Always render the glyph, even in emoji mode (brand marks, spinners). The per-call form of `createIconRenderer`'s `force` list. |

### `createIconRenderer(icons, emojis, options?)`

Builds a `renderIcon(key, size, label?)` from your maps, with the guardrails above. See
[**Wire it → step 3**](#wire-it) for the full example.

| Arg | Type | Meaning |
|------|------|---------|
| `icons` | `Record<K, IconGlyph>` | Key → `(size) => node` glyph factory. Infers the key union `K`. |
| `emojis` | `Record<K, string>` | Key → emoji. Typed against `icons` — a missing key is a compile error. |
| `options.force` | `readonly K[]` | Keys that stay glyphs in emoji mode; exempt from the missing-emoji warning. |
| `options.fallbackEmoji` | `'●'` | Emoji shown for an unmapped key in emoji mode. |
| `options.fallbackGlyph` | — | `(size) => node` shown for a key absent from `icons`. |

Returns an `IconRenderer` — droppable straight into app-shell's `config.renderIcon`.

## Swap how an emoji is drawn — `EmojiRenderProvider` (optional)

By default `<Icon>`'s emoji branch prints the **raw char** in the page font, so the same
glyph renders differently per OS (Apple vs Segoe vs Noto). For a cross-platform-consistent
set, wrap the app in `EmojiRenderProvider` and supply a `render(emoji, size) => ReactNode`.
`<Icon>` then calls it to draw the char — reaching **everything that renders through
`<Icon>`** (a bare `<Icon>`, `createIconRenderer`, the chrome's `config.renderIcon`, every
consumer `<AppIcon>`). The wrapper span (className / aria / sizing) is identical to the raw
path; only the inner content changes.

```tsx
import { EmojiRenderProvider } from 'my-react-shell/icons'

// e.g. serve a bundled per-codepoint SVG on non-Apple devices, native char on Apple,
// native char if the asset is missing — the policy is yours; the shell ships none.
<IconModeProvider>
  <EmojiRenderProvider render={(emoji, size) => renderEmoji(emoji, size)}>
    <App />
  </EmojiRenderProvider>
</IconModeProvider>
```

The seam is **fully optional and backward-compatible**: with no `EmojiRenderProvider`,
`<Icon>` renders the raw char exactly as before — every existing consumer is unchanged.

For an emoji surface that is *not* an `<Icon>` (e.g. a thin `<Emoji char>` for arbitrary
user-picked chars with no registry key), read the same renderer with **`useEmojiRender()`**
— it returns the active `EmojiRenderer` or `null` outside a provider — so that surface
shares one render policy with the icon system.

| Export | Kind | Meaning |
|------|------|---------|
| `EmojiRenderProvider` | component | Publishes `render: (emoji, size) => ReactNode` for the subtree. |
| `useEmojiRender()` | hook | Returns the active `EmojiRenderer` or `null` outside a provider. |
| `EmojiRenderer` | type | `(emoji: string, size: number) => ReactNode`. |

## Pair with `<UserPreferences>`

`<UserPreferences>` (from `my-react-shell/components`) is the ready-made panel that
surfaces the toggle alongside the theme picker. Wire it with `useIconMode()`:

```tsx
const { iconMode, setIconMode } = useIconMode()
// …pass iconMode + onIconModeChange={setIconMode} to <UserPreferences>
```

See the [API reference → components](../specifications/api-reference.md) for the full `<UserPreferences>` panel.
