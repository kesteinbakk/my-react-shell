---
title: API reference
summary: >
  The complete public API of my-react-shell — every export, per import path,
  with signatures and minimal usage. The fast index the per-module guides aren't.
status: current
area: all modules
last_updated: 2026-06-24
---

# my-react-shell — API reference

The complete public surface, organised by import path. This is the **fast index**:
every export, what it is, and the minimum to use it. For the *why* and the deeper
contract of any module, follow the **Guide** link in its section.

> **Mental model.** my-react-shell is a *support and starting base for React projects* —
> the React counterpart to the SolidJS `foundation` — shipped as self-contained modules.
> The barrel `my-react-shell` is the **Convex-free theme core**; anything heavier lives
> behind a sub-path so a theme-only app installs nothing it doesn't use. Import only the
> modules you want. See [concept.md](../concept.md).

## Import-path map

| Import path | Module | Needs (optional peers) | CSS to import |
|---|---|---|---|
| `my-react-shell` | **theme** (core) | — (just `react`) | `my-react-shell/styles.css` |
| `my-react-shell/providers` | **providers** (Convex client + `AppProviders`) | `convex` | — |
| `my-react-shell/auth/convex` | **auth** Convex Auth default | `convex`, `@convex-dev/auth`, `@auth/core` | — |
| `my-react-shell/i18n` | **i18n** (`t()` seam) | — (zero-dep) | — |
| `my-react-shell/components` | **component kit** (UI components on Radix + the theme tokens) | `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-{dialog,dropdown-menu,popover,select,accordion,collapsible,checkbox,switch,radio-group,tooltip,tabs,slider,progress,toggle,toggle-group}`, `react-colorful` (only for `ColorPicker`), `react-day-picker` + `date-fns` (only for `Calendar`/`DatePicker`), `emojibase-data` (only for `EmojiPicker`) | `my-react-shell/components/styles.css` |
| `my-react-shell/icons` | **icons↔emojis seam** | — (pure React) | — |
| `my-react-shell/app-shell` | **app-shell** (chrome, page header, tabs) | `@tanstack/react-router`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu` | `my-react-shell/app-shell/styles.css` |

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

## `my-react-shell/components` — component kit

Components built on Radix + the theme tokens (rendered with `mrs-`-prefixed plain CSS),
so a consumer needs **no shadcn**. This section is the **canonical reference** for the
kit — there is no separate `docs/guides/` file for it.

```ts
import { Alert, cn /* … */ } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css' // REQUIRED (plain prebuilt CSS; also import the theme tokens via my-react-shell/styles.css)
```

| Export(s) | Kind | Summary |
|---|---|---|
| `Button` | component | The kit's button. `variant` (solid·soft·outline·ghost·link) × `tone` × `size` (sm·md·lg); native `<button>` props pass through and the `ref` is forwarded to the `<button>`, so it works as a Radix `asChild` trigger (Popover / Tooltip / Dropdown). `leadingIcon`/`trailingIcon` slots for icon+text layouts. |
| `HeaderMenuButton` | component | Ghost neutral small button for the header action zone — a `<DropdownMenu trigger>` with visible label text and an automatic trailing chevron. `leadingIcon` slot for a view/mode icon before the label. All native `<button>` attributes (`aria-label`, `title`, `disabled`, …) pass through. |
| `Input` | component | Un-opinionated native `<input>`. `invalid` (sets `aria-invalid` + error styling), `inputSize` (sm·md·lg; named so it never clashes with native `size`), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'saving'`·`'saved'`·`'error'`); native input props pass through. |
| `Textarea` | component | Un-opinionated native `<textarea>`. `invalid` (sets `aria-invalid` + error styling), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'saving'`·`'saved'`·`'error'`); native textarea props pass through. |
| `Label` | component | Un-opinionated native `<label>`. `required` appends a subtle decorative (`aria-hidden`) marker; native label props pass through. |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | component | Un-opinionated surface container + parts (`CardTitle` → `<h3>`, `CardDescription` → `<p>`); each spreads native `<div>` props. `--color-surface-primary` panel, bordered, rounded, card elevation. |
| `Separator` | component | Un-opinionated divider. `role="separator"` with `orientation` (`horizontal`·`vertical`) + `aria-orientation`; native `<div>` props pass through. |
| `Skeleton` | component | Un-opinionated pulsing loading placeholder (decorative, `aria-hidden`). Size it with `style`/`className`; native `<div>` props pass through. |
| `Dialog` | component | General controlled dialog on Radix Dialog (overlay, focus trap, portal). `title`/`description`, `children` body, `footer` actions, `showClose` ✕; renders no buttons of its own (use `ConfirmDialog` for confirm/cancel). `size` (`sm`·`md`·`lg`·`xl`·`full`); the body scrolls within a viewport-capped card. `titleActions` puts a control on the heading row (the heading stays the accessible name); `bleed` drops the kit chrome for a full-bleed / custom-layout dialog (`title` kept as a visually-hidden accessible name, consumer owns the inner layout); `closeOnBackdrop`/`closeOnEsc` (default `true`) guard dismissal, e.g. to protect unsaved edits. |
| `Popover` | component | Simple, opinionated floating panel on Radix Popover (focus management, outside-click / Esc close, portal). `trigger` anchor + `children` panel; controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`); `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-popover` optional peer. |
| `DropdownMenu` | component | Data-driven menu on Radix DropdownMenu (keyboard nav, outside-click / Esc close, portal). Anchor via `trigger` (any node, `asChild`) **or** `iconTrigger` (an icon element; the kit renders its own square ghost button, accessible via `iconTriggerLabel`). `onOpenChange(open)` fires on open/close. `items` — a discriminated union of `item` (plain action, closes on select; carries `icon`/`disabled`/`danger`) · `separator` · `label` · `checkbox` (independent toggle, controlled `checked`/`onCheckedChange`) · `radio-group` (one-of-a-group, controlled `value`/`onValueChange` + `options`) · `submenu` (nested `items`, arbitrary depth). Checkbox/radio rows keep the menu open by default (per-item `closeOnSelect` to close); selected/checked state is fully consumer-controlled. `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-dropdown-menu` optional peer. |
| `Alert` | component | Inline alert/callout. `tone`: `info`·`success`·`warning`·`danger`; `title`, `icon`, `onDismiss`, `role`. |
| `InfoBox` | component | Neutral, tone-free contextual note (icon + title + body). Use `Alert` when the message carries a semantic tone. |
| `EmptyState` | component | Centered zero-state: optional icon, required `title`, `description`, action slot. |
| `Spinner`, `PageSpinner`, `SectionSpinner` | component | Rotating indicator on the current text color; block variants center it for page/section loading. |
| `ConfirmDialog` | component | Controlled confirm dialog on Radix Dialog (overlay, focus trap, Esc/backdrop close). `tone="danger"` for destructive; renders its own confirm/cancel buttons. |
| `ToastProvider`, `useToast` | component + hook | Mount provider once; fire toasts via `useToast()` (`.success`/`.error`/…). Each renders as an `Alert`; auto-dismiss (5s; `duration:0` sticky). |
| `ActionButton`, `ActionButtonGroup`, `actionPresets` | component + const | Icon/emoji + label action button with presets (table below). `actionPresets` is the `{ tone, emoji, label }` map. |
| `Badge` | component | Status/category badge; tones `primary`·`neutral`·`success`·`warning`·`danger`·`info` (`primary` is a solid pill); optional status `dot`. Forwards standard `<span>` attributes (`title`, `aria-*`, `data-*`, `id`, events) to the root. |
| `CountPill` | component | Small solid-fill numeric count pill (unread counts, tab counts, a bell overlay). `count`; tones `primary`·`secondary`·`success`·`warning`·`danger`·`info`; clamps at `max` (default `99` → `99+`), `tabular-nums`. Caller gates visibility and positions any overlay via `className`. Forwards standard `<span>` attributes. |
| `Chip`, `ChipGroup` | component | Tag: plain / toggleable (`selected`+`onClick`) / removable (`onRemove`). `ChipGroup` wraps. |
| `Avatar`, `AvatarGroup` | component | Image + initials fallback (also on image error); falls back to a person icon/emoji when no `fallback` is set (`showEmoji` follows the icons↔emojis seam); group stacks with `+N` overflow. |
| `Table` | component | Column-config data table: per-column sort, zebra, sticky header, empty state. Whole-row click (`onRowClick`, suppressed for clicks on in-cell controls/expand cells), an expandable per-row detail region (`renderExpanded`, kit-owned disclosure toggle + open state, full-width below the row; supply `renderDisclosure(row, isOpen, toggle)` to replace the kit's chevron with a consumer-styled control), per-cell expansion (`TableColumn.cellExpand(row)` — clicking cells in that column toggles a detail region keyed to that column, radio-style; one cell open at a time), per-row emphasis (`rowVariant`: `default`·`muted`·`selected`), and `frameless` to drop the wrapper border/radius when nesting inside a `Card`. `columns` is a plain array, so a dynamic column set can be built at render time. `TableColumn.align` sets the alignment for both the header and content cells equally (default `left`); `TableColumn.headerAlign` overrides alignment for just the header, leaving content at `align`. |
| `PhiCard`, `PHI` | component + const | Golden-ratio card (W:H = φ:1): a figure (`icon`/`image`) fills its column, a centered text body (`upper` + `content`), and a structured `footer` (meta lines + stacked badges, per-size caps) or freeform `lower`. Collapses when there's no footer. Top-right ⋮ menu via `actions` or a `corner` slot. Uses the `@radix-ui/react-dropdown-menu` optional peer. |
| `StatCard` | component | φ-framed KPI/status card (same size system as PhiCard). Title + subtitle, an optional accent badge circle (plain number+label **or** SVG arc-ring when `badge.max` is set), a stats row **or** a freeform `body` center slot (vertically centered; suppresses stats), and a structured `footer` or freeform `lower`. Accent stripe (`accentPlacement` top/left) + badge tint driven by `tone` (semantic tokens) or a raw CSS `color`. `variant` (`'warning'`·`'danger'`) overrides tone, forces ⚠️ watermark, and colors `body` text to match. Optional left-edge completion gauge (`sideBarCompleteness`, red→amber→green) that coexists with the top stripe, or drives the whole accent's color via `topStripeFollowsGauge`. Optional emoji `watermark`. Hover-lift via `onClick`/`hoverable`. |
| `InputField` | component | Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`). Spreads native input props; pass `error` to switch on error styling. `inputSize` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale. `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'saving'`·`'saved'`·`'error'`). |
| `SegmentedControl` | component | Single-select `radiogroup` on a track; controlled via `value`/`onChange`; generic over value type. |
| `Select` | component | Opinionated select on Radix Select (keyboard nav, typeahead, portal); `options` list; controlled via `value`/`onValueChange`; `size` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale. |
| `Checkbox` | component | Un-opinionated checkbox on Radix Checkbox; tri-state (`checked` · unchecked · `'indeterminate'`); hand-rolled check/dash glyph; checked box fills `--color-primary`. Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`/`required`). Uses the `@radix-ui/react-checkbox` optional peer. |
| `Switch` | component | Un-opinionated toggle on Radix Switch; track + sliding thumb (checked track `--color-primary`). Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`). Uses the `@radix-ui/react-switch` optional peer. |
| `RadioGroup` | component | Single-select set on Radix RadioGroup with roving arrow-key focus; data-driven via `options`; selected dot fills `--color-primary`; `orientation` (`vertical`·`horizontal`). Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`); form-aware (`name`). Uses the `@radix-ui/react-radio-group` optional peer. |
| `ColorPicker` | component | General popover color picker. **Free** by default — a full hue/saturation range (via the `react-colorful` optional peer); `onChange` emits in `format` (`hex`·`rgb`·`hsl`). Pass a `colors` set to **constrain** it to a swatch grid. Controlled; `value` is a directly-usable CSS color string. `placeholder` is **required** — pass a translated string. See [below](#colorpicker). |
| `UserPreferences` | component | Controlled theme/display settings panel (palette + light/dark/system + optional icons↔emojis). Persists nothing — emits `onChange`. Auth-free (`accountActions` slot). |
| `Collapsible` | component | Single disclosure on Radix Collapsible: one trigger toggles one region. Controlled (`expanded`) / uncontrolled (`defaultExpanded`); static `trigger` or `renderTrigger(expanded)`; rotating chevron; `variant` (`default`·`bordered`·`ghost`·`filled`), `size`, `inlineChevron`, `animationDuration`. Uses the `@radix-ui/react-collapsible` optional peer. See [below](#collapsible). |
| `Accordion` | component | Grouped disclosures on Radix Accordion: roving arrow-key focus, single (one-open) or `multiple` open. Data-driven via `items`; controlled `value`/`onValueChange` or `defaultValue`; `variant` (`default`·`bordered`·`separated`), `size`. Uses the `@radix-ui/react-accordion` optional peer. See [below](#accordion). |
| `Tabs` | component | General content tabs on Radix Tabs (roving arrow-key focus, `aria` wiring): a trigger list over swappable panels, active trigger marked with a `--color-primary` indicator. Data-driven via `tabs`; controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`, defaults to first); `orientation` (`horizontal`·`vertical`). Distinct from the app-shell page tabs. Uses the `@radix-ui/react-tabs` optional peer. |
| `Tooltip` | component | Ergonomic single-component tooltip on Radix Tooltip — `content` + `children` (the trigger); mounts its own `Provider` internally, portals the bubble. `side`/`align`/`sideOffset`/`delayDuration`; optional controlled `open`/`onOpenChange`. Uses the `@radix-ui/react-tooltip` optional peer. |
| `Slider` | component | Un-opinionated range slider on Radix Slider; track + filled range + one thumb per value (pass a one- or two-element `value` for single/range), keyboard- and form-aware. `min`/`max`/`step`/`minStepsBetweenThumbs`, `orientation` (`horizontal`·`vertical`), `tone` (fill colour, default `primary`). Controlled (`value`/`onValueChange`, plus `onValueCommit`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-slider` optional peer. |
| `Progress` | component | Un-opinionated progress bar on Radix Progress; fill paints with `tone` (default `primary`), `size` (`sm`·`md`·`lg`). Pass numeric `value` (`0…max`) for a determinate bar or `null`/omit for an indeterminate loop. Radix wires the ARIA. Uses the `@radix-ui/react-progress` optional peer. |
| `Toggle` | component | Un-opinionated two-state button on Radix Toggle; pressed fills `--color-primary-bg`. `variant` (`ghost`·`outline`), `size` (`sm`·`md`·`lg`). Controlled (`pressed`/`onPressedChange`) or uncontrolled (`defaultPressed`). Uses the `@radix-ui/react-toggle` optional peer. |
| `ToggleGroup` | component | Un-opinionated set of toggle buttons on Radix ToggleGroup; data-driven via `options`. `type="single"` (value is the chosen string, or `undefined`) or `type="multiple"` (value is an array); shared `variant`/`size`. Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-toggle-group` optional peer. |
| `Sheet` | component | Overlay panel that slides in from any edge on Radix Dialog (focus trap, Esc/outside-click close, portal). `side` (`left`·`right`·`top`·`bottom`), `size` (`sm`·`md`·`lg`·`xl`·`full` — width for left/right, height for top/bottom). Optional `trigger`; built-in header (`title`/`header`/`description` + ✕ `showClose`) or `bare` (child owns the panel). `scrim={false}` + `modal={false}` for a non-blocking float over a still-interactive page. Controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`). Uses the `@radix-ui/react-dialog` optional peer. |
| `Calendar` | component | Themed month-grid calendar on `react-day-picker`; single/multiple/range selection (`mode`/`selected`/`onSelect`), full keyboard nav + ARIA, rendered against the tokens via `mrs-` classes (no react-day-picker stylesheet needed). Forwards every react-day-picker prop (`disabled`, `startMonth`/`endMonth`, `numberOfMonths`, `captionLayout`, …). Uses the `react-day-picker` + `date-fns` optional peers. |
| `DatePicker` | component | Single-date field — a trigger button (showing the picked date, `displayFormat` via date-fns) that opens a `Calendar` in a Radix Popover; closes on pick. `disabledDays` (a react-day-picker matcher), `startMonth`/`endMonth`. Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`). Uses the `react-day-picker` + `date-fns` + `@radix-ui/react-popover` optional peers. |
| `EmojiPicker` | component | Full emoji picker panel — search input, scrollable category tabs (with a frequently-used tab), and an 8-column emoji grid. Ships no popover or trigger; embed inline or drop into a `<Popover>`. `onSelect(emoji)` receives the emoji character string. `locale` (default `'en'`; `'nb'` also bundled, others fall back to `'en'`), `showSearch` (default `true`), `searchPlaceholder` (default `'🔍'`), `noResultsLabel` (default `'🤷'`) — both accept translated strings. Requires the `emojibase-data` optional peer. |
| `EmojiEmpty` | component | Muted rounded-box placeholder (`+`) sized to one emoji slot. Use as the unset-value display in any trigger or display that shows a selected emoji — visually distinct from real emoji content so the empty state is never mistaken for a selection. Optional `className`. |
| `EmojiBar`, `EMOJI_FREQUENT` | component + const | Compact strip of quick-access emoji buttons — no search, no categories. `emojis` defaults to `EMOJI_FREQUENT` (the 12-emoji frequent set). `onSelect(emoji)` called on click. Pass a custom `emojis` array for any set. No peer dependency. |
| `useDebounce(callback, delayMs)` | hook | Returns a stable debounced wrapper for `callback`. The wrapper schedules `callback` to fire `delayMs` ms after the last call; a new call within the window resets the timer. Pending timer cancelled on unmount. |
| `cn(...)` | function | `clsx` + `tailwind-merge` class combiner. |

Every component has a matching `…Props` type export (e.g. `ButtonProps`, `ButtonVariant`,
`ButtonSize`, `HeaderMenuButtonProps`, `InputProps`, `InputSize`, `TextareaProps`, `LabelProps`, `CardProps`
(+ `CardHeaderProps`/`CardTitleProps`/`CardDescriptionProps`/`CardContentProps`/`CardFooterProps`),
`SeparatorProps`, `SeparatorOrientation`, `SkeletonProps`, `DialogProps`, `DialogSize`,
`PopoverProps`, `PopoverAlign`, `PopoverSide`, `DropdownMenuProps`, `DropdownMenuItem`,
`DropdownMenuActionItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroupItem`,
`DropdownMenuRadioOption`, `DropdownMenuSubmenuItem`,
`AlertProps`, `AlertTone`,
`TableProps`, `TableColumn`, `TableRowVariant`, `ToastApi`, `ToastOptions`, `ToastTone`, `SelectProps`,
`SelectOption`, `SelectSize`, `SegmentedOption`, `BadgeTone`, `CountPillProps`, `CountPillTone`, `AvatarSize`, `ActionType`,
`ActionPreset`, `ActionButtonTone`/`Size`/`Layout`, `PhiCardProps`, `PhiCardAction`,
`PhiCardSize`, `PhiCardFooter`, `PhiCardFooterLine`, `PhiCardFooterLineType`,
`StatCardProps`, `StatCardBadge`, `StatItem`, `StatCardTone`, `StatCardVariant`,
`StatCardFooter`, `StatCardFooterLine`, `StatCardFooterLineType`, `ColorPickerProps`,
`ColorFormat`, `CollapsibleProps`, `CollapsibleVariant`, `CollapsibleSize`,
`AccordionProps`, `AccordionItem`, `AccordionVariant`, `AccordionSize`,
`CheckboxProps`, `SwitchProps`, `RadioGroupProps`, `RadioOption`,
`TabsProps`, `TabItem`, `TooltipProps`, `SliderProps`, `ProgressProps`, `ProgressSize`,
`ToggleProps`, `ToggleVariant`, `ToggleSize`, `ToggleGroupProps`, `ToggleGroupOption`,
`ToggleGroupSingleProps`, `ToggleGroupMultipleProps`, `SheetProps`, `SheetSide`,
`SheetSize`, `CalendarProps`, `DatePickerProps`, `EmojiPickerProps`, `EmojiBarProps`, etc.).

**Semantic colour is one shared vocabulary.** The kit exports a canonical **`Tone`**
type (`primary`·`neutral`·`info`·`success`·`warning`·`danger`) and its **`TONE_COLOR`**
`--color-*` map. Every `tone` prop uses `Tone` or a documented narrowing of it (`Alert`
and `Toast` drop `primary`/`neutral` — a neutral note is `InfoBox`; `ConfirmDialog` is
`neutral`/`danger`). **`variant`** is reserved for *structural* style only
(`Collapsible`, `Accordion`).

```tsx
<Alert tone="warning" title="Heads up" onDismiss={() => {}}>Session expires soon.</Alert>

// ConfirmDialog — controlled:
<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete this item?"
  description="This cannot be undone." tone="danger" confirmLabel="Delete"
  onConfirm={() => { setOpen(false) }} />

// Toast — provider once, then imperative:
const toast = useToast()
toast.success('Saved', { title: 'Success' }); toast.error('Something went wrong')

const columns: TableColumn<Row>[] = [{ key: 'name', header: 'Name', render: r => r.name, sortValue: r => r.name }]
<Table columns={columns} data={rows} rowKey={r => r.id} />

<Select value={value} onValueChange={setValue} placeholder="Pick one…"
  options={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana', disabled: true }]} />

// Badge with a native tooltip (no wrapper span):
<Badge tone="neutral" title="Below the award cutoff">Below cutoff</Badge>

// CountPill — caller gates visibility + positions the overlay:
<span className="relative inline-flex">
  <BellIcon />
  {unread > 0 ? <CountPill tone="danger" count={unread} className="absolute -top-1 -right-1" /> : null}
</span>
```

**`Alert` props:** `tone` (`'info'`), `title`, `children`, `icon` (per-tone; `false`
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
| `tone` | preset / `neutral` | `primary`·`neutral`·`info`·`success`·`warning`·`danger`. |
| `size` | `sm` | `xs`·`sm`·`md`·`lg`·`xl` — drives padding, glyph, and label size. |
| `layout` | `vertical` | `vertical` (glyph over label) or `inline` (glyph left of label). |
| `active` | — | For `action="star"`: filled + `aria-pressed` when true. |
| `coloredLabel` | `false` | Let the label take the variant color instead of staying neutral. |
| `hint` | — | Native tooltip (`title` attribute). |
| `disabled` / `type` / `onClick` / `aria-label` / `className` | — | Usual button props; `aria-label` falls back to the visible label, then `hint`, then the preset label. |

All other native `<button>` attributes pass straight through to the `<button>`, and the
`ref` is forwarded to it — so an `ActionButton` works directly as a Radix `asChild`
trigger (e.g. a `Popover` / `Tooltip` / `DropdownMenu` anchor) with no wrapper element.

> **Header band forces inline.** The `vertical` default is for standalone toolbars and
> action grids. An `ActionButton` placed in the page-header band's `actions` slot (via
> `usePageHeader({ actions })`) always renders **inline** (glyph before label) regardless
> of `layout` — the app-shell stylesheet overrides it, because a stacked label blows out
> the header band's height. Pass `layout="inline"` there anyway for clarity; icon-only
> actions are unaffected.

```tsx
<ActionButtonGroup>
  <ActionButton action="add" showLabel onClick={onAdd} />
  <ActionButton action="delete" showEmoji={useIconMode().isEmoji} onClick={onDelete} />
  <ActionButton action="star" active={isFavorite} onClick={toggleFavorite} />
  <ActionButton icon={<Upload size={20} />} label="Import" tone="info" onClick={onImport} />
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
| `placeholder` | — | Trigger text when nothing is selected. **Required** — pass a translated string via your i18n seam. |
| `disabled` / `aria-label` / `className` | — | Usual control props; `aria-label` falls back to a string `label`. |

```tsx
// Free pick — hex (default):
const [color, setColor] = useState('#3b82f6')
<ColorPicker label="Any color" placeholder={t('color.pick')} value={color} onChange={setColor} />

// Free pick — rgb / hsl output:
<ColorPicker format="rgb" placeholder={t('color.pick')} value={rgb} onChange={setRgb} />
<ColorPicker format="hsl" placeholder={t('color.pick')} value={hsl} onChange={setHsl} />

// Constrained to a fixed set:
<ColorPicker colors={['#ef4444', '#22c55e', '#3b82f6']} placeholder={t('color.pick')} value={color} onChange={setColor} />
```

### `Collapsible`

A single disclosure — one trigger toggling one collapsible region — on Radix
Collapsible (open-state management, `aria-expanded`/`aria-controls`, the
`--radix-collapsible-content-height` var the height animation reads). Works
**controlled** (`expanded` + `onExpandedChange`) or **uncontrolled**
(`defaultExpanded`). For a set of disclosures with one-open-at-a-time /
roving-focus behavior, use [`Accordion`](#accordion).

| Prop | Default | Meaning |
|---|---|---|
| `trigger` | — | Static trigger content. |
| `renderTrigger` | — | `(expanded) => node` — trigger as a function of the open state; takes precedence over `trigger`. |
| `children` | — | The revealed content. |
| `expanded` | — | Controlled open state. Omit for uncontrolled. |
| `defaultExpanded` | `false` | Initial open state when uncontrolled. |
| `onExpandedChange` | — | Fires on every open-state change (controlled + uncontrolled). |
| `variant` | `'default'` | Trigger surface: `default`·`bordered`·`ghost`·`filled`. |
| `size` | `'md'` | Trigger padding + type scale: `sm`·`md`·`lg`. |
| `showArrow` | `true` | Render the rotating chevron. |
| `inlineChevron` | `false` | Chevron directly after the label instead of pushed to the right edge. |
| `animationDuration` | `200` | Expand/collapse duration (ms). |
| `disabled` | — | Disable the trigger. |
| `className` / `triggerClassName` / `contentClassName` / `arrowClassName` | — | Class overrides on root / trigger / content / chevron. |

```tsx
// Uncontrolled, open by default:
<Collapsible defaultExpanded trigger="Shipping & returns">
  <p>Free shipping over 500 kr…</p>
</Collapsible>

// Controlled, trigger reflects state:
const [open, setOpen] = useState(false)
<Collapsible variant="bordered" expanded={open} onExpandedChange={setOpen}
  renderTrigger={(o) => <span>{o ? 'Hide details' : 'Show details'}</span>}>
  <p>…</p>
</Collapsible>
```

### `Accordion`

A vertical set of disclosures with group behavior — roving arrow-key focus between
headers, and single (one-open-at-a-time) or multiple-open mode — on Radix Accordion.
**Data-driven** via `items`; the open set is **controlled** (`value` /
`onValueChange`) or **uncontrolled** (`defaultValue`). For a lone trigger+region,
use [`Collapsible`](#collapsible).

`AccordionItem`: `{ value: string; trigger: ReactNode; content: ReactNode; disabled?: boolean }`.

| Prop | Default | Meaning |
|---|---|---|
| `items` | — | The panels, in order (`AccordionItem[]`). **Required.** |
| `type` | `'single'` | `single` (one open at a time) or `multiple` (independent). |
| `collapsible` | `true` | For `type="single"`, allow closing the open panel so none is open. Ignored for `multiple`. |
| `value` | — | Controlled open value(s): `string` for `single`, `string[]` for `multiple`. |
| `defaultValue` | — | Uncontrolled initial open value(s) — same shape as `value`. |
| `onValueChange` | — | Fires on open-set change — same shape as `value`. |
| `variant` | `'default'` | `default` (flat list + dividers) · `bordered` (one bordered container) · `separated` (each item its own card). |
| `size` | `'md'` | Trigger + body padding/type: `sm`·`md`·`lg`. |
| `showArrow` | `true` | Render the rotating chevron on each item. |
| `animationDuration` | `200` | Expand/collapse duration (ms). |
| `className` | — | Class override on the root. |

```tsx
const items = [
  { value: 'a', trigger: 'First', content: <p>…</p> },
  { value: 'b', trigger: 'Second', content: <p>…</p> },
]
// Single (default) — opening one closes the rest:
<Accordion variant="bordered" defaultValue="a" items={items} />

// Multiple — independent:
<Accordion type="multiple" variant="separated" defaultValue={['a', 'b']} items={items} />
```

### Surfaces & elevation

Kit components render on the semantic surface ladder (full definition in the
[theme guide](../guides/theme.md#the-surface-ladder)); each role maps to one token:

- **`surface-primary`** — the default card / panel fill: `PhiCard`, `StatCard`, the
  `InputField` / `Select` field, the `ColorPicker` trigger, the active
  `SegmentedControl` item, the `Accordion` `bordered` / `separated` container.
- **`surface-raised`** — floating chrome that lifts above the card: `ConfirmDialog`,
  `UserPreferences`, the `Select` menu, the `ColorPicker` popover, the `PhiCard`
  overflow menu.
- **`surface-sunken`** — recessed inset regions (a well below the card): `InfoBox` /
  neutral `Alert`, `Chip`, the `Table` header + zebra rows, the `SegmentedControl`
  track, the `filled` `Collapsible` trigger.
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

φ-framed KPI card — same outer dimensions as `PhiCard` (same `size` system, same W:H = φ:1), with a different internal layout: title + subtitle header, an accent badge circle, a data-stats row, and an optional footer or freeform lower slot. Accent stripe + badge tint are driven by `tone` (semantic tokens) or a raw `color` CSS string. An optional left-edge completion gauge (`sideBarCompleteness`) reads independently of the accent, so a top stripe and a side gauge can show at once — or, with `topStripeFollowsGauge`, the whole accent takes the gauge's completeness color.

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Auto-fits: a very long title steps its font size down in up to three steps (by character count) so it stays within ~two lines without resizing the card. Short titles are unaffected. |
| `subtitle` | — | Optional subtitle below the title. |
| `badge` | — | `{ value, label?, max? }` — the top-right circle. Plain circle (number + label) when `max` is absent; SVG arc-ring showing `value/max` progress when `max` is set. |
| `tone` | `'neutral'` | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — maps to semantic `--color-*` tokens for the accent stripe and badge tint. |
| `color` | — | Raw CSS color (overrides `tone`). E.g. `'var(--color-primary)'` or `'#7c3aed'`. |
| `accentPlacement` | `'top'` | Where the accent reads: a `'top'` stripe or a `'left'` bar. |
| `sideBarCompleteness` | — | Left-edge completion gauge — a `0`–`1` fraction (clamped). The colored fill rises from the bottom to `value × height`, interpolating **red → amber → green** (`danger → warning → success` tokens) over a faint track. Independent of `accentPlacement`, so it coexists with a top stripe. **Checked, not defaulted:** `undefined` → no gauge; `0` → gauge with an empty fill. Combining with `accentPlacement='left'` throws in dev; in prod the gauge wins and the left accent stripe is suppressed (no overlap). |
| `topStripeFollowsGauge` | `false` | When `true`, the **whole accent** (top stripe + badge tint + stat numbers) takes the gauge's completeness color instead of `tone`/`color`, so the card reads as one coherent color, and the stripe is forced to the top edge. Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is present — `undefined` → **no top stripe** (badge + stats fall back to `tone`/`color`). Throws in dev if combined with `accentPlacement='left'`. |
| `stats` | — | `{ value, label?, max? }[]` — data items. `label` → label above + number below. `max` → compact arc-ring. **Cannot combine `label` and `max` on the same item** (throws in dev). Suppressed (not rendered) when `body` is set. |
| `body` | — | Freeform center slot — vertically centered between the header and `lower`/`footer`. When set, `stats` are not rendered. Body text is accent-colored when `variant` is active. |
| `variant` | — | `'warning'` · `'danger'` — structural alert variant. Overrides `tone` to the same value (accent stripe, badge tint, and body text all reflect the variant hue) and forces `⚠️` as the watermark background emoji, ignoring the `watermark` prop. |
| `footer` | — | `{ lines?, badges? }` — same structured shape as `PhiCard`. Throws if given with `lower`. |
| `lower` | — | Freeform footer node (e.g. a CTA pill via `.mrs-stat-card__cta`). Throws if given with `footer`. |
| `watermark` | — | Emoji rendered as a faint oversized background watermark. E.g. `'🏆'`. Ignored when `variant` is set. |
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

// One coherent color — top stripe + badge + stat numbers all follow the gauge:
<StatCard
  size="lg" title="Onboarding" subtitle="Profile completeness"
  badge={{ value: 7, label: 'STEPS' }}
  sideBarCompleteness={0.85}
  topStripeFollowsGauge          // tone/color ignored while a gauge is present
  stats={[{ value: 6, label: 'Done' }, { value: 1, label: 'Left' }]}
/>

// Freeform body slot — centered, stats suppressed:
<StatCard size="md" tone="info" title="Status" body="All systems operational" />

// Warning variant — amber accent, ⚠️ watermark, body text in amber:
<StatCard
  size="md" variant="warning" title="Pending review"
  body="3 items require your attention"
  lower={<button className="mrs-stat-card__cta" onClick={open}>Review now →</button>}
/>

// Danger variant — red accent, ⚠️ watermark, body text in red:
<StatCard
  size="md" variant="danger" title="Critical failure"
  body="Sync has been interrupted. Last successful run: 2h ago."
  lower={<button className="mrs-stat-card__cta" onClick={retry}>Retry →</button>}
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

### `EmojiPicker` / `EmojiBar`

**`EmojiPicker`** — a full emoji picker panel. Ships no popover or trigger of its own;
embed it inline or nest it inside a `<Popover>`. Requires the `emojibase-data` optional peer.

| Prop | Default | Meaning |
|---|---|---|
| `onSelect` | — | `(emoji: string) => void`. **Required.** Receives the emoji character on click. Clears the search query after selection. |
| `locale` | `'en'` | Locale for emoji labels and search. `'en'` and `'nb'` are bundled; any other value falls back to `'en'`. |
| `showSearch` | `true` | Show the search input at the top. |
| `searchPlaceholder` | `'🔍'` | Placeholder for the search field. Pass a translated string via your i18n seam. |
| `noResultsLabel` | `'🤷'` | Shown when a search returns no matches. Pass a translated string via your i18n seam. |
| `className` | — | Extra classes on the root element. |

**`EmojiBar`** — a compact strip of quick-access emoji buttons; no search, no categories.

| Prop | Default | Meaning |
|---|---|---|
| `emojis` | `EMOJI_FREQUENT` | The emoji character strings to render as buttons. |
| `onSelect` | — | `(emoji: string) => void`. **Required.** |
| `className` | — | Extra classes on the root element. |

**`EmojiEmpty`** — a muted rounded-box placeholder (`+`) sized to one emoji slot.
Use wherever you display a selected emoji value and need to represent the unset state
without a language string or a character that could be mistaken for real emoji content.

**`EMOJI_FREQUENT`** — the 12-emoji default set (👍 ❤️ 😂 😮 😢 😡 🎉 👏 🔥 💯 ✨ 🙏).
Exported from `my-react-shell/components` for use as an initial value or to build a subset.

```tsx
// Inline picker — embed directly in a form or chat UI:
<EmojiPicker onSelect={(emoji) => setReaction(emoji)} />

// Behind a Popover trigger — EmojiEmpty as the unset placeholder:
const [open, setOpen] = useState(false)
<Popover open={open} onOpenChange={setOpen}
  trigger={
    <Button variant="outline">
      {reaction ? <span>{reaction}</span> : <EmojiEmpty />}
    </Button>
  }>
  <EmojiPicker onSelect={(emoji) => { setReaction(emoji); setOpen(false) }} />
</Popover>

// Norwegian locale:
<EmojiPicker locale="nb" onSelect={onSelect} />

// EmojiBar — default frequent set:
<EmojiBar onSelect={(emoji) => appendToMessage(emoji)} />

// Custom set + subset:
<EmojiBar emojis={['🎉', '🔥', '💯', '✅']} onSelect={onSelect} />
<EmojiBar emojis={EMOJI_FREQUENT.slice(0, 6)} onSelect={onSelect} />
```

> Install `emojibase-data` (`pnpm add emojibase-data`) before using `EmojiPicker`.
> `EmojiBar` and `EmojiEmpty` have no peer dependency.

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
import { AppShell, usePageHeader, PageTabs, PageSections, useDynamicPages,
         defineShellConfig, ShellConfigError, useShellContext } from 'my-react-shell/app-shell'
import type { ShellConfig, ShellConfigInput, PageEntry, PageHeaderOptions /* … */ } from 'my-react-shell/app-shell'
import 'my-react-shell/app-shell/styles.css'
```

| Export | Kind | Summary |
|---|---|---|
| `defineShellConfig(input)` | function | Validates (throws `ShellConfigError`) + brands the config at import time. Requires `renderIcon`. |
| `ShellConfigError` | class | Thrown on a bad config shape. |
| `AppShell` | component | Mount once at root. `config`, `useMenu` (sidebar vs banner), `actions[]`, `mobileNav` (`'drawer'`\|`'tabBar'`), `children`. |
| `AppHeader`, `AppMenu`, `AppBottomNav` | component | Chrome sub-parts (usually composed by `AppShell`). |
| `usePageHeader(options)` | hook | Call from a route subtree to add page chrome to the band — `title`/`actions`/`search`/`tabs`/`documentTitle`/`className`. The band shows **automatically** from the URL chain; call this only to *add* chrome. When more than one call is active (e.g. a layout band + a leaf's actions), the **deepest-mounted wins** and updates in place — no flicker. |
| `findActiveChain` | function | Compute the active breadcrumb chain for a pathname — pure function of `(roots, pathname, dynamicByParent)`. Walks `subPages` recursively at each depth level; merges `useDynamicPages` registrations keyed by parent route. |
| `PageTabs` | component | Route-based tab strip (each tab = a route). Pin via `usePageHeader({ tabs: () => <PageTabs … /> })`. Scrolls horizontally when it overflows — edge fades + arrow buttons appear on the side(s) with hidden tabs. |
| `PageSections` | component | In-page sections synced to `?<persistKey>=`. Modes `single` / `list` (scrollspy). Its section-tab strip scrolls horizontally on overflow (edge fades + arrows), like `PageTabs`. |
| `useDynamicPages(cfg)` | hook | Register runtime breadcrumb levels (record names, slugs) under a `parent` route. Works at any depth — set `parent` to whichever registered route the dynamic items hang under. Each item may carry `hideCrumb?: () => boolean` to omit it from the rendered trail while keeping it in the chain (the access-gated-ancestor pattern; same semantics as `PageEntry.hideCrumb`), or `disableCrumbLink?: () => boolean` to render the ancestor as a plain label with no click target (same semantics as `PageEntry.disableCrumbLink`). |
| `useShellContext()`, `useShellContextOptional()` | hook | Read shell context — incl. `scrollContainer` (the only scroller; use instead of `window`). |

**Contract types:** `PageEntry`, `ShellConfig`, `ShellConfigInput`, `PageContainerMaxWidth`,
`ShellPageContainerConfig`, `ShellTabsConfig`, `ShellTabsVariant`, `ShellPageHeaderConfig`,
`ShellBreadcrumbCollapseConfig`,
`ShellPageHeaderSearchSlot`, `ShellDocumentTitleMode`, `ShellIconRenderer`,
`ShellChromeLabels`, plus component props (`AppShellProps`, `AppShellMobileNav`,
`AppShellContentPadding`, `PageHeaderOptions`, `ChainLevel`, `PageTab`, `PageTabsProps`,
`PageSection`, `PageSectionsMode`, `PageSectionsProps`, `DynamicPageInput`,
`DynamicPagesConfig`, `ShellContextValue`).

**Config value sets** (full reference in the [guide](../guides/app-shell.md#optional-config-root-fields)):
`pageContainer.defaultMaxWidth` ∈ `sm·md·lg·xl·2xl·full` (default `2xl`) · `tabs.variant`
∈ `underline·pill` (default `underline`) · `shellPageHeader.documentTitle` ∈
`composed·leaf·app` (default `composed` → `Leaf · AppName`; `leaf` → leaf only; `app` →
app name only). `usePageHeader({ documentTitle })` takes the same three modes **or** a
custom `() => string` resolver. `pages` may be **empty** for a nav-less card-dashboard app.

```tsx
export const shellConfig = defineShellConfig({
  appName: 'Acme',
  renderIcon: (key, size) => { const I = icons[key] ?? Home; return <I size={size} /> }, // REQUIRED
  pages: [{ id: 'dashboard', route: '/dashboard', label: () => t('nav.dashboard'), icon: 'dashboard' }],
})
<AppShell config={shellConfig} useMenu actions={[() => <ThemeToggle/>]} mobileNav="drawer"><Outlet/></AppShell>
```

> **Band actions render inline.** An `ActionButton` mounted in `usePageHeader`'s
> `actions` slot always lays out inline (glyph before label) — the band's stylesheet
> overrides its `layout` prop, since the kit default `vertical` stacks the label under
> the glyph and blows out the band height. Pass `layout="inline"` anyway for clarity;
> icon-only actions are unaffected.
>
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
> **The band renders automatically.** Breadcrumbs appear whenever the URL resolves to a
> chain — a page mounts **nothing** to show them. `usePageHeader({ … })` only *adds* chrome
> (actions/search/tabs/title) on top; when two calls are active (e.g. a layout band + a
> leaf's actions), the **deepest-mounted wins** and updates in place, so the winner never
> flickers. At `/` (no chain, no chrome) there is no band.
>
> **`PageEntry` optional fields:** `subPages?: PageEntry[]` — nested entries, each a breadcrumb level and a title-dropdown item. `groupBreak?: true` — draws a sidebar divider before this entry; ignored on the first visible page. `tabBar?: true` — opts the entry into the mobile bottom tab bar (top-level entries only; only when `mobileNav='tabBar'`). `hideCrumb?: () => boolean` — reactive predicate that **omits this level from the rendered breadcrumb trail** while keeping it structurally in the chain (URL + descendants intact; the leaf is never hidden). Hide an access-gated ancestor a user can't open even though they can reach a child (`hideCrumb: () => !canAccess(route)`); the shell stays role-agnostic — you supply the access logic. `disableCrumbLink?: () => boolean` — reactive predicate that **renders this ancestor as a plain label instead of a clickable link**; the crumb still appears in the trail, it simply has no click target. Use for structural parent routes that have no meaningful page of their own. No effect on the leaf (which is never a link).
>
> **Breadcrumb overflow — single-line always.** Every crumb is width-capped and ellipsizes (so a long dynamic record name at *any* level can't blow out the band); home icon + chevrons never compress; the trail never wraps. Cap the label width per app with the `--mrs-breadcrumb-label-max` CSS var (default `14rem`). A deep chain also **collapses its middle**: with more than `leading + trailing` levels, the first `leading` crumbs show, then a `…` overflow dropdown of the hidden ancestors, then the last `trailing`. Configure via `shellPageHeader.breadcrumbCollapse?: { leading?: number; trailing?: number } | false` — default `{ leading: 1, trailing: 2 }`; `trailing` clamps to ≥ 1 (leaf always shown), `leading` to ≥ 0; `false` disables collapse (truncation still applies). The `…` dropdown reuses the `labels.more` aria-label.
>
> **Multi-level usage demonstrated** in the `my-react-shell-demo` nested-pages route (`src/pages/nested/`): a four-level chain — `pages` → `subPages` (regions) → `subPages` (countries) → `useDynamicPages` (cities).

---

## CSS imports

| Import | What it is | How to use |
|---|---|---|
| `my-react-shell/styles.css` | **Raw Tailwind v4 source** — the `--color-*` token contract + the 5 palettes. **Not precompiled.** | Your build **must run Tailwind v4** (PostCSS or `@tailwindcss/vite`) and have **`tw-animate-css`** installed. Don't `@import 'tailwindcss'` again — this file does. |
| `my-react-shell/components/styles.css` | Plain prebuilt CSS (`mrs-`-prefixed classes on the theme tokens). | Import once. No Tailwind config needed. Requires the theme tokens (above) to be present for theming. |
| `my-react-shell/app-shell/styles.css` | Plain prebuilt CSS for the shell chrome. | Import once when you use the app-shell. |

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
- **Router peer is app-shell-only.** Nothing in the barrel imports a router;
  `@tanstack/react-router` is an **optional** peer for `app-shell` alone. Everywhere
  else a consumer picks its own router.
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
- [concept.md](https://github.com/kesteinbakk/my-react-shell/blob/main/docs/concept.md) — what this is and its boundary
- [distribution-model.md](../guides/distribution-model.md) — install, tags, the local dev-loop
- New React project from scratch: the `react-framework` skill
