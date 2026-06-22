---
title: API reference
summary: >
  The complete public API of my-react-shell — every export, per import path,
  with signatures and minimal usage. The fast index the per-module guides aren't.
status: current
area: all modules
last_updated: 2026-06-20
---

# my-react-shell — API reference

The complete public surface, organised by import path. This is the **fast index**:
every export, what it is, and the minimum to use it. For the *why* and the deeper
contract of any module, follow the **Guide** link in its section.

> **Mental model.** my-react-shell is a *menu of self-contained modules*, not a
> framework. The barrel `my-react-shell` is the **Convex-free theme core**; anything
> heavier lives behind a sub-path so a theme-only app installs nothing it doesn't use.
> Import only the modules you want. See [concept.md](../concept.md).

## Import-path map

| Import path | Module | Needs (optional peers) | CSS to import |
|---|---|---|---|
| `my-react-shell` | **theme** (core) | — (just `react`) | `my-react-shell/styles.css` |
| `my-react-shell/providers` | **providers** (Convex client + `AppProviders`) | `convex` | — |
| `my-react-shell/auth/convex` | **auth** Convex Auth default | `convex`, `@convex-dev/auth`, `@auth/core` | — |
| `my-react-shell/i18n` | **i18n** (`t()` seam) | — (zero-dep) | — |
| `my-react-shell/components` | **component kit** (opinionated composites) | `class-variance-authority`, `clsx`, `tailwind-merge`, some `@radix-ui/*`, `react-colorful` (only for `ColorPicker`) | `my-react-shell/components/styles.css` |
| `my-react-shell/icons` | **icons↔emojis seam** | — (pure React) | — |
| `my-react-shell/app-shell` | **app-shell** (chrome, page header, tabs) | `@tanstack/react-router`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover` | `my-react-shell/app-shell/styles.css` |

**Required peers (always):** `react ^19`, `react-dom ^19`. Everything else is an
**optional** peer, installed only for the sub-path that uses it (see
`peerDependenciesMeta` in `package.json`). The barrel needs none of them.

**`type` vs value.** Every `…Props` / contract type below is a TypeScript type
(erased at runtime) — import it with `import type`. Components, hooks, and functions
are runtime values.

---

## `my-react-shell` — theme (the Convex-free core)

Light/dark/system + palette selection, batteries-included. **Guide:**
[theme.md](../guides/theme.md).

```ts
import { ThemeProvider, useTheme, BUILT_IN_THEMES } from 'my-react-shell'
import type { ThemeName, ThemeMode, ThemeInfo, BuiltInThemeName, UseThemeResult, ThemeProviderProps } from 'my-react-shell'
import 'my-react-shell/styles.css' // REQUIRED — token contract + palettes (raw Tailwind v4 source; see CSS section)
```

| Export | Kind | Summary |
|---|---|---|
| `ThemeProvider` | component | Owns active palette + mode; applies them to `<html>` before paint; persists to localStorage. |
| `useTheme()` | hook | Read theme state + actions. Throws outside `<ThemeProvider>`. |
| `BUILT_IN_THEMES` | const | `readonly ThemeInfo[]` — the 5 palettes: `ocean`, `forest`, `sunset`, `soft`, `dynamic`. |
| `ThemeProviderProps` | type | Props below. |
| `UseThemeResult` | type | Return of `useTheme()`. |
| `ThemeName` | type | `BuiltInThemeName \| (string & {})` — built-in (autocomplete) or any custom palette name. |
| `BuiltInThemeName` | type | `'ocean' \| 'forest' \| 'sunset' \| 'soft' \| 'dynamic'`. |
| `ThemeMode` | type | `'light' \| 'dark'`. |
| `ThemeInfo` | type | `{ name: ThemeName; label: string; description: string }`. |

**`<ThemeProvider>` props:** `themes` (default `BUILT_IN_THEMES`), `defaultTheme`
(`'ocean'`), `defaultMode` (`'light'`), `defaultFollowSystem` (`true`), `storageKey`
(`'my-react-shell.theme'`), `children`.

**`useTheme()` returns:** `theme`, `mode`, `isDark`, `isSystemMode`, `themes`,
`setTheme(name)`, `setMode(mode)`, `setSystemMode(follow)`, `toggleMode()`,
`cycleTheme()`, `getThemeInfo(name)`.

```tsx
<ThemeProvider defaultTheme="ocean">{children}</ThemeProvider>
// inside:
const { theme, isDark, themes, setTheme, toggleMode } = useTheme()
```

> When you use `<AppProviders>`, the theme provider is **already mounted** — pass
> theme options via its `theme` prop instead of mounting `<ThemeProvider>` yourself.
> Custom palette? Ship a `.theme-<name>-{light,dark}` CSS class pair and list it in
> `themes` (see the guide).

**Typography (fonts).** The shell applies an overridable `--font-sans` token to
`body` (a system stack by default). Import **one** bundled, self-hosted face **after**
`my-react-shell/styles.css` to switch — or neither, and set `--font-sans` yourself:

| CSS import | Face |
|---|---|
| `my-react-shell/fonts/geist.css` | Geist Variable (recommended default) |
| `my-react-shell/fonts/inter.css` | Inter Variable |

Self-hosted via `@fontsource` (no CDN). See [theme.md](../guides/theme.md) →
*Typography*.

---

## `my-react-shell/providers` — Convex client + `AppProviders`

The single wrapper that composes theme + Convex + (optional) auth above your router.
Needs the optional `convex` peer. **Guide:** [providers.md](../guides/providers.md).

```ts
import { AppProviders, ConvexClientProvider, createConvexClient } from 'my-react-shell/providers'
import type { AppProvidersProps, ConvexClientProviderProps, AuthProvider, AuthProviderProps } from 'my-react-shell/providers'
```

| Export | Kind | Summary |
|---|---|---|
| `AppProviders` | component | Mount once above your router. Composes `ThemeProvider` + Convex client + optional auth. |
| `ConvexClientProvider` | component | Plain (unauthenticated) Convex provider; creates the client once. |
| `createConvexClient(url?)` | function | Builds a `ConvexReactClient` from `VITE_CONVEX_URL`. **Throws** if absent/empty; **rejects** a trailing slash. |
| `AppProvidersProps` | type | Props below. |
| `ConvexClientProviderProps` | type | Props for the plain provider. |
| `AuthProvider` | type | The auth seam (re-exported from the auth module). `ComponentType<AuthProviderProps>`. |
| `AuthProviderProps` | type | `{ client: ConvexReactClient; children: ReactNode }`. |

**`<AppProviders>` props:** `authProvider` (omit → plain unauthenticated Convex app),
`client` (pre-created client; default reads `VITE_CONVEX_URL`), `theme`
(`Omit<ThemeProviderProps, 'children'>`, default `{}`), `children`.

```tsx
<AppProviders authProvider={ConvexAuthDefaultProvider} theme={{ defaultTheme: 'ocean' }}>
  <RouterProvider router={router} />
</AppProviders>
```

> `VITE_CONVEX_URL` is **required and never defaulted** — no trailing slash (breaks
> the Convex sync websocket, close code 1006). The check lives in `createConvexClient`.

---

## `my-react-shell/auth/convex` — Convex Auth default

The shipped default implementation of the auth seam. The **only** place the library
imports `@convex-dev/auth` (keeping it optional). **Guide:** [auth.md](../guides/auth.md).

```ts
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
```

| Export | Kind | Summary |
|---|---|---|
| `ConvexAuthDefaultProvider` | component | An `AuthProvider`: wraps the Convex client in `@convex-dev/auth`'s `ConvexAuthProvider`. Pass to `<AppProviders authProvider={…}>`. |

**The seam (contract):** an auth provider is any `ComponentType<{ client, children }>`.
The `AuthProvider` / `AuthProviderProps` *types* live at `my-react-shell/providers`.
**Bring-your-own** (Better Auth, SSO, MFA): implement `AuthProvider` and pass it to
`<AppProviders>` — never import this sub-path, so `@convex-dev/auth` stays uninstalled.

```tsx
// BYO:
import type { AuthProviderProps } from 'my-react-shell/providers'
function MyAuth({ client, children }: AuthProviderProps) {
  return <BackingProvider client={client}>{children}</BackingProvider>
}
<AppProviders authProvider={MyAuth}>{…}</AppProviders>
```

> The default needs the Convex side configured in your `convex/` backend
> (`@convex-dev/auth` providers, tables, HTTP routes). The seam covers only the React
> client wiring. It ships **no UI** (no sign-in form, no account menu).

---

## `my-react-shell/i18n` — the `t()` seam

Zero-dependency translation: provider + hook, central catalog, `{{param}}`
interpolation, **opt-in compile-time typed keys**, dev missing-key surface.
Convex- and router-free. **Guide:** [i18n.md](../guides/i18n.md).

```ts
import { I18nProvider, useTranslation, useI18n, translateNow, createTypedI18n,
         mergeMessages, MissingTranslationsOverlay, missingKeyStore } from 'my-react-shell/i18n'
import type { TFunction, I18nContextValue, Locale, LocaleInfo, Messages, DotPaths,
              TranslateParams, UseTranslationResult, TypedI18n } from 'my-react-shell/i18n'
```

| Export | Kind | Summary |
|---|---|---|
| `I18nProvider` | component | Owns active locale; persists; detects browser locale. Takes `messages`. |
| `useTranslation(namespace?)` | hook | Returns `{ t, locale, locales, setLocale }`. `namespace` prefixes keys. |
| `useI18n` | hook | Alias of `useTranslation` (foundation-style naming). |
| `useI18nContext()` | hook | Raw context read; throws outside provider. |
| `translateNow(key, params?)` | function | Imperative translate for non-render callers (event handlers, toasts). |
| `createTypedI18n<K>()` | function | Returns typed `{ useTranslation, useT, translateNow }` bound to key union `K`. Pure typing sugar — no new runtime. |
| `mergeMessages(base, override)` | function | Deep-merge catalogs (override wins) — compose a module's strings under a consumer catalog. |
| `flattenMessages(msgs)` | function | Nested catalog → flat dotted map. |
| `interpolate(str, params)` | function | Fill `{{param}}` placeholders. |
| `MissingTranslationsOverlay` | component | Dev-only panel listing missing `key · locale` (gated on `import.meta.env.DEV`). Mount once near root. |
| `missingKeyStore` | object | `subscribe` / `getSnapshot` / `clear` — programmatic missing-key access. |
| `TFunction<K=string>` | type | `(key: K, params?: TranslateParams) => string`. |
| `I18nContextValue<K=string>` | type | `{ t, locale, locales, setLocale }`. |
| `UseTranslationResult<K=string>` | type | Return of `useTranslation`. |
| `NamespacedKeys<K, NS>` | type | Sub-keys of `K` under namespace `NS`. |
| `Locale` | type | `string` (consumer-defined codes: `'en'`, `'nb-NO'`, …). |
| `LocaleInfo` | type | `{ code: Locale; label: string }`. |
| `Messages` | type | Nested catalog: `Record<Locale, nested object>`. |
| `FlatMessages` | type | Flat dotted catalog. |
| `DotPaths<T>` | type | Union of dotted key paths of a catalog object — derive a typed key union from your catalog. |
| `TranslateParams` | type | `Record<string, string \| number>`. |
| `TypedI18n<K>` | type | Shape returned by `createTypedI18n`. |
| `MissingKey` | type | `{ key; locale }` record. |
| `I18nProviderProps`, `MissingTranslationsOverlayProps` | type | Component props. |

**`<I18nProvider>` props:** `messages` **(required**, `Record<locale, nested catalog>`),
`locales`, `defaultLocale` (must be a `messages` key — **throws** otherwise),
`fallbackLocale`, `detectBrowserLocale` (default `true`), `storageKey`, `resolve`
(BYO engine), `onMissingKey`, `debug`, `children`.

```tsx
<I18nProvider messages={{ en: { greeting: 'Hi {{name}}' }, no: { greeting: 'Hei {{name}}' } }}
              locales={[{ code: 'en', label: 'English' }, { code: 'no', label: 'Norsk' }]}
              defaultLocale="en">
  <App />
</I18nProvider>
// inside:
const { t, locale, setLocale } = useTranslation()
t('greeting', { name: 'Kari' })
```

**Typed keys (opt-in):** bind once, import the typed hooks instead of the bare ones.

```ts
// src/i18n.ts
export type Key = DotPaths<typeof en>                       // or hand-write a union
export const { useTranslation, useT, translateNow } = createTypedI18n<Key>()
```

> **Central-key policy:** every user-facing string goes through `t()` against the
> central catalog — no inline literals. **BYO engine:** pass `resolve` to delegate
> lookup (ICU / react-i18next) while keeping locale state + the missing-key surface.

---

## `my-react-shell/components` — opinionated component kit

Composites that bake a design/layout/behavior decision on shadcn/Radix + the theme
tokens. **Un-opinionated primitives (Button/Input/Checkbox/plain Dialog/Tooltip/Card/…)
are NOT shipped — use shadcn directly for those.** This section is the **canonical
reference** for the kit — there is no separate `docs/guides/` file for it.

```ts
import { Alert, cn /* … */ } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css' // REQUIRED (plain prebuilt CSS; also import the theme tokens via my-react-shell/styles.css)
```

| Export(s) | Kind | Summary |
|---|---|---|
| `Alert` | component | Inline alert/callout. `variant`: `info`·`success`·`warning`·`danger`; `title`, `icon`, `onDismiss`, `role`. |
| `InfoBox` | component | Neutral, tone-free contextual note (icon + title + body). Use `Alert` when the message carries a semantic tone. |
| `EmptyState` | component | Centered zero-state: optional icon, required `title`, `description`, action slot. |
| `Spinner`, `PageSpinner`, `SectionSpinner` | component | Rotating indicator on the current text color; block variants center it for page/section loading. |
| `ConfirmDialog` | component | Controlled confirm dialog on Radix Dialog (overlay, focus trap, Esc/backdrop close). `variant="danger"` for destructive; renders its own confirm/cancel buttons. |
| `ToastProvider`, `useToast` | component + hook | Mount provider once; fire toasts via `useToast()` (`.success`/`.error`/…). Each renders as an `Alert`; auto-dismiss (5s; `duration:0` sticky). |
| `ActionButton`, `ActionButtonGroup`, `actionPresets` | component + const | Icon/emoji + label action button with presets (table below). `actionPresets` is the `{ variant, emoji, label }` map. |
| `Badge` | component | Status/category badge; tones `neutral`·`success`·`warning`·`danger`·`info`; optional status `dot`. |
| `Chip`, `ChipGroup` | component | Tag: plain / toggleable (`selected`+`onClick`) / removable (`onRemove`). `ChipGroup` wraps. |
| `Avatar`, `AvatarGroup` | component | Image + initials fallback (also on image error); group stacks with `+N` overflow. |
| `Table` | component | Column-config data table: per-column sort, zebra, sticky header, empty state. |
| `PhiCard`, `PHI` | component + const | Golden-ratio card (W:H = φ:1): a figure (`icon`/`image`) fills its column, a centered text body (`upper` + `content`), and a structured `footer` (meta lines + stacked badges, per-size caps) or freeform `lower`. Collapses when there's no footer. Top-right ⋮ menu via `actions` or a `corner` slot. Uses the `@radix-ui/react-dropdown-menu` optional peer. |
| `StatCard` | component | φ-framed KPI/status card (same size system as PhiCard). Title + subtitle, an optional accent badge circle (plain number+label **or** SVG arc-ring when `badge.max` is set), a stats row, and a structured `footer` or freeform `lower`. Accent stripe (`accentPlacement` top/left) + badge tint driven by `tone` (semantic tokens) or a raw CSS `color`. Optional left-edge completion gauge (`sideBarCompleteness`, red→amber→green) that coexists with the top stripe. Optional emoji `watermark`. Hover-lift via `onClick`/`hoverable`. |
| `InputField` | component | Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`). Spreads native input props; pass `error` to switch on error styling. |
| `SegmentedControl` | component | Single-select `radiogroup` on a track; controlled via `value`/`onChange`; generic over value type. |
| `Select` | component | Opinionated select on Radix Select (keyboard nav, typeahead, portal); `options` list; controlled via `value`/`onValueChange`. |
| `ColorPicker` | component | General popover color picker. **Free** by default — a full hue/saturation range (via the `react-colorful` optional peer); `onChange` emits in `format` (`hex`·`rgb`·`hsl`). Pass a `colors` set to **constrain** it to a swatch grid. Controlled; `value` is a directly-usable CSS color string. See [below](#colorpicker). |
| `UserPreferences` | component | Controlled theme/display settings panel (palette + light/dark/system + optional icons↔emojis). Persists nothing — emits `onChange`. Auth-free (`accountActions` slot). |
| `cn(...)` | function | `clsx` + `tailwind-merge` class combiner. |

Every component has a matching `…Props` type export (e.g. `AlertProps`, `AlertVariant`,
`TableProps`, `TableColumn`, `ToastApi`, `ToastOptions`, `ToastTone`, `SelectProps`,
`SelectOption`, `SegmentedOption`, `BadgeTone`, `AvatarSize`, `ActionType`,
`ActionPreset`, `ActionButtonVariant`/`Size`/`Layout`, `PhiCardProps`, `PhiCardAction`,
`PhiCardSize`, `PhiCardFooter`, `PhiCardFooterLine`, `PhiCardFooterLineType`,
`StatCardProps`, `StatCardBadge`, `StatItem`, `StatCardTone`,
`StatCardFooter`, `StatCardFooterLine`, `StatCardFooterLineType`, `ColorPickerProps`,
`ColorFormat`, etc.).

```tsx
<Alert variant="warning" title="Heads up" onDismiss={() => {}}>Session expires soon.</Alert>

// ConfirmDialog — controlled:
<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete this item?"
  description="This cannot be undone." variant="danger" confirmLabel="Delete"
  onConfirm={() => { setOpen(false) }} />

// Toast — provider once, then imperative:
const toast = useToast()
toast.success('Saved', { title: 'Success' }); toast.error('Something went wrong')

const columns: TableColumn<Row>[] = [{ key: 'name', header: 'Name', render: r => r.name, sortValue: r => r.name }]
<Table columns={columns} data={rows} rowKey={r => r.id} />

<Select value={value} onValueChange={setValue} placeholder="Pick one…"
  options={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana', disabled: true }]} />
```

**`Alert` props:** `variant` (`'info'`), `title`, `children`, `icon` (per-variant; `false`
drops it), `onDismiss` (renders a dismiss button), `dismissLabel` (`'Dismiss'`),
`role` (`'alert'` \| `'status'`), `className`.

### `ActionButton`

An opinionated icon/emoji + label action button. **Presets** (each carries the correct
hand-rolled SVG **and** an emoji, a semantic color, and a default English label):
`add` · `edit` · `delete` · `copy` · `share` · `download` · `upload` · `save` ·
`search` · `refresh` · `settings` · `star` · `close` · `more`. For anything without a
preset, pass a custom `icon` node (a lucide icon or an `<Icon>` from `my-react-shell/icons`).

| Prop | Default | Meaning |
|---|---|---|
| `action` | — | A preset supplying glyph + emoji + color + default label. **Either `action` or `icon` is required.** |
| `icon` | per-preset | Custom glyph node. Required when there's no `action`; overrides the preset glyph otherwise. |
| `emoji` | per-preset | Override the preset emoji (shown when `showEmoji`). |
| `label` | — | Visible label; overrides the preset label. |
| `showLabel` | `false` | Show the preset's default label without retyping it (ignored when `label` is set). |
| `showEmoji` | `false` | Render the emoji instead of the SVG — wire to `useIconMode().isEmoji`. |
| `variant` | preset / `neutral` | `neutral`·`primary`·`secondary`·`success`·`warning`·`danger`·`info`. |
| `size` | `sm` | `xs`·`sm`·`md`·`lg`·`xl` — drives padding, glyph, and label size. |
| `layout` | `vertical` | `vertical` (glyph over label) or `inline` (glyph left of label). |
| `active` | — | For `action="star"`: filled + `aria-pressed` when true. |
| `coloredLabel` | `false` | Let the label take the variant color instead of staying neutral. |
| `hint` | — | Native tooltip (`title` attribute). |
| `disabled` / `type` / `onClick` / `aria-label` / `className` | — | Usual button props; `aria-label` falls back to the visible label, then `hint`, then the preset label. |

```tsx
<ActionButtonGroup>
  <ActionButton action="add" showLabel onClick={onAdd} />
  <ActionButton action="delete" showEmoji={useIconMode().isEmoji} onClick={onDelete} />
  <ActionButton action="star" active={isFavorite} onClick={toggleFavorite} />
  <ActionButton icon={<Upload size={20} />} label="Import" variant="info" onClick={onImport} />
</ActionButtonGroup>
```

### `ColorPicker`

A general, controlled color picker behind a compact popover trigger. Two behaviours,
chosen by whether you constrain it:

- **Free** (default) — a full hue/saturation range (the `react-colorful` optional peer;
  install it when you use `ColorPicker`). `onChange` emits a CSS color string in `format`
  (`hex` · `rgb` · `hsl`). The hex format also gets an editable hex field; rgb/hsl show the
  current value read-only below the canvas.
- **Constrained** — pass a `colors` set and the picker is **limited** to it, shown as a
  `Tab`-navigable swatch grid (the same a11y model as `SegmentedControl`). Each entry may be
  **any** CSS color string; `onChange` emits the picked entry verbatim. `format` is ignored.

It is **controlled** and persists nothing: `value` / `onChange` is always a **directly-usable
CSS color string** — drop it into a `style`/`background`. In free mode pass / read `value` in
the same `format`.

| Prop | Default | Meaning |
|---|---|---|
| `value` | — | Selected color (CSS string). Free mode: in `format`. Constrained: the selected `colors` entry. Omit for "nothing picked". |
| `onChange` | — | Emits the new color string. **Required.** |
| `colors` | — | Constrain to this fixed set (any CSS color strings) as a swatch grid. Omit / `[]` → free pick. |
| `format` | `'hex'` | Free-mode output: `'hex'` (`#rrggbb`) · `'rgb'` (`rgb(…)`) · `'hsl'` (`hsl(…)`). Ignored when `colors` is set. |
| `label` / `description` | — | Field label + helper text above the trigger. |
| `align` | `'start'` | Popover alignment (`start`·`center`·`end`). |
| `placeholder` | `'Pick a color'` | Trigger text when nothing is selected. |
| `disabled` / `aria-label` / `className` | — | Usual control props; `aria-label` falls back to a string `label`. |

```tsx
// Free pick — hex (default):
const [color, setColor] = useState('#3b82f6')
<ColorPicker label="Any color" value={color} onChange={setColor} />

// Free pick — rgb / hsl output:
<ColorPicker format="rgb" value={rgb} onChange={setRgb} /> // → "rgb(59, 130, 246)"
<ColorPicker format="hsl" value={hsl} onChange={setHsl} /> // → "hsl(217, 91%, 60%)"

// Constrained to a fixed set:
<ColorPicker colors={['#ef4444', '#22c55e', '#3b82f6']} value={color} onChange={setColor} />
```

### Surfaces & elevation

Kit components render on the semantic surface ladder (full definition in the
[theme guide](../guides/theme.md#the-surface-ladder)); each role maps to one token:

- **`surface-primary`** — the default card / panel fill: `PhiCard`, `StatCard`, the
  `InputField` / `Select` field, the `ColorPicker` trigger, the active
  `SegmentedControl` item.
- **`surface-raised`** — floating chrome that lifts above the card: `ConfirmDialog`,
  `UserPreferences`, the `Select` menu, the `ColorPicker` popover, the `PhiCard`
  overflow menu.
- **`surface-sunken`** — recessed inset regions (a well below the card): `InfoBox` /
  neutral `Alert`, `Chip`, the `Table` header + zebra rows, the `SegmentedControl` track.
- **`surface-sunken-deep`** — a deeper recess, for filled neutral elements: neutral
  `Badge`, `Avatar`.

Cards and floating chrome also carry a real **elevation** — kit-local box-shadow
geometry over the palette's `--color-shadow-*` shade, so depth tracks light/dark and
a card reads as a lifted layer instead of sitting flat. A soft lift for cards
(deeper on hover) and a stronger ambient for floating chrome (dialogs, menus,
toasts). The geometry is kit-internal (`--mrs-elevation-*`), not a public token.

### `PhiCard`

A golden-ratio card: outer **W:H = φ:1**, the two sections split **φ:1**. The card owns its
padding (`em`-scaled by `size`). A **figure** (`icon` / `image`) fills its column, centered
so the border→figure gap equals the figure→content gap; the **text body** (`upper`
title/subtitle + `content`) carries no padding of its own — it's vertically centered and
flush-left at the φ split (or the edge padding when there's no figure). Pass **both `icon`
and `upper`/`content`** → the original 1 : φ logo-and-title split; `iconFill` makes the icon
fill its column. The **bottom collapses when there's no footer** (`footer`/`lower` absent →
not rendered; the card shrinks to the top band's height `W/φ²`). `size` also sets a base
inherited `font-size`; `PHI` (`1.6180339887`) is exported (height = width / φ).

**Footer** — pass a structured `footer={{ lines, badges }}`: the footer is evenly-spread
**rows**, each pairing the line at index `i` (left, with an optional `date`/`time`/`check`
glyph the kit ships) with the badge at index `i` (right) — so an equal-count footer aligns
line-to-badge. Or use the freeform `lower` node as an escape hatch. **Throws in dev** if both
are given, or if the per-size caps are exceeded — lines: sm 1 · md 2 · lg 3 · xl 5; badges:
sm/md 1 · lg 2 · xl 4. An inset separator divides the sections (only when there's a footer).

Top-right **overflow menu**: pass `actions` and the card renders a ⋮ trigger → Radix
`DropdownMenu` of those items. For anything else use the `corner` slot (replaces the menu).
The kit ships no icon registry and never imports i18n — you bring action glyphs / badges and
pass translated labels. The corner never triggers a clickable card's `onClick`.

| Prop | Default | Meaning |
|---|---|---|
| `upper` | — | Top-section heading (title/subtitle). No own padding — vertically centered, flush-left at the split / edge. With `icon`/`image` it's the content column of the 1 : φ split. |
| `content` | — | Main content under `upper`, in the same centered text body. |
| `image` | — | Image URL, full-bleed (`object-fit: cover`) as the top section. Highest precedence. |
| `imageAlt` | `''` | Alt text for `image` (decorative by default). |
| `icon` | — | Figure node for the top. Alone → centered; with a body → a narrow figure column in the 1 : φ split, centered with equal border/content gaps. |
| `iconFill` | `false` | Scale `icon` to fill its column (aspect preserved, never overflows), overriding the icon's own size. |
| `footer` | — | Structured footer: `{ lines?: { text, type?: 'date'\|'time'\|'check' }[], badges?: ReactNode[] }`. Evenly-spread rows pairing line[i] (left) with badge[i] (right). Per-size caps (throws over). |
| `lower` | — | Freeform footer (escape hatch). **Throws if given alongside `footer`.** |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` = 180/240/320/480px wide (height = width / φ); also sets a base inherited `font-size`. |
| `actions` | — | Items for the built-in ⋮ menu: `{ icon?, label, onSelect, destructive?, disabled? }[]`. Ignored when `corner` is set. |
| `menuIcon` | ⋮ | Override the menu trigger glyph. |
| `menuLabel` | `'Actions'` | Accessible name for the menu trigger. |
| `corner` | — | Bring-your-own top-right node (replaces the `actions` menu). |
| `tone` | — | Semantic accent hue → a stripe (see `accentPlacement`). **Opt-in** — no accent when unset. `primary`·`info`·`success`·`warning`·`danger`·`neutral`. `color` overrides it. |
| `color` | — | Raw CSS color for the accent stripe; overrides `tone`. E.g. `'#7c3aed'` or `'var(--color-primary)'`. |
| `accentPlacement` | `'top'` | Where the accent reads: a `'top'` stripe or a `'left'` bar. |
| `onClick` | — | Click handler for the whole card; the corner never fires it. |
| `hoverable` | `!!onClick` | Hover lift (shadow + pointer). |
| `className` | — | Extra classes on the outer card. |

```tsx
<PhiCard
  size="lg"
  icon={<Hexagon />}
  iconFill
  upper={<><strong>Project Atlas</strong><span className="text-muted-foreground">Logo · title</span></>}
  footer={{
    lines: [{ type: 'date', text: '12 Jun 2026' }, { type: 'check', text: 'Reviewed' }],
    badges: [<Badge key="a" tone="success" dot>Live</Badge>, <Badge key="b">v2</Badge>],
  }}
  actions={[{ icon: <Pencil size={16} />, label: 'Edit', onSelect: onEdit }]}
/>

// no footer → the card collapses to the top band's height (W/φ²):
<PhiCard size="md" upper={<MyHeader />} />
```

### `StatCard`

φ-framed KPI card — same outer dimensions as `PhiCard` (same `size` system, same W:H = φ:1), with a different internal layout: title + subtitle header, an accent badge circle, a data-stats row, and an optional footer or freeform lower slot. Accent stripe + badge tint are driven by `tone` (semantic tokens) or a raw `color` CSS string. An optional left-edge completion gauge (`sideBarCompleteness`) reads independently of the accent, so a top stripe and a side gauge can show at once.

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** |
| `subtitle` | — | Optional subtitle below the title. |
| `badge` | — | `{ value, label?, max? }` — the top-right circle. Plain circle (number + label) when `max` is absent; SVG arc-ring showing `value/max` progress when `max` is set. |
| `tone` | `'neutral'` | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — maps to semantic `--color-*` tokens for the accent stripe and badge tint. |
| `color` | — | Raw CSS color (overrides `tone`). E.g. `'var(--color-primary)'` or `'#7c3aed'`. |
| `accentPlacement` | `'top'` | Where the accent reads: a `'top'` stripe or a `'left'` bar. |
| `sideBarCompleteness` | — | Left-edge completion gauge — a `0`–`1` fraction (clamped). The colored fill rises from the bottom to `value × height`, interpolating **red → amber → green** (`danger → warning → success` tokens) over a faint track. Independent of `accentPlacement`, so it coexists with a top stripe. **Checked, not defaulted:** `undefined` → no gauge; `0` → gauge with an empty fill. Combining with `accentPlacement='left'` throws in dev; in prod the gauge wins and the left accent stripe is suppressed (no overlap). |
| `stats` | — | `{ value, label?, max? }[]` — data items. `label` → label above + number below. `max` → compact arc-ring. **Cannot combine `label` and `max` on the same item** (throws in dev). |
| `footer` | — | `{ lines?, badges? }` — same structured shape as `PhiCard`. Throws if given with `lower`. |
| `lower` | — | Freeform footer node (e.g. a CTA pill via `.mrs-stat-card__cta`). Throws if given with `footer`. |
| `watermark` | — | Emoji rendered as a faint oversized background watermark. E.g. `'🏆'`. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` — same widths as `PhiCard`; height = width / φ. |
| `onClick` | — | Click handler; also enables hover lift. |
| `hoverable` | `!!onClick` | Hover lift (translateY + shadow). |
| `className` | — | Extra classes. |

```tsx
// Plain badge circle:
<StatCard
  size="lg" tone="success" title="Vinnere" subtitle="Unike leverandører"
  badge={{ value: 27, label: 'LEV' }} watermark="🏆"
  stats={[{ value: 18, label: 'Bredde' }, { value: 14, label: 'Spisset' }]}
  lower={<button className="mrs-stat-card__cta" onClick={open}>🏆 Vis resultater →</button>}
  onClick={open}
/>

// Arc-ring badge (badge.max):
<StatCard
  size="lg" tone="warning" title="Leveransemodell"
  badge={{ value: 10, max: 100 }} watermark="📊"
  stats={[{ value: 10, label: 'Vurdert' }, { value: 100, label: 'Totalt' }]}
/>

// Structured footer (same as PhiCard):
<StatCard size="xl" tone="info" title="Project Atlas"
  badge={{ value: 12, label: 'TASKS' }}
  stats={[{ value: 8, label: 'Done' }, { value: 3, label: 'Open' }]}
  footer={{ lines: [{ type: 'date', text: 'Jun 2026' }], badges: [<Badge tone="success">Live</Badge>] }}
/>

// Side completion gauge (red→amber→green) alongside the default top stripe:
<StatCard
  size="lg" tone="info" title="Onboarding" subtitle="Profile completeness"
  badge={{ value: 7, label: 'STEPS' }}
  sideBarCompleteness={0.7}            // 0–1; `0` shows an empty gauge, `undefined` shows none
  stats={[{ value: 7, label: 'Done' }, { value: 3, label: 'Left' }]}
/>
```

> **`.mrs-stat-card__cta`** is a pre-styled CTA pill class for the `lower` slot — brand background, rounded, inherits font-size. Style it yourself or use this shortcut.

### `UserPreferences`

A fully **controlled** theme/display panel in a Radix dialog (palette + light/dark/system
+ an optional icons↔emojis switch). It **persists nothing** — reads each value, emits
`onChange` — so the consumer owns storage. Auth-free; surface sign-out/profile via the
`accountActions` slot. All labels are English defaults; pass translated values via your `t()`.

| Prop | Default | Meaning |
|---|---|---|
| `theme` / `themes` / `onThemeChange` | — | Active palette, the list to offer (`useTheme().themes`), and the change handler. **Required.** |
| `mode` / `onModeChange` | — | Active color mode and its handler. **Required.** |
| `followSystem` / `onFollowSystemChange` | — | Pass both to show a **System** option that follows the OS. |
| `iconMode` / `onIconModeChange` | — | Pass both to show the **icons↔emojis** switch (from `my-react-shell/icons`). |
| `accountActions` | — | Rows below a divider — e.g. a sign-out button. Keeps the kit auth-free. |
| `trigger` | icon button | Override the dialog trigger. |
| `open` / `onOpenChange` | self-managed | Control the open state if you need to. |
| label props | English | `triggerLabel`, `title`, `description`, `themeHeading`, `modeHeading`, `displayHeading`, `lightLabel`, `darkLabel`, `systemLabel`, `iconsLabel`, `emojisLabel`, `closeLabel`. |
| `className` | — | Extra classes on the dialog, merged via `cn()`. |

```tsx
// wire to useTheme() + useIconMode():
<UserPreferences theme={theme} themes={themes} onThemeChange={setTheme}
  mode={mode} onModeChange={setMode}
  followSystem={isSystemMode} onFollowSystemChange={setSystemMode}
  iconMode={iconMode} onIconModeChange={setIconMode} />
```

> The kit **never imports i18n or the icons module**: pass translated label text via
> props, and wire the icons↔emojis swap yourself via `useIconMode().isEmoji`. All labels
> have English defaults. Components are themed **only through the semantic tokens** — change
> a token in your palette and the kit follows, no component edits.

---

## `my-react-shell/icons` — icons↔emojis seam

A *preference* (render icons or emojis) + a thin `<Icon>` glyph↔emoji swap. **No icon
registry, no `lucide-react` dep** — you bring the glyphs. **Guide:** [icons.md](../guides/icons.md).

```ts
import { IconModeProvider, useIconMode, Icon, createIconRenderer } from 'my-react-shell/icons'
import type { IconMode, IconProps, UseIconModeResult, IconModeProviderProps,
  IconModeContextValue, IconGlyph, IconRenderer, CreateIconRendererOptions } from 'my-react-shell/icons'
```

| Export | Kind | Summary |
|---|---|---|
| `IconModeProvider` | component | Owns the icon/emoji preference. Uncontrolled (localStorage) or controlled (`value`+`onChange`). `defaultMode` (`'icon'`), `storageKey`. |
| `useIconMode()` | hook | Returns `{ iconMode, isEmoji, setIconMode, toggleIconMode }`. Throws outside provider. |
| `Icon` | component | `<Icon icon={<Glyph/>} emoji="🎨" size label forceIcon />` — shows one or the other per mode. `forceIcon` always renders the glyph. Defaults to `icon` with no provider. |
| `createIconRenderer(icons, emojis, options?)` | function | Wires a consumer's key→glyph + key→emoji maps into one `renderIcon(key, size, label?)`. `emojis` is typed against `icons`' keys (a missing emoji is a **compile error**), with a **dev** missing-emoji warning as backstop for dynamic maps. `options.force` = keys that stay glyphs in emoji mode (and skip the warning); `fallbackEmoji` (`'●'`), `fallbackGlyph`. Owns no glyphs / no `lucide-react`. |
| `IconMode` | type | `'icon' \| 'emoji'`. |
| `IconGlyph` | type | `(size: number) => ReactNode` — the library-neutral glyph factory `icons` maps to. |
| `IconRenderer` | type | `(key: string, size: number, label?: string) => ReactNode` — drop-in for app-shell's `config.renderIcon`. |
| `IconProps`, `CreateIconRendererOptions`, `UseIconModeResult`, `IconModeProviderProps`, `IconModeContextValue` | type | Props / options / results. |

```tsx
<IconModeProvider><App /></IconModeProvider>

// One renderIcon from your maps — drop into config.renderIcon so the whole UI flips at once.
import type { LucideIcon } from 'lucide-react'
import { Home, Palette } from 'lucide-react'
const glyph = (G: LucideIcon): IconGlyph => (size) => <G size={size} />     // lucide adapter (one-liner)
const ICONS = { home: glyph(Home), palette: glyph(Palette) }               // keys infer a union
const EMOJIS: Record<keyof typeof ICONS, string> = { home: '🏠', palette: '🎨' }  // missing key → compile error
export const renderIcon = createIconRenderer(ICONS, EMOJIS)
```

---

## `my-react-shell/app-shell` — app shell (optional, router-coupled)

Header-or-sidebar chrome + mobile drawer/bottom-nav + single scrolling body,
URL-derived page header (breadcrumbs + actions + search + `subPages` dropdown), the
shell-config contract, and page-tab primitives. Router-coupled (TanStack Router) +
Radix — both optional peers. **Guide:** [app-shell.md](../guides/app-shell.md).

```ts
import { AppShell, ShellPageHeader, PageTabs, PageSections, useDynamicPages,
         defineShellConfig, ShellConfigError, useShellContext } from 'my-react-shell/app-shell'
import type { ShellConfig, ShellConfigInput, PageEntry /* … */ } from 'my-react-shell/app-shell'
import 'my-react-shell/app-shell/styles.css'
```

| Export | Kind | Summary |
|---|---|---|
| `defineShellConfig(input)` | function | Validates (throws `ShellConfigError`) + brands the config at import time. Requires `renderIcon`. |
| `ShellConfigError` | class | Thrown on a bad config shape. |
| `AppShell` | component | Mount once at root. `config`, `useMenu` (sidebar vs banner), `actions[]`, `mobileNav` (`'drawer'`\|`'tabBar'`), `children`. |
| `AppHeader`, `AppMenu`, `AppBottomNav` | component | Chrome sub-parts (usually composed by `AppShell`). |
| `ShellPageHeader` | component | Drop in a route subtree; renders `null`, registers `title`/`actions`/`search`/`tabs` into the pinned header. |
| `findActiveChain` | function | Compute the active breadcrumb chain for a pathname — pure function of `(roots, pathname, dynamicByParent)`. Walks `subPages` recursively at each depth level; merges `useDynamicPages` registrations keyed by parent route. |
| `PageTabs` | component | Route-based tab strip (each tab = a route). Pin via `<ShellPageHeader tabs={…}>`. Scrolls horizontally when it overflows — edge fades + arrow buttons appear on the side(s) with hidden tabs. |
| `PageSections` | component | In-page sections synced to `?<persistKey>=`. Modes `single` / `list` (scrollspy). Its section-tab strip scrolls horizontally on overflow (edge fades + arrows), like `PageTabs`. |
| `useDynamicPages(cfg)` | hook | Register runtime breadcrumb levels (record names, slugs) under a `parent` route. Works at any depth — set `parent` to whichever registered route the dynamic items hang under. |
| `useShellContext()`, `useShellContextOptional()` | hook | Read shell context — incl. `scrollContainer` (the only scroller; use instead of `window`). |

**Contract types:** `PageEntry`, `ShellConfig`, `ShellConfigInput`, `PageContainerMaxWidth`,
`ShellPageContainerConfig`, `ShellTabsConfig`, `ShellTabsVariant`, `ShellPageHeaderConfig`,
`ShellPageHeaderSearchSlot`, `ShellDocumentTitleMode`, `ShellIconRenderer`,
`ShellChromeLabels`, plus component props (`AppShellProps`, `AppShellMobileNav`,
`AppShellContentPadding`, `ShellPageHeaderProps`, `ChainLevel`, `PageTab`, `PageTabsProps`,
`PageSection`, `PageSectionsMode`, `PageSectionsProps`, `DynamicPageInput`,
`DynamicPagesConfig`, `ShellContextValue`).

```tsx
export const shellConfig = defineShellConfig({
  appName: 'Acme',
  renderIcon: (key, size) => { const I = icons[key] ?? Home; return <I size={size} /> }, // REQUIRED
  pages: [{ id: 'dashboard', route: '/dashboard', label: () => t('nav.dashboard'), icon: 'dashboard' }],
})
<AppShell config={shellConfig} useMenu actions={[() => <ThemeToggle/>]} mobileNav="drawer"><Outlet/></AppShell>
```

> **`route: '/'` is reserved.** Never put `/` in `pages` — `defineShellConfig` throws
> `ShellConfigError` if you do. Home is always reachable via the brand link and the
> breadcrumb house icon; it never appears as a named sidebar entry or breadcrumb level.
> Start your first page at a real feature route (e.g. `/dashboard`, `/data`).
>
> **Three navigation layers, each one job:** `pages` (sidebar/banner) → top-level
> areas · `subPages` (hierarchical sub-areas, recursive, each a breadcrumb level; leaf
> gets a sibling-switcher dropdown when ≥2 options exist) → siblings/children within a
> feature · `PageTabs`/`PageSections` → sub-views of one page. **Breadcrumbs are a pure
> function of the URL** — only a registered route (`pages`/`subPages`/`useDynamicPages`)
> adds a crumb; `title` overrides only the leaf label; non-leaf ancestors render as
> clickable links. Strings arrive as thunks (`label: () => t('…')`) — the shell never
> imports i18n.
>
> **`PageEntry` optional fields:** `subPages?: PageEntry[]` — nested entries, each a breadcrumb level and a title-dropdown item. `groupBreak?: true` — draws a sidebar divider before this entry; ignored on the first visible page. `tabBar?: true` — opts the entry into the mobile bottom tab bar (top-level entries only; only when `mobileNav='tabBar'`).
>
> **Multi-level usage demonstrated** in the `my-react-shell-demo` nested-pages route (`src/pages/nested/`): a four-level chain — `pages` → `subPages` (regions) → `subPages` (countries) → `useDynamicPages` (cities).

---

## CSS imports

| Import | What it is | How to use |
|---|---|---|
| `my-react-shell/styles.css` | **Raw Tailwind v4 source** — the `--color-*` token contract + the 5 palettes. **Not precompiled.** | Your build **must run Tailwind v4** (PostCSS or `@tailwindcss/vite`) and have **`tw-animate-css`** installed. Don't `@import 'tailwindcss'` again — this file does. |
| `my-react-shell/components/styles.css` | Plain prebuilt CSS (`mrs-`-prefixed classes on the theme tokens). | Import once. No Tailwind config needed. Requires the theme tokens (above) to be present for theming. |
| `my-react-shell/app-shell/styles.css` | Plain prebuilt CSS for the shell chrome. | Import once when you use the app-shell. |

> **shadcn bridge:** shadcn primitives read their own cssVars (`--background`, …), not
> the `--color-*` contract. Map them once in your `index.css` — the canonical,
> copy-paste mapping is in [theme.md → *Using these tokens with shadcn/ui*](../guides/theme.md).
> It is deliberately **not shipped** (per-app latitude).

---

## Full wiring (typical app)

```tsx
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AppProviders } from 'my-react-shell/providers'
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
import { I18nProvider } from 'my-react-shell/i18n'
import { IconModeProvider } from 'my-react-shell/icons'
import { ToastProvider } from 'my-react-shell/components'
import 'my-react-shell/styles.css'
import 'my-react-shell/components/styles.css'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')!).render(
  <AppProviders authProvider={ConvexAuthDefaultProvider} theme={{ defaultTheme: 'ocean' }}>
    <I18nProvider messages={messages} defaultLocale="en">
      <IconModeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </IconModeProvider>
    </I18nProvider>
  </AppProviders>,
)
```

`AppProviders` already mounts `<ThemeProvider>`. The app-shell (`<AppShell>`) goes
inside your router, at the root route's layout — not here.

## Gotchas (the time-sinks)

- **pnpm only** — never `npm install` (desyncs the lockfile; Convex dev crash-loops).
- **`VITE_CONVEX_URL`: checked, never defaulted; no trailing slash** (close code 1006).
- **`styles.css` is not zero-config** — needs the consumer's Tailwind v4 pipeline +
  `tw-animate-css`. The compiled JS *is* zero-config; the stylesheet is raw source.
- **No router peer.** Nothing in the barrel imports a router; `@tanstack/react-router`
  is a peer **only** for `app-shell`. A consumer picks its own router.
- **404s are the consumer's** — no shipped module owns the router, so neither catch
  lives here. Wire `defaultNotFoundComponent` (or a route's `notFoundComponent`) on
  your router for the *in-app* not-found, rendering the kit's `EmptyState`; add the
  static host's `/(.*)` → `/index.html` rewrite for the *server* 404. See the
  [app-shell guide](../guides/app-shell.md).
- **Semantic tokens only** in any code you add — never hardcode colors; render in
  light *and* dark, every palette.
- **`link:` dev-loop must dedupe React** in the consumer's `vite.config.ts`
  (`resolve.dedupe: ['react', 'react-dom', 'react/jsx-runtime']`) or first paint
  throws `Invalid hook call`. Tag-pinned git-dep installs are unaffected. In a git
  **worktree**, symlink the root `node_modules` in (the standard worktree step) and
  never `pnpm install` inside it — a reinstall duplicates React and defeats the dedupe.
  See [distribution-model.md](../guides/distribution-model.md).
- **Updating:** bump the pinned git tag (`#vX.Y.Z`) and reinstall — you receive only
  the modules you import.

## See also

- Per-module deep guides (rationale + contract beyond this reference): [theme](../guides/theme.md) ·
  [providers](../guides/providers.md) · [auth](../guides/auth.md) · [i18n](../guides/i18n.md) ·
  [icons](../guides/icons.md) · [app-shell](../guides/app-shell.md). The **components** module
  has no separate guide — this reference is its canonical doc.
- [concept.md](../concept.md) — what this is and its boundary
- [distribution-model.md](../guides/distribution-model.md) — install, tags, the local dev-loop
- New React project from scratch: the `react-framework` skill
