---
title: API reference
summary: >
  The complete public API of my-react-shell — every export, per import path,
  with signatures and minimal usage. The fast index the per-module guides aren't.
status: current
area: all modules
last_updated: 2026-06-28
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
| `my-react-shell/components` | **component kit** (UI components on Radix + the theme tokens) | `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-{dialog,dropdown-menu,popover,select,accordion,collapsible,checkbox,switch,radio-group,tooltip,tabs,slider,progress,toggle,toggle-group}`, `react-colorful` (only for `ColorPicker`), `react-day-picker` + `date-fns` (only for `Calendar`/`DatePicker`), `emojibase-data` (only for `EmojiPicker`), `react-pdf` (only for `Preview`) | `my-react-shell/components/styles.css` |
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
         createProjectI18n, mergeMessages, MissingTranslationsOverlay, missingKeyStore } from 'my-react-shell/i18n'
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
| `createProjectI18n(config)` | function | Batteries-included factory: merges a consumer's per-locale catalogs with the shell's built-in `common-*` catalog and returns `{ useTranslation, useT, translateNow, LanguageProvider }` — the `createTypedI18n` surface typed to the combined keys, plus a pre-wired `LanguageProvider` (an `I18nProvider` with `messages`/`defaultLocale`/`resolve` already supplied). `config`: `localMessages` (`Record<locale, nested catalog>`), `defaultLanguage` (must be a `localMessages` key), `interpolation` (`'single-brace'` `{name}` · `'double-brace'` `{{name}}`, default `'double-brace'`). |
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
so a consumer needs **no shadcn**. This section is the lean **API reference** for the kit —
every export, its props, and a minimal usage snippet. For the longer prose — shared
conventions, the more involved components, and cross-cutting patterns — see the
[components guide](../guides/components.md); for the cards and the two grids see the
[card guide](../guides/card-grid.md).

```ts
import { Alert, cn /* … */ } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css' // REQUIRED (plain prebuilt CSS; also import the theme tokens via my-react-shell/styles.css)
```

| Export(s) | Kind | Summary |
|---|---|---|
| `Button` | component | The kit's button. `variant` (solid·soft·outline·ghost·link) × `tone` × `size` (sm·md·lg); native `<button>` props pass through and the `ref` is forwarded to the `<button>`, so it works as a Radix `asChild` trigger (Popover / Tooltip / Dropdown). `leadingIcon`/`trailingIcon` slots for icon+text layouts. |
| `HeaderMenuButton` | component | Ghost neutral small button for the header action zone — a `<DropdownMenu trigger>` with visible label text and an automatic trailing chevron. `leadingIcon` slot for a view/mode icon before the label. All native `<button>` attributes (`aria-label`, `title`, `disabled`, …) pass through. |
| `Input` | component | Un-opinionated native `<input>`. `invalid` (sets `aria-invalid` + error styling), `inputSize` (sm·md·lg; named so it never clashes with native `size`), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`), optional `label` (renders above the input); native input props pass through. |
| `Textarea` | component | Un-opinionated native `<textarea>`. `invalid` (sets `aria-invalid` + error styling), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`), optional `label` (renders above the textarea); native textarea props pass through. |
| `Label` | component | Un-opinionated native `<label>`. `required` appends a subtle decorative (`aria-hidden`) marker; native label props pass through. |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | component | Un-opinionated surface container + parts (`CardTitle` → `<h3>`, `CardDescription` → `<p>`); each spreads native `<div>` props. `--color-surface-primary` panel, bordered, rounded, card elevation. |
| `Separator` | component | Un-opinionated divider. `role="separator"` with `orientation` (`horizontal`·`vertical`) + `aria-orientation`; native `<div>` props pass through. |
| `Skeleton` | component | Un-opinionated pulsing loading placeholder (decorative, `aria-hidden`). Size it with `style`/`className`; native `<div>` props pass through. |
| `Dialog` | component | General controlled dialog on Radix Dialog (overlay, focus trap, portal). `title`/`description`, `children` body, `footer` actions, `showClose` ✕, `headerActions` (icon buttons rendered next to close ✕). Supports optional default footer buttons via `useCancel` and `usePrimary` (accepting a string label or `DialogButtonConfig` configuration object), which can be combined with the custom `footer` content (rendered sequentially as Cancel -> custom footer -> Primary); `size` (`sm`·`md`·`lg`·`xl`·`full`); the body scrolls within a viewport-capped card. `titleActions` puts a control on the heading row; `bleed` drops the kit chrome for a full-bleed / custom-layout dialog; `closeOnBackdrop`/`closeOnEsc` (default `true`) guard dismissal. |
| `Preview` | component | Controlled modal PDF viewer styled like a piece of paper on Radix Dialog. Uses full viewport height and auto width. Rendered using `react-pdf`. `open`/`onOpenChange`, `title`, `file` (string url, `File`, or `Blob`), `actions`, `showPrintButton`, `printLabel`, and `closeLabel`. Provides native print functionality. Requires `react-pdf` as a peer dependency. |
| `Popover` | component | Simple, opinionated floating panel on Radix Popover (focus management, outside-click / Esc close, portal). `trigger` anchor + `children` panel; controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`); `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-popover` optional peer. |
| `DropdownMenu` | component | Data-driven menu on Radix DropdownMenu (keyboard nav, outside-click / Esc close, portal). Anchor via `trigger` (any node, `asChild`) **or** `iconTrigger` (an icon element; the kit renders its own square ghost button, accessible via `iconTriggerLabel`). `onOpenChange(open)` fires on open/close. `items` — a discriminated union of `item` (plain action, closes on select; carries `icon`/`disabled`/`danger`) · `separator` · `label` · `checkbox` (independent toggle, controlled `checked`/`onCheckedChange`) · `radio-group` (one-of-a-group, controlled `value`/`onValueChange` + `options`) · `submenu` (nested `items`, arbitrary depth). Checkbox/radio rows keep the menu open by default (per-item `closeOnSelect` to close); selected/checked state is fully consumer-controlled. `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-dropdown-menu` optional peer. |
| `Alert` | component | Inline alert/callout. `tone`: `info`·`success`·`warning`·`danger`; `title`, `icon`, `onDismiss`, `role`. |
| `InfoBox` | component | Neutral, tone-free contextual note (icon + title + body). Use `Alert` when the message carries a semantic tone. |
| `EmptyState` | component | Centered zero-state: optional icon, required `title`, `description`, action slot. |
| `Spinner`, `PageSpinner`, `SectionSpinner` | component | Rotating indicator on the current text color; block variants center it for page/section loading. |
| `ConfirmDialog` | component | Controlled confirm dialog on Radix Dialog (overlay, focus trap, Esc/backdrop close). `tone="danger"` for destructive; renders its own cancel/confirm buttons. Supports configuring buttons via `useCancel` and `useConfirm` (accepting a string label or `DialogButtonConfig` configuration object). |
| `ToastProvider`, `useToast` | component + hook | Mount provider once; fire toasts via `useToast()` (`.success`/`.error`/…). Each renders as an `Alert`; auto-dismiss (3s; `duration:0` sticky). |
| `ActionButton`, `ActionButtonGroup`, `actionPresets` | component + const | Icon/emoji + label action button with presets (table below). `actionPresets` is the `{ tone, emoji, label }` map. |
| `Badge` | component | Status/category badge; tones `primary`·`neutral`·`success`·`warning`·`danger`·`info` (`primary` is a solid pill); optional status `dot`. Forwards standard `<span>` attributes (`title`, `aria-*`, `data-*`, `id`, events) to the root. |
| `CountPill` | component | Small solid-fill numeric count pill (unread counts, tab counts, a bell overlay). `count`; tones `primary`·`secondary`·`success`·`warning`·`danger`·`info`; clamps at `max` (default `99` → `99+`), `tabular-nums`. Caller gates visibility and positions any overlay via `className`. Forwards standard `<span>` attributes. |
| `Chip`, `ChipGroup` | component | Tag: plain / toggleable (`selected`+`onClick`) / removable (`onRemove`). `ChipGroup` wraps. |
| `Avatar`, `AvatarGroup` | component | Image + initials fallback (also on image error); falls back to a person icon/emoji when no `fallback` is set (`showEmoji` follows the icons↔emojis seam); group stacks with `+N` overflow. |
| `Table` | component | Column-config data table: per-column sort, zebra, sticky header, empty state. Whole-row click (`onRowClick`, suppressed for clicks on in-cell controls/expand cells), an expandable per-row detail region (`renderExpanded`, kit-owned disclosure toggle + open state, full-width below the row; supply `renderDisclosure(row, isOpen, toggle)` to replace the kit's chevron with a consumer-styled control), per-cell expansion (`TableColumn.cellExpand(row)` — clicking cells in that column toggles a detail region keyed to that column, radio-style; one cell open at a time), per-row emphasis (`rowVariant`: `default`·`muted`·`selected`), and `frameless` to drop the wrapper border/radius when nesting inside a `Card`. `columns` is a plain array, so a dynamic column set can be built at render time. `TableColumn.align` sets the alignment for both the header and content cells equally (default `left`); `TableColumn.headerAlign` overrides alignment for just the header, leaving content at `align`. |
| `PhiCard`, `PHI` | component + const | **Legacy — being phased out; prefer `StatCard`/`ContentCard`.** Golden-ratio card (W:H = φ:1): a figure (`icon`/`image`) fills its column, a centered text body (`upper` + `content`), and a structured `footer` (meta lines + stacked badges, per-size caps) or freeform `lower`. Collapses when there's no footer. Top-right ⋮ menu via `actions` or a `corner` slot. Uses the `@radix-ui/react-dropdown-menu` optional peer. No `renderLink` navigation seam (use a non-legacy card for nav tiles). |
| `StatCard` | component | Self-contained φ-framed KPI/status card — a fixed-width golden-ratio card (`height = width / φ`); `size` default `md` ≈312px, four to a `wide` (1440px) row. Title + subtitle, an optional accent medallion circle (plain number+label **or** SVG arc-ring when `medallion.max` is set), a stats row, and a structured `footer` or freeform `lower`. Accent stripe (`accentPlacement` top/left) + medallion tint driven by `tone` (semantic tokens) or a raw CSS `color`. `variant` (`'warning'`·`'danger'`) overrides tone, forces ⚠️ watermark. Optional left-edge completion gauge (`sideBarCompleteness`, red→amber→green) that coexists with the top stripe, or drives the whole accent's color via `topStripeFollowsGauge`. Optional emoji `watermark`. Hover-lift via `onClick`/`hoverable`. |
| `ContentCard` | component | Self-contained freeform text counterpart to `StatCard` — same fixed-width golden-ratio sizing (`size` default `md` ≈312px). Title + subtitle, a freeform `content` string (supports `html` prop, safely sanitized internally via DOMPurify), and a structured `footer` or freeform `lower`. Text aligns via `contentAlignX`/`contentAlignY`. Instead of a medallion, accepts `value` and `maxValue` to render a left-side completion gauge. Same `tone`, `color`, `variant`, and `watermark` properties as `StatCard`. |
| `PaperCard` | component | Small **preview / thumbnail** card styled as a dog-eared sheet of paper at **A4 portrait** proportions (`height = width × √2`). Fixed-width size scale (`sm` 134 · `md` 168 · `lg` 210 · `xl` 264 · `xxl` 320 px, **default `md`**); the folded top-right corner is cut from the sheet with `clip-path`, and the drop shadow rides a wrapper (`filter: drop-shadow()`) so it follows the dog-eared silhouette. Title + optional subtitle / `content` (+ `contentAlignX/Y`, `maxLines`), shared `{ lines, badges }` `footer`, **opt-in** `tone`/`color` top/left accent (none by default), `watermark`, hover-lift, `dragHandle`, and the `renderLink` block-link overlay. Fixed-size → drops into the static `CardGrid`. |
| `CardGrid` | component | **Static** card grid: fixed-size cards flow left-to-right and **wrap** when a row is full, separated by a fixed `gap`. Cards are **not** stretched (a larger gap may remain at the end of a row) and keep their own intrinsic width/height (`StatCard`/`ContentCard`/`PhiCard`/`PaperCard`). `align` (`start`·`center`, default `start`), `gap` (CSS length override; default `1.5rem`, sized so four ≈312px cards fit a `wide` row). Children-based. |
| `DynamicCardGrid` | component | **Fluid** card grid with a built-in search / filter / sort toolbar. Cards stretch to fill uniform `1fr` columns sized by `cardSize` (`sm`·`md`·`lg`) or a raw `minColumnWidth`. Data-driven via `items` / `renderCard` / `getKey`; `filters`, `sortOptions`, `searchFields`/`searchFn`, `loading`, empty + no-results states. Pair with `DynamicGridCard`. |
| `DynamicGridCard` | component | Fluid card for `DynamicCardGrid`: stretches to `width:100%` of its column, inherits the grid's max-width cap, keeps the golden-ratio shape via `aspect-ratio`. Optional `title` / `subtitle` / `figure` / `footer` slots, primary content as `children`. `size` (`sm`·`md`·`lg`), `shape` (`standard` = φ:1 · `landscape` = φ²:1), `watermark` — `string` (faint oversized emoji, centred, dropped a little below centre) **or** a `ReactNode` art layer (e.g. a `DrawerMark`); an element watermark makes the card root a `mrs-reveal-host`. Optional accent stripe (`accentPlacement` top/left) driven by `tone` (semantic tokens) or a raw CSS `color`. Acts as a **whole-card navigation link** via `renderLink` (consumer supplies its router `<Link>`, rendered as a full-bleed block-link overlay), with `hoverable` lift and a raised `corner` action slot. |
| `RevealMark` | component | Hover-reveal seam: two stacked layers (`closed` / `revealed`) that cross-fade. The `revealed` layer replaces `closed` when the mark's nearest `.mrs-reveal-host` ancestor is hovered, or unconditionally when `open` is `true` (e.g. the active route). Purely decorative (`aria-hidden`); meant for a card's `watermark` slot. Build new openable marks on it. |
| `DrawerMark` | component | First `RevealMark` instance — an **isometric drawer** that rests as a closed box and slides open (tray with a gray interior floor + walls and one sheet lying flat inside) on hover, or stays open via `open`. Fully theme-token-driven; the gray interior is a `color-mix` of `--color-text-primary` into the surface, so it inverts between light/dark mode. Drop into `DynamicGridCard`'s `watermark`. |
| `InputField` | component | Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`). Spreads native input props; pass `error` to switch on error styling. `inputSize` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale. `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`). |
| `SegmentedControl` | component | Single-select `radiogroup` on a track; controlled via `value`/`onChange`; generic over value type. |
| `Select` | component | Opinionated select on Radix Select (keyboard nav, typeahead, portal); `options` list; controlled via `value`/`onValueChange`; `size` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale; `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`); optional `label` (renders above the select trigger); supports custom `className` and `style` on the trigger. |
| `Checkbox` | component | Un-opinionated checkbox on Radix Checkbox; tri-state (`checked` · unchecked · `'indeterminate'`); hand-rolled check/dash glyph; checked box fills `--color-primary`. Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`/`required`). Uses the `@radix-ui/react-checkbox` optional peer. Supports custom `className` and `style` on the root. |
| `Switch` | component | Un-opinionated toggle on Radix Switch; track + sliding thumb (checked track `--color-primary`). Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`). Optional `label`, `labelPlacement` (`left`·`right`, default `right`), and `fullWidth` (places label and toggle on opposite sides without stretching the track). Uses the `@radix-ui/react-switch` optional peer. Supports custom `className` and `style` on the root/wrapper. |
| `RadioGroup` | component | Single-select set on Radix RadioGroup with roving arrow-key focus; data-driven via `options`; selected dot fills `--color-primary`; `orientation` (`vertical`·`horizontal`). Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`); form-aware (`name`). Uses the `@radix-ui/react-radio-group` optional peer. Supports custom `className` and `style` on the root. |
| `ColorPicker` | component | General popover color picker. **Free** by default — a full hue/saturation range (via the `react-colorful` optional peer); `onChange` emits in `format` (`hex`·`rgb`·`hsl`). Pass a `colors` set to **constrain** it to a swatch grid. Controlled; `value` is a directly-usable CSS color string. `placeholder` is **required** — pass a translated string. See [below](#colorpicker). Supports custom `className` and `style` on the root. |
| `UserPreferences` | component | Controlled theme/display settings panel (palette + light/dark/system + optional icons↔emojis). Persists nothing — emits `onChange`. Auth-free (`accountActions` slot). |
| `Collapsible` | component | Single disclosure on Radix Collapsible: one trigger toggles one region. Controlled (`expanded`) / uncontrolled (`defaultExpanded`); static `trigger` or `renderTrigger(expanded)`; rotating chevron; `variant` (`default`·`bordered`·`ghost`·`filled`), `size`, `inlineChevron`, `animationDuration`. Uses the `@radix-ui/react-collapsible` optional peer. See [below](#collapsible). |
| `Accordion` | component | Grouped disclosures on Radix Accordion: roving arrow-key focus, single (one-open) or `multiple` open. Data-driven via `items`; controlled `value`/`onValueChange` or `defaultValue`; `variant` (`default`·`bordered`·`separated`), `size`. Uses the `@radix-ui/react-accordion` optional peer. See [below](#accordion). |
| `Tabs` | component | General content tabs on Radix Tabs (roving arrow-key focus, `aria` wiring): a trigger list over swappable panels, active trigger marked with a `--color-primary` indicator. Data-driven via `tabs`; controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`, defaults to first); `orientation` (`horizontal`·`vertical`). Distinct from the app-shell page tabs. Uses the `@radix-ui/react-tabs` optional peer. |
| `Tooltip` | component | Ergonomic single-component tooltip on Radix Tooltip — `content` + `children` (the trigger); mounts its own `Provider` internally, portals the bubble. `side`/`align`/`sideOffset`/`delayDuration`; optional controlled `open`/`onOpenChange`. Uses the `@radix-ui/react-tooltip` optional peer. |
| `Slider` | component | Un-opinionated range slider on Radix Slider; track + filled range + one thumb per value (pass a one- or two-element `value` for single/range), keyboard- and form-aware. `min`/`max`/`step`/`minStepsBetweenThumbs`, `orientation` (`horizontal`·`vertical`), `tone` (fill colour, default `primary`). Controlled (`value`/`onValueChange`, plus `onValueCommit`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-slider` optional peer. Supports custom `className` and `style` on the root. |
| `Progress` | component | Un-opinionated progress bar on Radix Progress; fill paints with `tone` (default `primary`), `size` (`sm`·`md`·`lg`). Pass numeric `value` (`0…max`) for a determinate bar or `null`/omit for an indeterminate loop. Radix wires the ARIA. Uses the `@radix-ui/react-progress` optional peer. |
| `Toggle` | component | Un-opinionated two-state button on Radix Toggle; pressed fills `--color-primary-bg`. `variant` (`ghost`·`outline`), `size` (`sm`·`md`·`lg`). Controlled (`pressed`/`onPressedChange`) or uncontrolled (`defaultPressed`). Uses the `@radix-ui/react-toggle` optional peer. |
| `ToggleGroup` | component | Un-opinionated set of toggle buttons on Radix ToggleGroup; data-driven via `options`. `type="single"` (value is the chosen string, or `undefined`) or `type="multiple"` (value is an array); shared `variant`/`size`. Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-toggle-group` optional peer. |
| `Sheet` | component | Overlay panel that slides in from any edge on Radix Dialog (focus trap, Esc/outside-click close, portal). `side` (`left`·`right`·`top`·`bottom`), `size` (`sm`·`md`·`lg`·`xl`·`full` — width for left/right, height for top/bottom). Optional `trigger`; built-in header (`title`/`header`/`description` + ✕ `showClose` + `headerActions` next to ✕) or `bare` (child owns the panel). `scrim={false}` + `modal={false}` for a non-blocking float over a still-interactive page. Controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`). Uses the `@radix-ui/react-dialog` optional peer. |
| `Calendar` | component | Themed month-grid calendar on `react-day-picker`; single/multiple/range selection (`mode`/`selected`/`onSelect`), full keyboard nav + ARIA, rendered against the tokens via `mrs-` classes (no react-day-picker stylesheet needed). Forwards every react-day-picker prop (`disabled`, `startMonth`/`endMonth`, `numberOfMonths`, `captionLayout`, …). Uses the `react-day-picker` + `date-fns` optional peers. |
| `DatePicker` | component | Single-date field — a trigger button (showing the picked date, `displayFormat` via date-fns) that opens a `Calendar` in a Radix Popover; closes on pick. `disabledDays` (a react-day-picker matcher), `startMonth`/`endMonth`. Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`). Uses the `react-day-picker` + `date-fns` + `@radix-ui/react-popover` optional peers. Supports custom `className` and `style` on the trigger. |
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
`StatCardProps`, `StatCardSize`, `StatCardMedallion`, `StatItem`, `StatCardTone`, `StatCardVariant`,
`StatCardFooter`, `StatCardFooterLine`, `StatCardFooterLineType`,
`ContentCardProps`, `ContentCardSize`, `ContentCardTone`, `ContentCardVariant`,
`ContentCardFooter`, `ContentCardFooterLine`, `ContentCardFooterLineType`,
`PaperCardProps`, `PaperCardSize`, `PaperCardTone`, `PaperCardFooter`, `PaperCardFooterLine`, `PaperCardFooterLineType`, `PaperCardLinkProps`,
`RevealMarkProps`, `DrawerMarkProps`,
`CardGridProps`, `DynamicCardGridProps`, `ToggleFilter`, `SortOption`,
`DynamicGridCardProps`, `DynamicGridCardSize`, `DynamicGridCardShape`, `DynamicGridCardFooter`, `DynamicGridCardFooterLine`, `DynamicGridCardFooterLineType`, `DynamicGridCardLinkProps`, `ColorPickerProps`,
`ColorFormat`, `CollapsibleProps`, `CollapsibleVariant`, `CollapsibleSize`,
`AccordionProps`, `AccordionItem`, `AccordionVariant`, `AccordionSize`,
`CheckboxProps`, `SwitchProps`, `RadioGroupProps`, `RadioOption`,
`TabsProps`, `TabItem`, `TooltipProps`, `SliderProps`, `ProgressProps`, `ProgressSize`,
`ToggleProps`, `ToggleVariant`, `ToggleSize`, `ToggleGroupProps`, `ToggleGroupOption`,
`ToggleGroupSingleProps`, `ToggleGroupMultipleProps`, `SheetProps`, `SheetSide`,
`SheetSize`, `CalendarProps`, `DatePickerProps`, `EmojiPickerProps`, `EmojiBarProps`, etc.).

**Semantic colour is one shared vocabulary.** The kit exports a canonical **`Tone`** type
(`primary`·`neutral`·`info`·`success`·`warning`·`danger`) and its **`TONE_COLOR`**
`--color-*` map; **`tone`** carries semantic colour, **`variant`** structural style only.
Full convention + the per-component narrowings:
[components guide](../guides/components.md#semantic-colour-is-one-shared-vocabulary).

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

### Width & styling

All input/form components (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`,
`RadioGroup`, `SegmentedControl`, `ColorPicker`, `DatePicker`, `Slider`) accept `className`
and `style` on their root / trigger element for custom sizing. Examples:
[components guide → Width & styling](../guides/components.md#width--styling).

**`Alert` props:** `tone` (`'info'`), `title`, `children`, `icon` (per-tone; `false`
drops it), `onDismiss` (renders a dismiss button), `dismissLabel` (`'Dismiss'`),
role (`'alert'` | `'status'`), className.

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

> Placed in the page-header band's `actions` slot, an `ActionButton` always renders inline
> (glyph before label) regardless of `layout`. See
> [components guide](../guides/components.md#actionbutton--header-band-layout).

```tsx
<ActionButtonGroup>
  <ActionButton action="add" showLabel onClick={onAdd} />
  <ActionButton action="delete" showEmoji={useIconMode().isEmoji} onClick={onDelete} />
  <ActionButton action="star" active={isFavorite} onClick={toggleFavorite} />
  <ActionButton icon={<Upload size={20} />} label="Import" tone="info" onClick={onImport} />
</ActionButtonGroup>
```

### `SearchInput`

An opinionated search input component with built-in debouncing, left magnifier glass icon, custom start/end icons, and a loaded icon state.

| Prop | Default | Meaning |
|---|---|---|
| `icon` | magnifier glass | Custom left icon node (overrides the magnifier glass). |
| `endIcon` | — | Custom right icon node. |
| `onDebounceSearch` | — | Callback fired with the current value after the user stops typing. |
| `debounceMs` | `500` | Debounce delay in milliseconds for `onDebounceSearch`. |
| `value` | — | Controlled input value. |
| `defaultValue` | — | Default initial value. |
| `inputSize` | `md` | `sm` · `md` · `lg` — drives height, padding, and font size. |
| `loadedIconState` | — | `boolean` or `{ icon?, duration?, enabled?, transitionMs? }`. On `true` or `{ enabled: true }`, fades in a green check mark. `duration` defaults to `2000`ms. |
| `wrapperClassName` | — | Custom class for the wrapper element. |
| `wrapperStyle` | — | Custom style object for the wrapper element. |
| All other native `<input>` attributes | — | Spreads standard input props (`placeholder`, `disabled`, `onInput`, `onFocus`, `onBlur`, `className`, etc.). |

### `ColorPicker`

A controlled popover colour picker — **free** (full hue/saturation range, `react-colorful`
peer) by default, or **constrained** to a swatch grid when you pass a `colors` set. `value`
/ `onChange` is always a directly-usable CSS colour string. Free vs constrained behaviour:
[components guide](../guides/components.md#colorpicker--free-vs-constrained).

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
const [color, setColor] = useState('#3b82f6')
<ColorPicker label="Any color" placeholder={t('color.pick')} value={color} onChange={setColor} />
```

### `Collapsible`

A single disclosure — one trigger toggling one region — on Radix Collapsible.
**Controlled** (`expanded`) or **uncontrolled** (`defaultExpanded`). For a set with
one-open-at-a-time / roving focus use [`Accordion`](#accordion); when to use which +
examples: [components guide](../guides/components.md#collapsible-vs-accordion).

| Prop | Default | Meaning |
|---|---|---|
| `trigger` | — | Static trigger content. |
| `renderTrigger` | — | `(expanded) => node` — trigger as a function of the open state; takes precedence over `trigger`. |
| `children` | — | The revealed content. |
| `actionsStart` | — | Actions rendered before the trigger label. Interacting with them won't toggle the collapsible. |
| `actionsEnd` | — | Actions rendered before the chevron. Interacting with them won't toggle the collapsible. |
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
<Collapsible defaultExpanded trigger="Shipping & returns">
  <p>Free shipping over 500 kr…</p>
</Collapsible>
```

### `Accordion`

A set of disclosures with group behaviour (roving focus, single or `multiple` open) on
Radix Accordion. **Data-driven** via `items`; **controlled** (`value`) or **uncontrolled**
(`defaultValue`). For a lone trigger+region use [`Collapsible`](#collapsible); when to use
which + examples: [components guide](../guides/components.md#collapsible-vs-accordion).

`AccordionItem`: `{ value: string; trigger: ReactNode; content: ReactNode; disabled?: boolean; actionsStart?: ReactNode; actionsEnd?: ReactNode }`.

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
<Accordion variant="bordered" defaultValue="a" items={items} />
```

### Surfaces & elevation

Kit components render on the semantic surface ladder and carry a real elevation
(light/dark aware). The per-component surface mapping and the elevation model:
[components guide → Surfaces & elevation](../guides/components.md#surfaces--elevation).

### `PhiCard`

> **Legacy — being phased out.** Prefer `StatCard` / `ContentCard` (self-contained,
> golden-ratio, and the cards that carry the `renderLink` navigation seam) for new work.
> `PhiCard` still ships so existing consumers keep building; it gains no new features.

A golden-ratio card (W:H = φ:1, sections split φ:1) with a figure, a centered text body, a
structured `footer` (`{ lines, badges }`, per-size caps, throws over) or freeform `lower`,
and a top-right ⋮ overflow menu (`actions`) or `corner` slot. `PHI` (`1.6180339887`) is
exported. Layout, footer-row pairing, and caps:
[card guide → PhiCard](../guides/card-grid.md#phicard-legacy--being-phased-out).

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
```

### `StatCard`

Self-contained φ-framed KPI / status card (`height = width / φ`): title + subtitle, an accent
**medallion** (number or arc-ring), a stats row, and a structured `footer` or freeform
`lower`. `size` widths `sm` 240 · `md` 312 · `lg` 400 · `xl` 520 px (default `md`). Acts as a
whole-card link via `renderLink`. Medallion, gauge (`sideBarCompleteness`,
`topStripeFollowsGauge`), `variant`, and worked examples:
[card guide → StatCard](../guides/card-grid.md#statcard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Auto-fits: a very long title steps its font size down in up to five steps (by character count) so it stays within ~two lines without resizing the card; the deeper steps let a much longer title fit before it ellipsizes. Short titles are unaffected. |
| `subtitle` | — | Optional subtitle below the title. |
| `medallion` | — | `{ value, label?, max?, size? }` — the top-right circle. Plain circle (number + label) when `max` is absent; SVG arc-ring showing `value/max` progress when `max` is set. `size` defaults to `'lg'`; when `'sm'`, the medallion renders with a smaller footprint, drops its label, and clamps numeric values to `99`. |
| `onMedallionPress` | — | Optional callback triggered when the medallion is clicked. When set, the medallion renders as a `<button>` with a pressable hover/active lift effect. |
| `tone` | `'neutral'` | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — maps to semantic `--color-*` tokens for the accent stripe and medallion tint. |
| `color` | — | Raw CSS color (overrides `tone`). E.g. `'var(--color-primary)'` or `'#7c3aed'`. |
| `accentPlacement` | `'top'` | Where the accent reads: a `'top'` stripe or a `'left'` bar. |
| `sideBarCompleteness` | — | Left-edge completion gauge — a `0`–`1` fraction (clamped). The colored fill rises from the bottom to `value × height`, interpolating **red → amber → green** (`danger → warning → success` tokens) over a faint track. Independent of `accentPlacement`, so it coexists with a top stripe. **Checked, not defaulted:** `undefined` → no gauge; `0` → gauge with an empty fill. Combining with `accentPlacement='left'` throws in dev; in prod the gauge wins and the left accent stripe is suppressed (no overlap). |
| `topStripeFollowsGauge` | `false` | When `true`, the **whole accent** (top stripe + medallion tint + stat numbers) takes the gauge's completeness color instead of `tone`/`color`, so the card reads as one coherent color, and the stripe is forced to the top edge. Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is present — `undefined` → **no top stripe** (medallion + stats fall back to `tone`/`color`). Throws in dev if combined with `accentPlacement='left'`. |
| `stats` | — | `{ value, label?, max? }[]` — data items. `label` → label above + number below. `max` → compact arc-ring. **Cannot combine `label` and `max` on the same item** (throws in dev). |
| `variant` | — | `'warning'` · `'danger'` — structural alert variant. Overrides `tone` to the same value (accent stripe, medallion tint, and stat numbers all reflect the variant hue) and forces `⚠️` as the watermark background emoji, ignoring the `watermark` prop. |
| `footer` | — | Footer slot: a freeform `ReactNode` (e.g. a CTA pill via `.mrs-stat-card__cta`) **or** a structured `{ lines?, badges? }` (meta lines left, badges right — same shape as `ContentCard`). The two are discriminated automatically. |
| `watermark` | — | Emoji rendered as a faint oversized background watermark. E.g. `'🏆'`. Ignored when `variant` is set. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` = 240/312/400/520px wide; height = width / φ. Default `md` ≈312px → four to a `wide` (1440px) row. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (`height = width / φ²`, shorter box). For light cards (no footer, small content) where the standard height reads too tall; a full stats row + footer can overflow the shorter box. |
| `onClick` | — | Click handler; also enables hover lift. |
| `hoverable` | `!!onClick` | Hover lift (translateY + shadow). |
| `dragHandle` / `dragHandleProps` | — | Drag-reorder grip (built-in or custom node). **Mutually exclusive with `renderLink`** — throws in dev. |
| `renderLink` | — | Interactive-root seam — `(linkProps) => ReactNode`. The consumer renders its router `<Link>` spreading `linkProps` (`className` + auto-wired `aria-labelledby` from the title), adding `to`/`params`. The card mounts it as a **full-bleed block-link overlay** so the whole tile is a real, keyboard-activatable anchor while the root owns its hover/border/focus states; the medallion button (`onMedallionPress`) and drag handle stay raised above it. The shell imports no router; `to`/`params` type-safety lives at the call site. |
| `className` | — | Extra classes. |

```tsx
<StatCard
  size="lg" tone="success" title="Vinnere" subtitle="Unike leverandører"
  medallion={{ value: 27, label: 'LEV' }} watermark="🏆"
  stats={[{ value: 18, label: 'Bredde' }, { value: 14, label: 'Spisset' }]}
  onClick={open}
/>
```

### Card grids — static vs dynamic

Two layouts: **`CardGrid`** (static — fixed-size cards wrap, never stretch) and
**`DynamicCardGrid`** + **`DynamicGridCard`** (fluid — size-less cards stretch to `1fr`
columns, with a search/filter/sort toolbar). Pick by whether the card has an intrinsic size;
don't mix them. Full rationale + the stretch mechanics:
[card guide](../guides/card-grid.md).

#### `CardGrid` (static)

| Prop | Default | Meaning |
|---|---|---|
| `align` | `'start'` | Row alignment: `'start'` packs cards from the left (extra space becomes a larger gap at the row end); `'center'` centers each row. |
| `gap` | `1.5rem` | Fixed gap between cards (any CSS length). The default fits four ≈312px cards on a `wide` (1440px) row. Sets `--mrs-card-grid-gap`. |
| `children` | — | The cards. Each keeps its own intrinsic size. |

```tsx
import { CardGrid, StatCard, ContentCard } from 'my-react-shell/components'

<CardGrid>
  <StatCard title="Active" medallion={{ value: 27, label: 'LIVE' }} stats={[{ value: 18, label: 'Open' }]} />
  <ContentCard title="Status" content="All systems operational" tone="success" />
  {/* … more fixed-size cards; they wrap and never stretch */}
</CardGrid>
```

#### `DynamicCardGrid`

Fluid grid with a built-in toolbar. Data-driven — you pass `items` and render each via `renderCard`.

| Prop | Default | Meaning |
|---|---|---|
| `items` / `renderCard` / `getKey` | — | **Required.** The data array, a render function per item, and a stable key extractor. |
| `cardSize` | — | `sm`·`md`·`lg` — sets the column minimum + the card max-width cap (`180/240/400` min, `210/320/500` max px). |
| `minColumnWidth` | — | Raw CSS length for the column minimum; overrides `cardSize`'s minimum. |
| `align` | `'start'` | `'center'` centers a sparse last row. |
| `searchFields` / `searchFn` | — | Enables the search box (built-in substring match over `searchFields`, or a custom `searchFn`). |
| `filters` / `filterFn` | — | Toggle-filter chips (`{ key, label, defaultOn? }[]`) + a predicate. |
| `sortOptions` / `defaultSort` / `sortFn` | — | Sort dropdown + direction toggle. |
| `filterThreshold` | `6` | Hide the toolbar until at least this many items (use `0` to always show). |
| `loading` / `emptyState` / `noResultsMessage` / `noResultsDescription` | — | Loading spinner, empty-data slot, and no-search-results copy. |

```tsx
import { DynamicCardGrid, DynamicGridCard } from 'my-react-shell/components'

<DynamicCardGrid
  items={items}
  getKey={(it) => it.id}
  cardSize="md"
  renderCard={(it) => (
    <DynamicGridCard title={it.title}>{it.body}</DynamicGridCard>
  )}
/>
```

#### `DynamicGridCard`

| Prop | Default | Meaning |
|---|---|---|
| `title` / `subtitle` | — | Optional header slots. Primary content goes in `children`. |
| `figure` | — | Icon/emoji column rendered beside the title (a figure-split header). |
| `footer` | — | Footer slot: a freeform `ReactNode`, or a structured `{ lines?: { text, type? }[]; badges?: ReactNode[] }` (meta lines left, badges right — same shape as `StatCard`/`ContentCard`). |
| `size` | — | `sm`·`md`·`lg` — a self-applied min/max-width cap for use **outside** a `DynamicCardGrid`. Inside one, omit it and let `cardSize` on the grid drive the columns. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (shorter/wider). |
| `hoverable` | `false` | Cursor + hover-lift + `:focus-visible` ring on the card root. |
| `lift` | `true` | Whether a `hoverable` card moves (`translateY`) on hover. `false` keeps the card interactive (cursor, `onClick`, subtle hover elevation) **without** the movement — e.g. when a `DrawerMark` watermark's own open-on-hover is the feedback. No effect unless `hoverable`. |
| `watermark` | — | Faint background watermark — centred horizontally, dropped a little below centre. A **`string`** is an oversized emoji (e.g. `'🚀'`); a **`ReactNode`** (e.g. a `DrawerMark`) renders in an art layer behind the content and makes the card root a `mrs-reveal-host` (so a hover-reveal mark opens on card hover). |
| `corner` | — | Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered **above** the link overlay (`z-index`) as a sibling of the anchor, so it stays independently clickable — never nested in the link. |
| `tone` | — | Semantic accent hue → a stripe (see `accentPlacement`). **Opt-in** — no accent when unset. `primary`·`info`·`success`·`warning`·`danger`·`neutral`. `color` overrides it. Same accent vocabulary as `StatCard`/`PaperCard`. |
| `color` | — | Raw CSS color for the accent stripe; overrides `tone`. E.g. `'#7c3aed'` or `'var(--color-primary)'`. |
| `accentPlacement` | `'top'` | Where the accent reads when `tone`/`color` is set: a `'top'` stripe or a `'left'` bar. |
| `renderLink` | — | Interactive-root seam. `(linkProps) => ReactNode` — the consumer renders its router `<Link>` spreading `linkProps` (`className` + auto-wired `aria-labelledby` from the title), adding `to`/`params`. The card mounts it as a **full-bleed block-link overlay** so the whole tile is a real, keyboard-activatable anchor while the root `<div>` owns its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives at the call site. |

```tsx
import { Link } from '@tanstack/react-router'

// Whole-card navigation link with a figure, a footer meta line, and a corner menu:
<DynamicGridCard
  figure="⚙️"
  title="Setup"
  subtitle="Configure the workspace"
  hoverable
  footer={{ lines: [{ text: '4 steps left', type: 'check' }] }}
  corner={<DropdownMenu iconTrigger={<MoreVertical size={16} />} iconTriggerLabel="Card actions" items={[…]} />}
  renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
/>
```

#### `DrawerMark` / `RevealMark` — hover-reveal watermark

`RevealMark` cross-fades a `closed` layer to a `revealed` one when its nearest `.mrs-reveal-host`
ancestor is hovered, or unconditionally when `open` is set. `DrawerMark` is the shipped drawer
instance. Pass one as a `DynamicGridCard` `watermark` (which makes the card root the host) to get
a drawer that rests closed and slides open on card hover; set `open` to keep it open for the
active route. Both are decorative (`aria-hidden`).

| Prop | Default | Meaning |
|---|---|---|
| `RevealMark` · `closed` | — | Resting layer (any node). |
| `RevealMark` · `revealed` | — | Layer cross-faded in on host hover / when `open`. |
| `RevealMark` · `open` | `false` | Force the `revealed` layer regardless of hover. |
| `DrawerMark` · `open` | `false` | Force the open drawer (e.g. the active route). |

```tsx
import { DynamicGridCard, DrawerMark } from 'my-react-shell/components'

// Drawer watermark that opens on hover; force-open on the active route.
// `lift={false}` keeps the pointer + onClick but stops the card from moving, so the
// drawer's own open-on-hover is the only motion:
<DynamicGridCard
  title="Files"
  subtitle="Project documents"
  footer={{ lines: [{ text: '8 items' }] }}
  hoverable
  lift={false}
  onClick={openFiles}
  watermark={<DrawerMark open={isActive} />}
/>
```

> Build a new openable mark on `RevealMark` directly: `<RevealMark closed={…} revealed={…} />`.
> It reveals inside **any** container carrying `mrs-reveal-host` — not only cards.

### `ContentCard`

Self-contained freeform-text counterpart to `StatCard` — same fixed-width golden-ratio
sizing, accent logic, variants, watermark, and footer, but a `content` string slot
(`maxLines` clamp, optional sanitized `html`) and a `value`/`maxValue` completion gauge in
place of the medallion. Behaviour + examples:
[card guide → ContentCard](../guides/card-grid.md#contentcard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Auto-fits. |
| `subtitle` | — | Optional subtitle. |
| `content` | — | **Required.** The main freeform text. Text is dynamically clamped based on the `maxLines` cap. |
| `html` | `false` | When true, parses `content` as HTML via `dangerouslySetInnerHTML`. **Automatically sanitized** internally using `isomorphic-dompurify`. |
| `maxLines` | *dynamic* | Number of lines to clamp the `content`. Defaults to `5` if neither subtitle nor footer is present, `4` if either is present, and `3` if both are present. |
| `contentAlignX` | `'center'` | Horizontal alignment (`'left'` · `'center'` · `'right'`). |
| `contentAlignY` | `'center'` | Vertical alignment (`'top'` · `'center'` · `'bottom'`). |
| `value` / `maxValue` | — | Triggers a left-side completion gauge (red→amber→green based on ratio). Equivalent to `sideBarCompleteness` in StatCard. |
| `tone` / `color` | `'neutral'` | Accent stripe color. |
| `accentPlacement` | `'top'` | `'top'` or `'left'` |
| `topStripeFollowsGauge` | `false` | Matches `StatCard` behavior (turns the top stripe into the gauge's completeness color). |
| `variant` | — | `'warning'` · `'danger'`. Colors body text to match the alert hue. |
| `footer` | — | Footer slot: a freeform `ReactNode` **or** a structured `{ lines?, badges? }` — same unified slot as `StatCard` (discriminated automatically). |
| `watermark` | — | Faint background emoji. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` = 240/312/400/520px wide; height = width / φ. Default `md` ≈312px → four to a `wide` (1440px) row. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (`height = width / φ²`, shorter box). |
| `dragHandle` / `dragHandleProps` | — | Drag-reorder grip. **Mutually exclusive with `renderLink`** — throws in dev. |
| `renderLink` | — | Interactive-root seam — same block-link-overlay mechanism as `StatCard` (`(linkProps) => ReactNode`; the whole tile becomes the consumer's router `<Link>`, root owns its states, no router dep in the shell). |

```tsx
<ContentCard size="md" tone="info" title="Status" content="All systems operational" />
```

### `PaperCard`

A small **preview / thumbnail** card styled as a dog-eared A4-portrait sheet
(`height = width × √2`, default `size` `sm`). Shares the card-family `footer`, `watermark`,
hover-lift, `dragHandle`, and `renderLink` seams; an accent stripe is **opt-in**. Fold/shadow
mechanics + examples: [card guide → PaperCard](../guides/card-grid.md#papercard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Wraps to three lines at a fixed size, then clips (no font-size auto-fit). |
| `subtitle` | — | Optional subtitle / meta line below the title (single line, ellipsised). |
| `content` | — | Optional freeform body text. A thumbnail can carry just a title; when present, the text clamps to `maxLines`. |
| `contentAlignX` | `'left'` | Horizontal alignment (`'left'` · `'center'` · `'right'`). |
| `contentAlignY` | `'top'` | Vertical alignment (`'top'` · `'center'` · `'bottom'`). |
| `maxLines` | *dynamic* | Lines to clamp `content`. Defaults to `7` if neither subtitle nor footer is present, `5` if either is present, `4` if both are. |
| `tone` | — | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — **opt-in** accent stripe (default none). Maps to semantic `--color-*` tokens. |
| `color` | — | Raw CSS color for the accent stripe (overrides `tone`). |
| `accentPlacement` | `'top'` | Where the accent reads when set: a `'top'` stripe or a `'left'` bar. |
| `footer` | — | Footer slot: a freeform `ReactNode` **or** a structured `{ lines?, badges? }` — same unified slot as `StatCard`/`ContentCard` (discriminated automatically). |
| `watermark` | — | Faint oversized background emoji. E.g. `'📄'`. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl`·`xxl` = 134/168/210/264/320px wide; height = width × √2. `lg` is literally A4's mm figures (210×297). |
| `onClick` | — | Click handler; also enables hover lift. |
| `hoverable` | `!!onClick` | Hover lift (translateY + heavier shadow). |
| `dragHandle` / `dragHandleProps` | — | Drag-reorder grip (built-in or custom node). **Mutually exclusive with `renderLink`** — throws in dev. |
| `renderLink` | — | Interactive-root seam — same block-link-overlay mechanism as `StatCard`/`ContentCard` (`(linkProps) => ReactNode`; the whole tile becomes the consumer's router `<Link>`, root owns its states, no router dep in the shell). |
| `className` / `style` | — | Extra classes / style on the outer card. |

```tsx
<PaperCard title="Errand list" subtitle="Personal" />
```

### `UserPreferences`

A fully **controlled** theme/display panel in a Radix dialog (palette + light/dark/system +
an optional icons↔emojis switch). It **persists nothing** — emits `onChange`; the consumer
owns storage. Auth-free (`accountActions` slot); labels are English defaults, pass translated
strings. Notes: [components guide → UserPreferences](../guides/components.md#userpreferences).

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
<EmojiPicker onSelect={(emoji) => setReaction(emoji)} />   // inline
<EmojiBar onSelect={(emoji) => appendToMessage(emoji)} />  // quick strip (default frequent set)
```

More examples (Popover integration, locale, custom sets):
[components guide → EmojiPicker / EmojiBar](../guides/components.md#emojipicker--emojibar).

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
import { AppShell, usePageHeader, usePageAlert, PageTabs, PageSections, useDynamicPages,
         defineShellConfig, ShellConfigError, useShellContext } from 'my-react-shell/app-shell'
import type { ShellConfig, ShellConfigInput, PageEntry, PageHeaderOptions, PageHeaderAlertSpec /* … */ } from 'my-react-shell/app-shell'
import 'my-react-shell/app-shell/styles.css'
```

| Export | Kind | Summary |
|---|---|---|
| `defineShellConfig(input)` | function | Validates (throws `ShellConfigError`) + brands the config at import time. Requires `renderIcon`. |
| `ShellConfigError` | class | Thrown on a bad config shape. |
| `AppShell` | component | Mount once at root. `config`, `useMenu` (sidebar vs banner), `actions[]`, `mobileNav` (`'drawer'`\|`'tabBar'`), `children`. |
| `AppHeader`, `AppMenu`, `AppBottomNav` | component | Chrome sub-parts (usually composed by `AppShell`). |
| `usePageHeader(options)` | hook | Call from a route subtree to add page chrome to the band — `title`/`actions`/`search`/`tabs`/`documentTitle`/`className`. The band shows **automatically** from the URL chain; call this only to *add* chrome. When more than one call is active (e.g. a layout band + a leaf's actions), the **deepest-mounted wins** and updates in place — no flicker. |
| `usePageAlert(spec)` | hook | Set a global page-level alert in the header band (`{ label, tone, hideOtherActions? }`). If `hideOtherActions` is true, the renderer hides the regular actions and search input. |
| `findActiveChain` | function | Compute the active breadcrumb chain for a pathname — pure function of `(roots, pathname, dynamicByParent)`. Walks `subPages` recursively at each depth level; merges `useDynamicPages` registrations keyed by parent route. |
| `PageTabs` | component | Route-based tab strip (each tab = a route). Pin via `usePageHeader({ tabs: () => <PageTabs … /> })`. Scrolls horizontally when it overflows — edge fades + arrow buttons appear on the side(s) with hidden tabs. |
| `PageSections` | component | In-page sections synced to `?<persistKey>=`. Modes `single` / `list` (scrollspy). Its section-tab strip scrolls horizontally on overflow (edge fades + arrows). `fullHeight` expands sections to fill the scroll container. |
| `PageSection` | component | Standalone section card. `title`, `icon` (string key or custom Node), `actions[]`, `children`, `className`. |
| `useDynamicPages(cfg)` | hook | Register runtime breadcrumb levels (record names, slugs) under a `parent` route. Works at any depth — set `parent` to whichever registered route the dynamic items hang under. Each item may carry `hideCrumb?: () => boolean` to omit it from the rendered trail while keeping it in the chain (the access-gated-ancestor pattern; same semantics as `PageEntry.hideCrumb`), or `disableCrumbLink?: () => boolean` to render the ancestor as a plain label with no click target (same semantics as `PageEntry.disableCrumbLink`). |
| `useShellContext()`, `useShellContextOptional()` | hook | Read shell context — incl. `scrollContainer` (the only scroller; use instead of `window`). |

**Contract types:** `PageEntry`, `ShellConfig`, `ShellConfigInput`, `PageContainerMaxWidth`,
`ShellPageContainerConfig`, `ShellTabsConfig`, `ShellTabsVariant`, `ShellPageHeaderConfig`,
`ShellBreadcrumbCollapseConfig`,
`ShellPageHeaderSearchSlot`, `ShellDocumentTitleMode`, `ShellIconRenderer`,
`ShellChromeLabels`, plus component props (`AppShellProps`, `AppShellMobileNav`,
`AppShellContentPadding`, `PageHeaderOptions`, `ChainLevel`, `PageTab`, `PageTabsProps`,
`PageSection`, `PageSectionProps`, `PageSectionsMode`, `PageSectionsProps`, `DynamicPageInput`,
`DynamicPagesConfig`, `ShellContextValue`).

**Config value sets** (full reference in the [guide](../guides/app-shell.md#optional-config-root-fields)):
`pageContainer.defaultMaxWidth` ∈ `narrow·medium·wide·x-wide·full` (default `x-wide`) · `tabs.variant`
∈ `underline·pill` (default `underline`) · `shellPageHeader.documentTitle` ∈
`composed·leaf·app` (default `composed` → `Leaf · AppName`; `leaf` → leaf only; `app` →
app name only). `usePageHeader({ documentTitle })` takes the same three modes **or** a
custom `() => string` resolver. `pages` may be **empty** for a nav-less card-dashboard app.

```tsx
export const shellConfig = defineShellConfig({
  appName: 'Acme',
  // Internal chrome keys: 'menu', 'home', 'chevronRight', 'chevronDown', 'search', 'alert'
  renderIcon: (key, size) => { const I = icons[key] ?? Home; return <I size={size} /> }, // REQUIRED
  pages: [{ id: 'dashboard', route: '/dashboard', label: () => t('nav.dashboard'), icon: 'dashboard' }],
})
<AppShell config={shellConfig} useMenu actions={[() => <ThemeToggle/>]} mobileNav="drawer"><Outlet/></AppShell>
```

> **Band actions.** The `actions` slot in `usePageHeader` accepts thunks `(() => ReactNode)` or preset action items:
> - Preset strings (e.g. `'add'`, `'edit'`, `'delete'`) which render a standard inline `ActionButton`.
> - A `'search'` string which renders a default `SearchInput` component with magnifier icon and debouncing. This is meant to be used for filtering or lookups on the content on the current page.
> - Custom preset objects: `{ action: Exclude<ActionType, 'search'>, onClick?, label?, showLabel?, showEmoji?, tone?, size?, layout?, disabled?, hint? }` to customize standard preset buttons.
> - Custom search objects: `{ action: 'search', icon?, endIcon?, onDebounceSearch?, debounceMs?, value?, defaultValue?, loadedIconState? }` to customize the search input field.
> - Any custom ReactNode thunk. An `ActionButton` mounted here always lays out inline (glyph before label). **Anti-pattern:** Action items in the header should NEVER be styled as normal buttons (e.g. `<Button>`). Action items must either be default supported strings (e.g. `'add'`), a custom label + icon via `ActionButton`, or an icon-only `ActionButton`.
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
| `my-react-shell/styles.css` | **Raw Tailwind v4 source** — the `--color-*` token contract + the 5 palettes. **Not precompiled.** | Your build **must run Tailwind v4** (PostCSS or `@tailwindcss/vite`). **`tw-animate-css`** is a declared optional peer — install it in your consumer project. Don't `@import 'tailwindcss'` again — this file does. |
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
  [icons](../guides/icons.md) · [app-shell](../guides/app-shell.md) ·
  [components](../guides/components.md) (shared conventions, the involved components, cross-cutting patterns) ·
  [card-grid](../guides/card-grid.md) (the cards + the two grids).
- [concept.md](https://github.com/kesteinbakk/my-react-shell/blob/main/docs/concept.md) — what this is and its boundary
- [distribution-model.md](../guides/distribution-model.md) — install, tags, the local dev-loop
- New React project from scratch: the `react-framework` skill
