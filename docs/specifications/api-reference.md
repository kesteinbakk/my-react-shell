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

**Typography (fonts).** The shell applies overridable typography tokens (a system stack by default):
- `--font-sans`: Applied to `body`. Import **one** bundled, self-hosted face **after** `my-react-shell/styles.css` to switch — or neither, and set `--font-sans` yourself.
- `--font-mono`: A clean system monospace stack for code, stats, and metadata.
- `--font-footer`: Controls the font family of structured card footers. Defaults to `inherit` (inheriting from the card's font size/family which derives from `--font-sans`).

| CSS import | Face |
|---|---|
| `my-react-shell/fonts/geist.css` | Geist Variable (recommended default) |
| `my-react-shell/fonts/inter.css` | Inter Variable |

Self-hosted via `@fontsource` (no CDN). See [theme.md](../guides/theme.md) →
*Typography*.

**Design size scales.** Two shared step ladders exported from the core barrel — the
glyph and text counterparts to the icon-**button** box scale (`ICON_BUTTON_GLYPH_PX`,
under `/components`). Each pairs a TS constant with a CSS-token family (defined in
`styles/base.css`); keep the two in sync. These establish the ladder — they are **not**
yet wired into the component kit (components keep their own per-component `size` maps).

```ts
import { ICON_GLYPH_PX, TEXT_SIZE_REM } from 'my-react-shell'
import type { IconSize, TextSize } from 'my-react-shell'
```

| Export | Kind | Summary |
|---|---|---|
| `ICON_GLYPH_PX` | const | `Record<IconSize, number>` — px a rendered glyph draws at: `xs` 16 · `sm` 20 · `md` 24 · `lg` 32 · `xl` 40. Default `md`. |
| `TEXT_SIZE_REM` | const | `Record<TextSize, string>` — UI-text font-size (rem string): `xs` 0.75 · `sm` 0.875 · `md` 1 · `lg` 1.125 · `xl` 1.25. Base `md`. |
| `IconSize` | type | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`. |
| `TextSize` | type | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`. |

CSS-token mirrors (from `my-react-shell/styles.css`): `--mrs-icon-{xs,sm,md,lg,xl}`
(px) and `--mrs-text-{xs,sm,md,lg,xl}` (rem).

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
| `AppProviders` | component | Mount once above your router. Composes `ThemeProvider` + Convex client + optional auth + optional i18n. |
| `ConvexClientProvider` | component | Plain (unauthenticated) Convex provider; creates the client once. |
| `createConvexClient(url?)` | function | Builds a `ConvexReactClient` from `VITE_CONVEX_URL`. **Throws** if absent/empty; **rejects** a trailing slash. |
| `AppProvidersProps` | type | Props below. |
| `ConvexClientProviderProps` | type | Props for the plain provider. |
| `AuthProvider` | type | The auth seam (re-exported from the auth module). `ComponentType<AuthProviderProps>`. |
| `AuthProviderProps` | type | `{ client: ConvexReactClient; children: ReactNode }`. |

**`<AppProviders>` props:** `authProvider` (omit → plain unauthenticated Convex app),
`client` (pre-created client; default reads `VITE_CONVEX_URL`), `theme`
(`Omit<ThemeProviderProps, 'children'>`, default `{}`), `i18n`
(`Omit<I18nProviderProps, 'children'>` — when given, mounts `<I18nProvider>` and
**auto-merges the shell's `mrs.*` chrome catalog** under each locale; omit → components
fall back to bundled English chrome), `children`.

```tsx
<AppProviders
  authProvider={ConvexAuthDefaultProvider}
  theme={{ defaultTheme: 'ocean' }}
  i18n={{ messages, defaultLocale: 'en-US' }}
>
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
         createProjectI18n, mergeMessages, MissingTranslationsOverlay, missingKeyStore,
         LOCALE_META, localeMetaFor, SHELL_CATALOG, DEFAULT_SHELL_LOCALE, withShellCatalog } from 'my-react-shell/i18n'
import type { TFunction, I18nContextValue, Locale, LocaleInfo, LocaleMeta, Messages, DotPaths,
              TranslateParams, UseTranslationResult, TypedI18n } from 'my-react-shell/i18n'
```

> **i18n is a core module.** It ships the shell's own **`mrs.*` chrome catalog** (per
> locale, `common-<code>.json`, en-US + nb-NO today — **regioned** codes) that the
> component kit reads for its built-in copy. Consumers merge their own catalogs on top
> and may override any `mrs.*` key. See also `<LanguagePicker>` in the components kit.

| Export | Kind | Summary |
|---|---|---|
| `I18nProvider` | component | Owns active locale; persists; detects browser locale. Takes `messages`. |
| `useTranslation(namespace?)` | hook | Returns `{ t, locale, locales, setLocale }`. `namespace` prefixes keys. |
| `useI18n` | hook | Alias of `useTranslation` (foundation-style naming). |
| `useI18nContext()` | hook | Raw context read; throws outside provider. |
| `useI18nContextOptional()` | hook | Raw context read; returns `null` outside a provider (never throws) — powers soft optional integration (e.g. `<LanguagePicker>`, the kit's built-in chrome copy). |
| `translateNow(key, params?)` | function | Imperative translate for non-render callers (event handlers, toasts). |
| `createTypedI18n<K>()` | function | Returns typed `{ useTranslation, useT, translateNow }` bound to key union `K`. Pure typing sugar — no new runtime. |
| `createProjectI18n(config)` | function | Batteries-included factory: merges a consumer's per-locale catalogs with the shell's bundled `mrs.*` chrome catalog (via `SHELL_CATALOG`, keyed by regioned code, defaulting to `en-US` for an unshipped locale) and returns `{ useTranslation, useT, translateNow, LanguageProvider }` — the `createTypedI18n` surface typed to the combined keys, plus a pre-wired `LanguageProvider`. `config`: `localMessages` (`Record<locale, nested catalog>`), `defaultLanguage` (must be a `localMessages` key), `interpolation` (`'single-brace'` `{name}` · `'double-brace'` `{{name}}`, default `'double-brace'`). |
| `LOCALE_META` | object | Registry `Record<Locale, LocaleMeta>` — `{ code, nativeName, flagSvg }` per shipped locale (`nb-NO`, `en-US`). Drives `<LanguagePicker>` and the `I18nProvider` endonym default label. |
| `localeMetaFor(code)` | function | `LOCALE_META[code]` lookup (`undefined` for an unknown locale). |
| `SHELL_CATALOG` | object | `Record<Locale, Messages>` — the shell's bundled `mrs.*` chrome catalogs, per shipped locale. |
| `DEFAULT_SHELL_LOCALE` | const | `'en-US'` — the fallback locale for `mrs.*` chrome. |
| `withShellCatalog(messages)` | function | Merge the shell's `mrs.*` chrome catalog **under** a consumer's `messages`, per locale (consumer wins). Use when mounting `<I18nProvider>` directly and you want the kit's chrome to localize. `AppProviders({ i18n })` and `createProjectI18n` apply it for you. |
| `mergeMessages(base, override)` | function | Deep-merge catalogs (override wins) — compose a module's strings under a consumer catalog. |
| `flattenMessages(msgs)` | function | Nested catalog → flat dotted map. |
| `interpolate(str, params)` | function | Fill `{{param}}` placeholders. |
| `MissingTranslationsOverlay` | component | Dev-only panel listing missing `key · locale` (gated on `import.meta.env.DEV`). Mount once near root. |
| `missingKeyStore` | object | `subscribe` / `getSnapshot` / `clear` — programmatic missing-key access. |
| `TFunction<K=string>` | type | `(key: K, params?: TranslateParams) => string`. |
| `I18nContextValue<K=string>` | type | `{ t, locale, locales, setLocale }`. |
| `UseTranslationResult<K=string>` | type | Return of `useTranslation`. |
| `NamespacedKeys<K, NS>` | type | Sub-keys of `K` under namespace `NS`. |
| `Locale` | type | `string` (regioned codes: `'en-US'`, `'nb-NO'`, …). |
| `LocaleInfo` | type | `{ code: Locale; label: string }`. When `locales` is omitted, `I18nProvider` defaults each `label` to the locale's `nativeName` from `LOCALE_META` (endonym), falling back to the raw code. |
| `LocaleMeta` | type | `{ code: string; nativeName: string; flagSvg: string }` — a `LOCALE_META` entry. |
| `Messages` | type | Nested catalog: `Record<Locale, nested object>`. |
| `FlatMessages` | type | Flat dotted catalog. |
| `DotPaths<T>` | type | Union of dotted key paths of a catalog object — derive a typed key union from your catalog. |
| `TranslateParams` | type | `Record<string, string \| number>`. |
| `TypedI18n<K>` | type | Shape returned by `createTypedI18n`. |
| `MissingKey` | type | `{ key; locale }` record. |
| `I18nProviderProps`, `MissingTranslationsOverlayProps` | type | Component props. |

**`<I18nProvider>` props:** `messages` **(required**, `Record<locale, nested catalog>`),
`locales` (omit → labels default to `LOCALE_META` endonyms), `defaultLocale` (must be a
`messages` key — **throws** otherwise), `fallbackLocale`, `detectBrowserLocale` (default
`true`), `storageKey`, `resolve` (BYO engine), `onChange` (fires on locale switch, not on
mount — mirror to a backend), `onMissingKey`, `debug`, `children`. To also localize the
kit's built-in chrome, wrap `messages` with `withShellCatalog(...)` (or use
`AppProviders({ i18n })` / `createProjectI18n`, which do it for you).

```tsx
<I18nProvider messages={{ 'en-US': { greeting: 'Hi {{name}}' }, 'nb-NO': { greeting: 'Hei {{name}}' } }}
              defaultLocale="en-US">
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

> **Built-in chrome copy.** Components ship translated defaults for their own chrome from
> the i18n core (the `mrs.*` catalog). So obvious labels — `closeLabel`, `dismissLabel`,
> `confirmLabel`/`cancelLabel`, `removeLabel`, `iconTriggerLabel`, search placeholders,
> loading/no-results states — are **optional props that default to their `mrs.*` key** and
> localize when an `<I18nProvider>` (with the shell catalog merged) is mounted, else render
> in English. Pass the prop only to override. App-specific **content** (titles, data
> labels) stays a **mandatory** prop.

| Export(s) | Kind | Summary |
|---|---|---|
| `LanguagePicker` | component | Language switcher on `DropdownMenu` — a menu of the app's configured locales by native name (endonym) + flag, checkmark on the active one. Reads the i18n seam **softly**: renders nothing with no `<I18nProvider>` or <2 locales. `trigger` (`'flag'` default · `'code'` · `'globe'`), `showFlags` (default `true`), `label` (trigger a11y label, defaults to `mrs.action.selectLanguage`), `align`/`side`, `size` (shared icon-button scale `sm·md·lg·xl`, default `md`). |
| `Flag` | component | Renders a locale's vendored flag SVG (3:2), from `LOCALE_META`. `code` (locale), `className`. Decorative (`aria-hidden`); renders nothing for a locale the shell ships no flag for. |
| `Button` | component | The kit's button. `variant` (solid·soft·outline·ghost·link) × `tone` × `size` (sm·md·lg); native `<button>` props pass through and the `ref` is forwarded to the `<button>`, so it works as a Radix `asChild` trigger (Popover / Tooltip / Dropdown). `leadingIcon`/`trailingIcon` slots for icon+text layouts. |
| `HeaderMenuButton` | component | Ghost neutral small button for the header action zone — a `<DropdownMenu trigger>` with visible label text and an automatic trailing chevron. `leadingIcon` slot for a view/mode icon before the label. All native `<button>` attributes (`aria-label`, `title`, `disabled`, …) pass through. |
| `Input` | component | Un-opinionated native `<input>`. `invalid` (sets `aria-invalid` + error styling), `inputSize` (sm·md·lg; named so it never clashes with native `size`), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`), optional `label` (renders above the input); native input props pass through. **`required`** is shell-managed — it renders the red asterisk on the built-in `label` and sets `aria-required`, but does **not** set the native `required` attribute (no native validation bubble), and turns an empty field's border red once blurred (clearing the moment a value is typed). **`validateOnBlur`** is **on by default when `required` is set** — pass `validateOnBlur={false}` to opt out (asterisk only); the blur-invalid state is OR-ed with the controlled `invalid`, which wins. |
| `Textarea` | component | Un-opinionated native `<textarea>`. `invalid` (sets `aria-invalid` + error styling), `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`), optional `label` (renders above the textarea); native textarea props pass through. **`required`** / **`validateOnBlur`** behave exactly as on `Input` (red asterisk + `aria-required`, no native constraint; red-border-on-blur on by default with `required`, `validateOnBlur={false}` to opt out). |
| `Label` | component | Un-opinionated native `<label>`. `required` appends a subtle decorative red (`aria-hidden`) asterisk; native label props pass through. |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | component | Un-opinionated surface container + parts (`CardTitle` → `<h3>`, `CardDescription` → `<p>`); each spreads native `<div>` props. `--color-surface-primary` panel, bordered, rounded, card elevation. |
| `Separator` | component | Un-opinionated divider. `role="separator"` with `orientation` (`horizontal`·`vertical`) + `aria-orientation`; native `<div>` props pass through. |
| `Skeleton` | component | Un-opinionated pulsing loading placeholder (decorative, `aria-hidden`). Size it with `style`/`className`; native `<div>` props pass through. |
| `Dialog` | component | General controlled dialog on Radix Dialog (overlay, focus trap, portal). `title`/`description`, `children` body, `footer` actions, `showClose` ✕, `headerActions` (icon buttons rendered next to close ✕). Supports optional default footer buttons via `useCancel` and `usePrimary` (accepting a string label or `DialogButtonConfig` configuration object), which can be combined with the custom `footer` content (rendered sequentially as Cancel -> custom footer -> Primary); `size` (`sm`·`md`·`lg`·`xl`·`full`); the body scrolls within a viewport-capped card. `titleActions` puts a control on the heading row; `bleed` drops the kit chrome for a full-bleed / custom-layout dialog; `closeOnBackdrop`/`closeOnEsc` (default `true`) guard dismissal. The ✕ close button **follows the app's icons↔emojis mode automatically** (lucide icon → ❌ emoji) with no wiring — via the icons seam, read softly so it falls back to the icon when that module isn't installed; the optional `iconMode` (`'icon'`·`'emoji'`) prop overrides it. A nested Radix popper (`Select`, `DropdownMenu`, `Popover`, combobox) is handled automatically — opening it and clicking elsewhere inside the dialog dismisses only the popper, never the dialog. |
| `Popover` | component | Simple, opinionated floating panel on Radix Popover (focus management, outside-click / Esc close, portal). `trigger` anchor + `children` panel; controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`); `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-popover` optional peer. |
| `DropdownMenu` | component | Data-driven menu on Radix DropdownMenu (keyboard nav, outside-click / Esc close, portal). Anchor via `trigger` (any node, `asChild`) **or** `iconTrigger` (an icon element; the kit renders its own square ghost button — `iconTriggerLabel`, its accessible name, defaults to the built-in `mrs.action.actions`; pass to override — `iconTriggerSize` picks its box on the shared icon-button scale `sm·md·lg·xl`, default `md`). Uncontrolled by default; pass `open` + `onOpenChange` (and optionally `defaultOpen`) to drive it programmatically. `onOpenChange(open)` fires on open/close. `items` — a discriminated union of `item` (plain action, closes on select; carries `icon`/`disabled`/`danger`) · `separator` · `label` · `checkbox` (independent toggle, controlled `checked`/`onCheckedChange`) · `radio-group` (one-of-a-group, controlled `value`/`onValueChange` + `options`) · `submenu` (nested `items`, arbitrary depth). Checkbox/radio rows keep the menu open by default (per-item `closeOnSelect` to close); selected/checked state is fully consumer-controlled. `side`/`align`/`sideOffset` placement. Uses the `@radix-ui/react-dropdown-menu` optional peer. |
| `ContextMenu` | component | Cursor-anchored right-click menu, built on `DropdownMenu` (same `items` union — action rows, `separator` dividers, `label`, `checkbox`, `radio-group`, `submenu` — same hover/keyboard/select behavior and theme styling). Optional `title` renders as a non-interactive heading above the items. Two modes: **wrapping** — pass a single `children` element; the kit clones it to attach `onContextMenu`, capturing the pointer position, suppressing the browser's native menu, and opening at the cursor (`disabled` skips this); **controlled** — omit `children` and drive `open` / `position` (`{ x, y }`, typically `event.clientX/clientY`) / `onOpenChange` yourself, for a trigger that isn't one DOM node (e.g. one slice of an SVG/canvas chart, a virtualized row). |
| `Alert` | component | Inline alert/callout. `tone`: `info`·`success`·`warning`·`danger`; `title`, `icon`, `onDismiss`, `role`. |
| `InfoBox` | component | Neutral, tone-free contextual note (icon + title + body). Use `Alert` when the message carries a semantic tone. |
| `EmptyState` | component | Centered zero-state: optional icon, required `title`, `description`, action slot. |
| `EmptyStateAddButton` | component | Add button for empty states. This is a replacement for the typical "You do not have any items yet" text that agents often put on empty lists — when using this button such text must be replaced by the button, not kept in addition to the button. Two shapes: `showBorder` (default `true`) → full-width dashed rectangle (in-list / sidebar); `showBorder={false}` → bare button + label (hero / full-page void). `label` is required (displayed below the button and used as `aria-label`). Optional `description` for a secondary line (hero shape). `icon` defaults to a plus sign. `tone` defaults to `success`. `size`: `sm`·`md`·`lg`. |
| `Spinner`, `PageSpinner`, `SectionSpinner` | component | Rotating indicator on the current text color; block variants center it for page/section loading. |
| `ConfirmDialog` | component | Controlled confirm dialog on Radix Dialog (overlay, focus trap, Esc/backdrop close). The confirm button (right) label defaults to the built-in, locale-aware `mrs.action.ok`; pass `confirmLabel` for anything else. The cancel button (left) is **opt-in** — rendered only when at least one of `showCancel`, `onCancel`, `cancelLabel`, or `useCancel` is set (default cancel label `mrs.action.cancel`). `tone` accepts the full `Tone` vocabulary (`primary`/`neutral`/`info`/`success`/`warning`/`danger`): it colours a leading tone icon and the confirm button, which stays `primary` for every tone except `danger`/`warning` (which adopt the tone). Override or drop the icon via `icon` (`ReactNode` \| `false`). Buttons can also be configured via `useCancel`/`useConfirm` (a string label or `DialogButtonConfig`, whose `tone` supports all `Tone`s). A nested Radix popper in a custom `children` body (e.g. a `Select`) won't dismiss the dialog when clicked away from. |
| `ToastProvider`, `useToast` | component + hook | Mount provider once; fire toasts via `useToast()` (`.success`/`.error`/…). Each renders as an `Alert`; auto-dismiss (3s; `duration:0` sticky). `dismissLabel` (the accessible name for a dismissible toast's ✕) defaults to the built-in `mrs.action.dismiss`; pass to override. |
| `ActionButton`, `ActionButtonGroup`, `actionPresets` | component + const | Icon/emoji + label action button with presets (table below). `actionPresets` is the `{ tone, emoji }` map — presets carry **no text**; pass a translated `label` (visible) and/or `aria-label`/`hint` (accessible name). With none, the button is icon-only and **unnamed**. |
| `CopyButton` | component | Copy-to-clipboard action button on `ActionButton`. Click writes `value` to the clipboard, then shows a transient green **check** (`success` tone; ✅ in emoji mode) confirmation. `label` is **optional** (absent → icon only — give it an `aria-label`/`hint`); optional `copiedLabel`, `onCopy(ok)` callback (surface failures via your own toast — the kit can't), `copiedDuration` (default `1500`ms). Carries no text default; pass translated strings. See [below](#copybutton). |
| `Badge` | component | Status/category badge; tones `primary`·`neutral`·`success`·`warning`·`danger`·`info` (`primary` is a solid pill); optional status `dot`. Forwards standard `<span>` attributes (`title`, `aria-*`, `data-*`, `id`, events) to the root. |
| `CountPill` | component | Small solid-fill numeric count pill (unread counts, tab counts, a bell overlay). `count`; tones `primary`·`secondary`·`success`·`warning`·`danger`·`info`; clamps at `max` (default `99` → `99+`), `tabular-nums`. Caller gates visibility and positions any overlay via `className`. Forwards standard `<span>` attributes. |
| `Chip`, `ChipGroup` | component | Tag: plain / toggleable (`selected`+`onClick`) / removable (`onRemove`). `ChipGroup` wraps. |
| `Avatar`, `AvatarGroup` | component | Image + initials fallback (also on image error); falls back to a person icon/emoji when no `fallback` is set (`showEmoji` follows the icons↔emojis seam); group stacks with `+N` overflow. |
| `Table` | component | Column-config data table: per-column sort, zebra, sticky header, empty state. Whole-row click (`onRowClick`, suppressed for clicks on in-cell controls/expand cells), an expandable per-row detail region (`renderExpanded`, kit-owned disclosure toggle + open state, full-width below the row; supply `renderDisclosure(row, isOpen, toggle)` to replace the kit's chevron with a consumer-styled control), per-cell expansion (`TableColumn.cellExpand(row)` — clicking cells in that column toggles a detail region keyed to that column, radio-style; one cell open at a time), per-row emphasis (`rowVariant`: `default`·`muted`·`selected`), and `frameless` to drop the wrapper border/radius when nesting inside a `Card`. `columns` is a plain array, so a dynamic column set can be built at render time. `TableColumn.align` sets the alignment for both the header and content cells equally (default `left`); `TableColumn.headerAlign` overrides alignment for just the header, leaving content at `align`. |
| `PhiCard`, `PHI` | component + const | **Legacy — being phased out; prefer `StatCard`/`ContentCard`.** Golden-ratio card (W:H = φ:1): a figure (`icon`/`image`) fills its column, a centered text body (`upper` + `content`), and a structured `footer` (meta lines + stacked badges, per-size caps) or freeform `lower`. Collapses when there's no footer. Top-right ⋮ menu via `actions` or a `corner` slot. Uses the `@radix-ui/react-dropdown-menu` optional peer. No `renderLink` navigation seam (use a non-legacy card for nav tiles). |
| `StatCard` | component | Self-contained φ-framed KPI/status card — a fixed-width golden-ratio card (`height = width / φ`); `size` default `md` ≈312px, four to a `wide` (1440px) row. Title + subtitle, an optional corner accent medallion (SVG arc-ring, `value`/`max` both mandatory) — or a `locked` padlock indicator (closed/open/absent) that replaces it — a stats row, and a structured `footer` or freeform `lower`. Accent stripe (`accentPlacement` top/left) + medallion tint driven by `tone` (semantic tokens) or a raw CSS `color`. `variant` (`'warning'`·`'danger'`) overrides tone, forces ⚠️ watermark. Optional left-edge completion gauge (`sideBarCompleteness`, red→amber→green) that coexists with the top stripe, or drives the whole accent's color via `topStripeFollowsGauge`. Optional emoji or ReactNode `watermark` (`autoscaleWatermark` scales a glyph to watermark size, default on). Optional `icon` with placements (`title` inline · four corners · `center`; `upperRight` dev-throws against the medallion, `center` against `stats`). Hover-lift via `onClick`/`hoverable`; `dimmed` renders it monochrome + faded (inactive-looking) while still firing `onClick`/`renderLink`. Optional `info` button (blue ⓘ, lower-right or lower-left corner) that opens a dialog with a title, optional description, and optional content (plain string or numbered sections). |
| `ContentCard` | component | Self-contained freeform text or custom-layout counterpart to `StatCard` — same fixed-width golden-ratio sizing (`size` default `md` ≈312px). Title + subtitle, and either a freeform `content` string (supports `html` prop, safely sanitized internally via DOMPurify) OR arbitrary `children` (mutually exclusive with `content`), and a structured `footer` or freeform `lower`. Text/children align via `contentAlignX`/`contentAlignY`. Instead of a medallion, accepts `value` and `maxValue` to render a left-side completion gauge. Same `tone`, `color`, `variant`, `watermark`/`autoscaleWatermark`, and `icon` (placements: `title`/corners/`center`; `center` dev-throws against `content`/`children`) properties as `StatCard`. |
| `PaperCard` | component | Small **preview / thumbnail** card styled as a dog-eared sheet of paper at **A4 portrait** proportions (`height = width × √2`). Fixed-width size scale (`sm` 134 · `md` 168 · `lg` 210 · `xl` 264 · `xxl` 320 px, **default `md`**); the folded top-right corner is cut from the sheet with `clip-path`, and the drop shadow rides a wrapper (`filter: drop-shadow()`) so it follows the dog-eared silhouette. Title + optional subtitle / `content` (+ `contentAlignX/Y`, `maxLines`), shared `{ lines, badges }` `footer`, a raised `corner` action slot, **opt-in** `tone`/`color` top/left accent (none by default), `watermark` (faint decorative glyph — a **`string`** drawn via the sheet's CSS `::after`, **or** a **`ReactNode`** art layer, e.g. an `<AppIcon>`/`<img>`, matching `StatCard`/`ContentCard`/`DynamicGridCard`) and `image` (a real full-opacity preview layer, e.g. a rendered PDF page), an `icon` with placements (`title`/corners/`center`; `upperRight` dev-throws against `corner`, `center` against `content`/`image`), `autoscaleWatermark` (scales a glyph watermark, default on), hover-lift, `showDragHandle`, and the `renderLink` block-link overlay. Fixed-size → drops into the static `CardGrid`. |
| `CardGrid` | component | **Static** card grid: fixed-size cards flow left-to-right and **wrap** when a row is full, separated by a fixed `gap`. Cards are **not** stretched (a larger gap may remain at the end of a row) and keep their own intrinsic width/height (`StatCard`/`ContentCard`/`PhiCard`/`PaperCard`). `align` (`start`·`center`, default `start`), `gap` (CSS length override; default `1.5rem`, sized so four ≈312px cards fit a `wide` row). Children-based. |
| `DynamicCardGrid` | component | **Fluid** card grid with a built-in search / filter / sort toolbar. Cards stretch to fill uniform `1fr` columns sized by `cardSize` (`sm`·`md`·`lg`) or a raw `minColumnWidth`. Data-driven via `items` / `renderCard` / `getKey`; `filters`, `sortOptions`, `searchFields`/`searchFn`, `loading`, empty + no-results states. Pair with `DynamicGridCard`. |
| `DynamicGridCard` | component | Fluid card for `DynamicCardGrid`: stretches to `width:100%` of its column, inherits the grid's max-width cap, keeps the golden-ratio shape via `aspect-ratio`. Optional `title` / `subtitle` / `icon` / `footer` slots, primary content as `children`. Typography/icon scale always follow the enclosing grid's `cardSize` (or `'md'` standalone); `sizeLimit` (`0`–`5`) steps just the width cap down toward the next-smaller tier. `shape` (`standard` = φ:1 · `landscape` = φ²:1), `watermark` — `string` (faint oversized emoji, centred, dropped a little below centre) **or** a `ReactNode` art layer (e.g. a `DrawerMark`), with `autoscaleWatermark` (default on) scaling a glyph to watermark size; an element watermark makes the card root a `mrs-reveal-host`. `icon` supports placements (`title` inline · four corners · `center`; `upperRight` dev-throws against `corner`, `center` against `children`). Optional accent stripe (`accentPlacement` top/left) driven by `tone` (semantic tokens) or a raw CSS `color`. Acts as a **whole-card navigation link** via `renderLink` (consumer supplies its router `<Link>`, rendered as a full-bleed block-link overlay), with a `hoverable` background-tint hover state (`lift` adds movement) and a raised `corner` action slot. Drag-reorder grip via `showDragHandle` (or a custom `dragHandle` node) + `dragHandleProps` (vertical stripes, right-edge centred). |
| `DynamicNavCards` | component | A **self-contained grid of lean navigation tiles**. It renders its own tile element (**not** a `DynamicGridCard`) but drives it through the same `DynamicCardGrid`, so it inherits the fluid `1fr` columns, `cardSize` scale, and the search / filter / sort toolbar — pass the full `DynamicCardGridProps` surface minus `renderCard`, replaced by **`getCard`** (maps each item to its tile). Each tile's single **required** `title` is its **centred main content**, sized fluidly by label length — **large when the label is short, stepping down and clamped at two lines** as it grows. Per-tile: `renderLink` whole-tile navigation (accessible name auto-wired from `title`), `onClick`, `hoverable`/`lift`, `tone`/`color` accent (`accentPlacement` top/left), freeform `footer`, a raised `corner` slot, and `watermark` (+ `autoscaleWatermark`). Reach for it to build a grid of navigation links. |
| `NavTile` | component | The **single-tile primitive** behind `DynamicNavCards` — one tile, its own element, taking one `DynamicNavCard`. Use it to place a lone tile *outside* the grid (e.g. wrapped in a drag handle) while keeping the exact tile look. |
| `RevealMark` | component | Hover-reveal seam: two stacked layers (`closed` / `revealed`) that cross-fade. The `revealed` layer replaces `closed` when the mark's nearest `.mrs-reveal-host` ancestor is hovered, or unconditionally when `open` is `true` (e.g. the active route). Purely decorative (`aria-hidden`); meant for a card's `watermark` slot. Build new openable marks on it. |
| `DrawerMark` | component | First `RevealMark` instance — an **isometric drawer** that rests as a closed box and slides open (tray with a gray interior floor + walls and one sheet lying flat inside) on hover, or stays open via `open`. Fully theme-token-driven; the gray interior is a `color-mix` of `--color-text-primary` into the surface, so it inverts between light/dark mode. Drop into `DynamicGridCard`'s `watermark`. |
| `InputField` | component | Full field: label + input + helper + error, a11y-wired (`htmlFor`/`aria-invalid`/`aria-describedby`). Spreads native input props; pass `error` to switch on error styling. `inputSize` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale. `onDebouncedChange(value)` (fires `debounceMs` after the user stops typing; default 500 ms), `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`). **`required`** renders the red asterisk on the label, sets `aria-required` (no native constraint), and turns an empty field's border red once blurred (no message text — pass `error` for one), OR-ed with the controlled `error`, which wins. Pass **`validateOnBlur={false}`** to opt out of the blur behaviour (asterisk only). |
| `SegmentedControl` | component | Single-select `radiogroup` on a track; controlled via `value`/`onChange`; generic over value type. Each `SegmentedOption` accepts an optional `icon` (any node; use `currentColor` to inherit tone), `iconPosition` (`'leading'`·`'trailing'`, default leading), and `tone` (the shared `Tone` — colours that option's label + icon across active/inactive states), plus `disabled`. |
| `Select` | component | Opinionated select on Radix Select (keyboard nav, typeahead, portal); `options` list; controlled via `value`/`onValueChange`; `size` (`sm`·`md`·`lg`, default `md`) matches the `Input` height/padding scale; `saveStatus` (visual status `'idle'`·`'pending'`·`'saving'`·`'saved'`·`'error'`); optional `label` (renders above the select trigger); supports custom `className` and `style` on the trigger. **`required`** renders the red asterisk on the `label`, sets `aria-required` on the trigger (no native constraint), and turns the trigger border red once blurred with no value selected (clearing on selection); pass **`validateOnBlur={false}`** to opt out (asterisk only). |
| `Checkbox` | component | Un-opinionated checkbox on Radix Checkbox; tri-state (`checked` · unchecked · `'indeterminate'`); hand-rolled check/dash glyph; checked box fills `--color-primary`. Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`/`required`). Uses the `@radix-ui/react-checkbox` optional peer. Supports custom `className` and `style` on the root. |
| `Switch` | component | Un-opinionated toggle on Radix Switch; track + sliding thumb (checked track `--color-primary`). Controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`); form-aware (`name`/`value`). Optional `label`, `labelPlacement` (`left`·`right`, default `right`), and `fullWidth` (places label and toggle on opposite sides without stretching the track). Uses the `@radix-ui/react-switch` optional peer. Supports custom `className` and `style` on the root/wrapper. |
| `RadioGroup` | component | Single-select set on Radix RadioGroup with roving arrow-key focus; data-driven via `options`; selected dot fills `--color-primary`; `orientation` (`vertical`·`horizontal`). Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`); form-aware (`name`). Uses the `@radix-ui/react-radio-group` optional peer. Supports custom `className` and `style` on the root. |
| `ColorPicker` | component | General popover color picker. **Free** by default — a full hue/saturation range (via the `react-colorful` optional peer); `onChange` emits in `format` (`hex`·`rgb`·`hsl`). Pass a `colors` set to **constrain** it to a swatch grid. Controlled; `value` is a directly-usable CSS color string. `placeholder` and `hexLabel` are **required** — pass translated strings. See [below](#colorpicker). Supports custom `className` and `style` on the root. |
| `UserPreferences` | component | Controlled settings panel: a **theme** group (palette + light/dark/system) and a **display** group (optional icons↔emojis + optional menu-size control `small·medium·large`, the latter wired to `useMenuSize()`). Persists nothing — emits `onChange`. Auth-free (`accountActions` slot). Theme/mode/icons label props are **required**; the menu-size labels default to `mrs.*` chrome keys; `description` is optional. Pass `trigger` to replace the built-in trigger, or `triggerSize` (shared icon-button scale `sm·md·lg·xl`, default `md`) to size the built-in one. |
| `Collapsible` | component | Single disclosure on Radix Collapsible: one trigger toggles one region. Controlled (`expanded`) / uncontrolled (`defaultExpanded`); static `trigger` or `renderTrigger(expanded)`; rotating chevron; `variant` (`default`·`bordered`·`ghost`·`filled`), `size`, `inlineChevron`, `animationDuration`. Uses the `@radix-ui/react-collapsible` optional peer. See [below](#collapsible). |
| `Accordion` | component | Grouped disclosures on Radix Accordion: roving arrow-key focus, single (one-open) or `multiple` open. Data-driven via `items`; controlled `value`/`onValueChange` or `defaultValue`; `variant` (`default`·`bordered`·`separated`), `size`. Uses the `@radix-ui/react-accordion` optional peer. See [below](#accordion). |
| `Tabs` | component | General content tabs on Radix Tabs (roving arrow-key focus, `aria` wiring): a trigger list over swappable panels, active trigger marked with a `--color-primary` indicator. Data-driven via `tabs`; controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`, defaults to first); `orientation` (`horizontal`·`vertical`). Distinct from the app-shell page tabs. Uses the `@radix-ui/react-tabs` optional peer. |
| `Tooltip` | component | Ergonomic single-component tooltip on Radix Tooltip — `content` + `children` (the trigger); mounts its own `Provider` internally, portals the bubble. `side`/`align`/`sideOffset`/`delayDuration`; optional controlled `open`/`onOpenChange`. Uses the `@radix-ui/react-tooltip` optional peer. |
| `Slider` | component | Un-opinionated range slider on Radix Slider; track + filled range + one thumb per value (pass a one- or two-element `value` for single/range), keyboard- and form-aware. `min`/`max`/`step`/`minStepsBetweenThumbs`, `orientation` (`horizontal`·`vertical`), `tone` (fill colour, default `primary`). Controlled (`value`/`onValueChange`, plus `onValueCommit`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-slider` optional peer. Supports custom `className` and `style` on the root. |
| `Progress` | component | Un-opinionated progress bar on Radix Progress; fill paints with `tone` (default `primary`), `size` (`sm`·`md`·`lg`). Pass numeric `value` (`0…max`) for a determinate bar or `null`/omit for an indeterminate loop. Radix wires the ARIA. Uses the `@radix-ui/react-progress` optional peer. |
| `Toggle` | component | Un-opinionated two-state button on Radix Toggle; pressed fills `--color-primary-bg`. `variant` (`ghost`·`outline`·`plain`), `size` (`sm`·`md`·`lg`). `plain` is a bare icon — no border/background/press/hover fill (keeps the focus ring) — for an unadorned icon toggle. Controlled (`pressed`/`onPressedChange`) or uncontrolled (`defaultPressed`). Uses the `@radix-ui/react-toggle` optional peer. |
| `ToggleGroup` | component | Un-opinionated set of toggle buttons on Radix ToggleGroup; data-driven via `options`. `type="single"` (value is the chosen string, or `undefined`) or `type="multiple"` (value is an array); shared `variant`/`size`. Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`). Uses the `@radix-ui/react-toggle-group` optional peer. |
| `Sheet` | component | Overlay panel that slides in from any edge on Radix Dialog (focus trap, Esc/outside-click close, portal). `side` (`left`·`right`·`top`·`bottom`), `size` (`sm`·`md`·`lg`·`xl`·`full` — width for left/right, height for top/bottom). Optional `trigger`; built-in header (`title`/`header`/`description` + ✕ `showClose` + `headerActions` next to ✕) or `bare` (child owns the panel). The ✕ close button **follows the app's icons↔emojis mode automatically** (lucide icon → ❌ emoji) with no wiring — via the icons seam, read softly so it falls back to the icon when that module isn't installed; the optional `iconMode` (`'icon'`·`'emoji'`) prop overrides it. `scrim={false}` + `modal={false}` for a non-blocking float over a still-interactive page. `permanent` (`'sm'` = ≥640px · `'lg'` = ≥1024px) makes the sheet an **inline, non-dismissible layout panel** at/above that breakpoint (no portal/overlay/close, occupies real UI space — place `<Sheet>` as a flex/grid sibling of the content it flanks) and a normal modal sheet below it; above the breakpoint `trigger`/`scrim`/`modal`/`showClose`/`open`/dismiss handlers are ignored. Controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`). A nested Radix popper (`Select`, `DropdownMenu`, `Popover`) is handled automatically — opening it and clicking elsewhere inside the sheet dismisses only the popper, never the sheet. Uses the `@radix-ui/react-dialog` optional peer. |
| `Calendar` | component | Themed month-grid calendar on `react-day-picker`; single/multiple/range selection (`mode`/`selected`/`onSelect`), full keyboard nav + ARIA, rendered against the tokens via `mrs-` classes (no react-day-picker stylesheet needed). Forwards every react-day-picker prop (`disabled`, `startMonth`/`endMonth`, `numberOfMonths`, `captionLayout`, …). Uses the `react-day-picker` + `date-fns` optional peers. |
| `DatePicker` | component | Single-date field — a trigger button (showing the picked date, `displayFormat` via date-fns) that opens a `Calendar` in a Radix Popover; closes on pick. `disabledDays` (a react-day-picker matcher), `startMonth`/`endMonth`. Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`). Uses the `react-day-picker` + `date-fns` + `@radix-ui/react-popover` optional peers. Supports custom `className` and `style` on the trigger. |
| `EmojiPicker` | component | Full emoji picker panel — search input, scrollable category tabs (with a frequently-used tab), and an 8-column emoji grid. Ships no popover or trigger; embed inline or drop into a `<Popover>`. `onSelect(emoji)` receives the emoji character string. `locale` (default `'en'`; `'nb'` also bundled, others fall back to `'en'`), `showSearch` (default `true`) — all optional chrome, defaulting through `mrs.*` (`searchPlaceholder` → `mrs.action.search`, `noResultsLabel` → `mrs.state.noResults`, `categoriesLabel` → `mrs.emoji.categories`, `frequentLabel` → `mrs.emoji.frequent`). Optional `onClear()` shows a clear button next to the search input — call your own `setValue(undefined)` from it; omitted, the button is hidden. Its accessible label is `clearLabel`, defaulting to `mrs.action.clear`. Requires the `emojibase-data` optional peer. |
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
`DropdownMenuRadioOption`, `DropdownMenuSubmenuItem`, `ContextMenuProps`,
`AlertProps`, `AlertTone`,
`TableProps`, `TableColumn`, `TableRowVariant`, `ToastApi`, `ToastOptions`, `ToastTone`, `SelectProps`,
`SelectOption`, `SelectSize`, `SegmentedOption`, `BadgeTone`, `CountPillProps`, `CountPillTone`, `AvatarSize`, `ActionType`,
`ActionPreset`, `ActionButtonTone`/`Size`/`Layout`, `CopyButtonProps`, `PhiCardProps`, `PhiCardAction`,
`PhiCardSize`, `PhiCardFooter`, `PhiCardFooterLine`, `PhiCardFooterLineType`,
`CardIconPlacement`, `CardIconConfig`,
`StatCardProps`, `StatCardSize`, `StatCardMedallion`, `StatItem`, `StatCardTone`, `StatCardVariant`,
`StatCardFooter`, `StatCardFooterLine`, `StatCardFooterLineType`, `StatCardIconPlacement`, `StatCardIconConfig`,
`StatCardInfo`, `StatCardInfoSection`,
`ContentCardProps`, `ContentCardSize`, `ContentCardTone`, `ContentCardVariant`,
`ContentCardFooter`, `ContentCardFooterLine`, `ContentCardFooterLineType`, `ContentCardIconPlacement`, `ContentCardIconConfig`,
`PaperCardProps`, `PaperCardSize`, `PaperCardTone`, `PaperCardFooter`, `PaperCardFooterLine`, `PaperCardFooterLineType`, `PaperCardIconPlacement`, `PaperCardIconConfig`, `PaperCardLinkProps`,
`RevealMarkProps`, `DrawerMarkProps`,
`CardGridProps`, `DynamicCardGridProps`, `ToggleFilter`, `SortOption`,
`DynamicGridCardProps`, `DynamicGridCardSize`, `DynamicGridCardShape`, `DynamicGridCardIconPlacement`, `DynamicGridCardIconConfig`, `DynamicGridCardFooter`, `DynamicGridCardFooterLine`, `DynamicGridCardFooterLineType`, `DynamicGridCardLinkProps`,
`DynamicNavCardsProps`, `DynamicNavCard`, `DynamicNavCardLinkProps`, `ColorPickerProps`,
`ColorFormat`, `CollapsibleProps`, `CollapsibleVariant`, `CollapsibleSize`,
`AccordionProps`, `AccordionItem`, `AccordionVariant`, `AccordionSize`,
`CheckboxProps`, `SwitchProps`, `RadioGroupProps`, `RadioOption`,
`TabsProps`, `TabItem`, `TooltipProps`, `SliderProps`, `ProgressProps`, `ProgressSize`,
`ToggleProps`, `ToggleVariant`, `ToggleSize`, `ToggleGroupProps`, `ToggleGroupOption`,
`ToggleGroupSingleProps`, `ToggleGroupMultipleProps`, `SheetProps`, `SheetSide`,
`SheetSize`, `SheetPermanentBreakpoint`, `CalendarProps`, `DatePickerProps`, `EmojiPickerProps`, `EmojiBarProps`, etc.).

**Semantic colour is one shared vocabulary.** The kit exports a canonical **`Tone`** type
(`primary`·`neutral`·`info`·`success`·`warning`·`danger`) and its **`TONE_COLOR`**
`--color-*` map; **`tone`** carries semantic colour, **`variant`** structural style only.
Full convention + the per-component narrowings:
[components guide](../guides/components.md#semantic-colour-is-one-shared-vocabulary).

```tsx
<Alert tone="warning" title="Heads up" onDismiss={() => {}}>Session expires soon.</Alert>

// ConfirmDialog — simplest form: OK-only acknowledgement (no cancel, English OK default):
<ConfirmDialog open={open} onOpenChange={setOpen} title="Saved"
  description="Your changes were applied." tone="success" />

// ConfirmDialog — destructive, cancel opt-in via translated labels:
<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete this item?"
  description="This cannot be undone." tone="danger"
  confirmLabel={t('common.delete')} cancelLabel={t('common.cancel')}
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
drops it), `onDismiss` (renders a dismiss button), `dismissLabel` (its accessible name; defaults to
the built-in `mrs.action.dismiss`, pass to override), role (`'alert'` |
`'status'`), className.

### `ActionButton`

An opinionated icon/emoji + label action button. **Presets** (each carries the correct
hand-rolled SVG **and** an emoji + a semantic color — **no text**):
`add` · `edit` · `delete` · `copy` · `share` · `download` · `upload` · `save` ·
`search` · `refresh` · `settings` · `star` · `close` · `more`. For anything without a
preset, pass a custom `icon` node (a lucide icon or an `<Icon>` from `my-react-shell/icons`).
The kit never renders a hardcoded language: pass a translated `label` (visible) and/or
`aria-label`/`hint` (accessible name). With none, the button is icon-only and **unnamed**.

| Prop | Default | Meaning |
|---|---|---|
| `action` | — | A preset supplying glyph + emoji + color (no text). **Either `action` or `icon` is required.** |
| `icon` | per-preset | Custom glyph node. Required when there's no `action`; overrides the preset glyph otherwise. |
| `emoji` | per-preset | Override the preset emoji (shown when `showEmoji`). |
| `label` | — | Visible label text. No default — pass a translated string; absent → icon only. |
| `showEmoji` | `false` | Render the emoji instead of the SVG — wire to `useIconMode().isEmoji`. |
| `tone` | preset / `neutral` | `primary`·`neutral`·`info`·`success`·`warning`·`danger`. |
| `size` | `sm` | `xs`·`sm`·`md`·`lg`·`xl` — drives padding, glyph, and label size. |
| `layout` | `vertical` | `vertical` (glyph over label) or `inline` (glyph left of label). |
| `active` | — | For `action="star"`: filled + `aria-pressed` when true. |
| `coloredLabel` | `false` | Let the label take the variant color instead of staying neutral. |
| `hint` | — | Native tooltip (`title` attribute). |
| `disabled` / `type` / `onClick` / `aria-label` / `className` | — | Usual button props; `aria-label` falls back to the visible `label`, then `hint`. No language default — absent → unnamed. |

All other native `<button>` attributes pass straight through to the `<button>`, and the
`ref` is forwarded to it — so an `ActionButton` works directly as a Radix `asChild`
trigger (e.g. a `Popover` / `Tooltip` / `DropdownMenu` anchor) with no wrapper element.

> Placed in the page-header band's `actions` slot, an `ActionButton` always renders inline
> (glyph before label) regardless of `layout`. See
> [components guide](../guides/components.md#actionbutton--header-band-layout).

```tsx
<ActionButtonGroup>
  <ActionButton action="add" label={t('action.add')} onClick={onAdd} />
  <ActionButton action="delete" aria-label={t('action.delete')} showEmoji={useIconMode().isEmoji} onClick={onDelete} />
  <ActionButton action="star" active={isFavorite} aria-label={t('action.favorite')} onClick={toggleFavorite} />
  <ActionButton icon={<Upload size={20} />} label="Import" tone="info" onClick={onImport} />
</ActionButtonGroup>
```

### `CopyButton`

A copy-to-clipboard action button built on `ActionButton`. Click writes `value` to the
clipboard (`navigator.clipboard.writeText`), then the glyph swaps to a green **check** and
the tone goes `success` for `copiedDuration` ms before returning to the `copy` glyph. It
carries **no text default** (see [ActionButton](#actionbutton) — same rule); the label is
optional, so with none it's an icon-only button — give it an `aria-label` or `hint`.

| Prop | Default | Meaning |
|---|---|---|
| `value` | — | **Required.** The text written to the clipboard on click. |
| `label` | — | Visible label (idle). No default — pass a translated string; absent → icon only. |
| `copiedLabel` | — | Visible label shown briefly after a successful copy — replaces `label`. Absent → the label is unchanged and the confirmation is the check alone. Pass a translated string. |
| `onCopy` | — | `(ok: boolean) => void` — fired after each attempt: `true` on success, `false` if the write failed or the Clipboard API is unavailable (e.g. an insecure context). Surface failures via your own toast — the kit can't. |
| `copiedDuration` | `1500` | How long the copied confirmation shows, in ms. `<= 0` keeps it until the next copy. |
| `showEmoji` | `false` | Render the emoji (📋 idle, ✅ copied) instead of the SVG — wire to `useIconMode().isEmoji`. |
| `tone` | `neutral` | Idle tone; the copied state is always `success`. |
| `size` | `sm` | `xs`·`sm`·`md`·`lg`·`xl` — drives padding, glyph, and label size. |
| `layout` | `vertical` | `vertical` (glyph over label) or `inline` (glyph left of label). |
| `coloredLabel` | `false` | Let the idle label take the tone color. The copied label is always colored (green). |
| `hint` / `disabled` / `onClick` / `aria-label` / `className` | — | Usual button props, forwarded to the underlying `<button>` (`ref` too); `onClick` fires before the copy. |

```tsx
// Icon-only (label optional) — name it for a11y:
<CopyButton value={inviteUrl} aria-label={t('action.copyLink')} showEmoji={useIconMode().isEmoji} />

// With a visible label that swaps on success:
<CopyButton value={apiKey} label={t('action.copy')} copiedLabel={t('action.copied')} layout="inline" />

// Toast on failure (the kit can't — you own i18n):
<CopyButton value={code} label={t('action.copy')} onCopy={(ok) => { if (!ok) toast.error(t('copy.failed')) }} />
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
| `hexLabel` | — | Accessible label for the hex input (free `hex` mode). **Required** — pass a translated string. |
| `disabled` / `aria-label` / `className` | — | Usual control props; `aria-label` falls back to a string `label`. |

```tsx
const [color, setColor] = useState('#3b82f6')
<ColorPicker label="Any color" placeholder={t('color.pick')} hexLabel={t('color.hex')} value={color} onChange={setColor} />
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
| `menuLabel` | — | Accessible name for the ⋮ menu trigger. No default — pass a translated string when `actions` are set; absent → the ⋮ glyph stands alone. |
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

Self-contained φ-framed KPI / status card (`height = width / φ`): title + subtitle, a corner
accent **medallion** (arc-ring), a stats row, and a structured `footer` or freeform `lower`.
`size` widths `sm` 240 · `md` 312 · `lg` 400 · `xl` 520 px (default `md`). Acts as a
whole-card link via `renderLink`. Medallion, gauge (`sideBarCompleteness`,
`topStripeFollowsGauge`), `variant`, and worked examples:
[card guide → StatCard](../guides/card-grid.md#statcard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Auto-fits: a very long title steps its font size down in up to five steps (by character count) so it stays within ~two lines without resizing the card; the deeper steps let a much longer title fit before it ellipsizes. Short titles are unaffected. |
| `subtitle` | — | Optional subtitle below the title. |
| `icon` | — | `ReactNode` shorthand for `{ content: icon, placement: 'title' }` (inline, beside the title block), **or** the full `{ content, placement }` form. `placement`: `'title'` (default, in-flow) · `'upperLeft'`/`'upperRight'`/`'lowerLeft'`/`'lowerRight'` (absolutely positioned corner overlay, never affects layout) · `'center'` (replaces the stats/content area). Dev-throws if `placement: 'upperRight'` combines with `medallion` (both own the top-right corner), or `placement: 'center'` combines with `stats`. **`'upperLeft'` silently falls back to `'title'`** when `title`/`subtitle` is set — the corner would otherwise land on that text (`title` is required, so this is effectively always). Shared placement vocabulary with the other cards (`CardIconPlacement`/`CardIconConfig`). |
| `medallion` | — | `{ value, max, size? }` — the top-right corner arc-ring; `value` and `max` are both **required** (no plain-circle mode). `size` defaults to `'lg'`; `'sm'` renders a smaller footprint. Not rendered when `locked` is set (the padlock takes that corner). |
| `locked` | — | Padlock indicator in the top-right corner — **replaces the `medallion`**. **Checked, not defaulted:** `true` → a **closed** padlock (locked); `false` → an **open** padlock (unlocked); `undefined`/absent → no padlock (medallion renders normally if present). A decorative status glyph (`aria-hidden`) that does **not** gate interaction — `onClick`/`renderLink` still fire. Dev-throws if combined with an `icon` in the `'upperRight'` placement (both own the top-right corner). |
| `onMedallionPress` | — | Optional callback triggered when the medallion is clicked. When set, the medallion renders as a `<button>` with a pressable hover/active lift effect. |
| `tone` | `'neutral'` | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — maps to semantic `--color-*` tokens for the accent stripe and medallion tint. |
| `color` | — | Raw CSS color (overrides `tone`). E.g. `'var(--color-primary)'` or `'#7c3aed'`. |
| `accentPlacement` | `'top'` | Where the accent reads: a `'top'` stripe or a `'left'` bar. |
| `sideBarCompleteness` | — | Left-edge completion gauge — a `0`–`1` fraction (clamped). The colored fill rises from the bottom to `value × height`, interpolating **red → amber → green** (`danger → warning → success` tokens) over a faint track. Independent of `accentPlacement`, so it coexists with a top stripe. **Checked, not defaulted:** `undefined` → no gauge; `0` → gauge with an empty fill. Combining with `accentPlacement='left'` throws in dev; in prod the gauge wins and the left accent stripe is suppressed (no overlap). |
| `topStripeFollowsGauge` | `false` | When `true`, the **whole accent** (top stripe + medallion tint + stat numbers) takes the gauge's completeness color instead of `tone`/`color`, so the card reads as one coherent color, and the stripe is forced to the top edge. Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is present — `undefined` → **no top stripe** (medallion + stats fall back to `tone`/`color`). Throws in dev if combined with `accentPlacement='left'`. |
| `stats` | — | `{ value, label?, max? }[]` — data items. `label` → label above + number below. `max` → compact arc-ring. **Cannot combine `label` and `max` on the same item** (throws in dev). |
| `variant` | — | `'warning'` · `'danger'` — structural alert variant. Overrides `tone` to the same value (accent stripe, medallion tint, and stat numbers all reflect the variant hue) and forces `⚠️` as the watermark background emoji, ignoring the `watermark` prop. |
| `footer` | — | Footer slot: a freeform `ReactNode` (e.g. a CTA pill via `.mrs-stat-card__cta`) **or** a structured `{ lines?, badges? }` (meta lines left, badges right — same shape as `ContentCard`). The two are discriminated automatically. |
| `watermark` | — | Faint background watermark — centred horizontally, positioned slightly below vertical centre. A **`string`** is an oversized emoji (e.g. `'🏆'`); a **`ReactNode`** (e.g. an icon-kit glyph like `<AppIcon>`, or a `DrawerMark`) renders in an art layer behind the content and makes the card root a `mrs-reveal-host` (so a hover-reveal mark opens on card hover). Ignored when `variant` is set. |
| `autoscaleWatermark` | `true` | For a **ReactNode** `watermark` only (ignored for a string/variant watermark): scales the node's intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring the string-emoji watermark — the right behavior for a small icon-kit glyph: a lucide `<svg>`, an emoji drawn as a bundled `<img>` asset (a consumer `EmojiRenderer`'s usual output), or a native-char span (e.g. `<AppIcon>`). The glyph gets `max-width: none` so a consumer reset's `img { max-width: 100% }` (e.g. Tailwind preflight) can't collapse the scaled image. Set `false` for a self-sized illustration (e.g. `DrawerMark`) that already lays itself out at watermark scale. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` = 240/312/400/520px wide; height = width / φ. Default `md` ≈312px → four to a `wide` (1440px) row. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (`height = width / φ²`, shorter box). For light cards (no footer, small content) where the standard height reads too tall; a full stats row + footer can overflow the shorter box. |
| `onClick` | — | Click handler; also enables hover lift. |
| `hoverable` | `!!onClick` | Hover lift (translateY + shadow). |
| `dimmed` | `false` | Renders the card **monochrome and faded** (via `filter: grayscale()` + reduced opacity) so it reads as inactive/unavailable — **without blocking interaction.** `onClick`/`renderLink` still fire and no `disabled`/`aria-disabled` is set (the card stays operable, hover-lift still signals it's live). Purely a visual state: use it for a tile that should *look* inactive but remain clickable. |
| `showDragHandle` / `dragHandle` / `dragHandleProps` / `dragHandleLabel` | — | Drag-reorder grip. `showDragHandle` (boolean) renders the built-in vertical-stripes grip (right-edge, vertically centred); `dragHandle` instead takes a **custom** handle `ReactNode` (implies a visible handle). Spread your DND library's listeners via `dragHandleProps`. `dragHandleLabel` is the handle's accessible name — **no default**; pass a translated string when a handle is shown (or supply `aria-label` via `dragHandleProps`); absent → the grip glyph stands alone. |
| `dragWholeCard` | `false` | Binds DND listeners on the card root so the whole body is the drag trigger. **Cursor:** an open hand (`grab`) when the card is drag-only, or the normal `pointer` when it's also clickable (`onClick`/`hoverable`); a short press-and-hold engages the closed hand (`grabbing`), so a quick click never changes the cursor. Can coexist with a focusable `showDragHandle` grip for keyboard/screen-reader sorting. |
| `renderLink` | — | Interactive-root seam — `(linkProps) => ReactNode`. The consumer renders its router `<Link>` spreading `linkProps` (`className` + auto-wired `aria-labelledby` from the title), adding `to`/`params`. The card mounts it as a **full-bleed block-link overlay** so the whole tile is a real, keyboard-activatable anchor while the root owns its hover/border/focus states; the medallion button (`onMedallionPress`) and drag handle stay raised above it. The shell imports no router; `to`/`params` type-safety lives at the call site. |
| `info` | — | `StatCardInfo` — shows a blue `ⓘ` icon button in a lower corner (default lower-right). Clicking opens a `Dialog` with `title`, optional `description`, and optional `content`. `content` as a `string` renders a plain paragraph; as a `StatCardInfoSection[]` renders numbered-badge sections (badge shows the number only; the section title is separate). TypeScript requires at least one of `description` / `content`. Required fields: `label` (accessible name for the icon button), `title` (dialog heading). Optional: `closeLabel` (accessible name for the dialog ✕; defaults to the built-in `mrs.action.close`), `corner` (`'right'` · `'left'`, default `'right'`). |
| `className` | — | Extra classes. |

```tsx
<StatCard
  size="lg" tone="success" title="Vinnere" subtitle="Unike leverandører"
  watermark="🏆"
  stats={[{ value: 27, label: 'LEV' }, { value: 18, label: 'Bredde' }, { value: 14, label: 'Spisset' }]}
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
  <StatCard title="Active" stats={[{ value: 27, label: 'LIVE' }, { value: 18, label: 'Open' }]} />
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
| `icon` | — | `ReactNode` shorthand for `{ content: icon, placement: 'title' }` (rendered beside the title block), **or** the full `{ content, placement }` form. `placement`: `'title'` (default, in-flow) · `'upperLeft'`/`'upperRight'`/`'lowerLeft'`/`'lowerRight'` (absolutely positioned corner overlay, never affects layout) · `'center'` (replaces `children`). Dev-throws if `placement: 'upperRight'` combines with `corner`, or `placement: 'center'` combines with `children`. **`'upperLeft'` silently falls back to `'title'`** when `title`/`subtitle` is set — the corner would otherwise land on that text; it stays a true corner overlay when both are absent. |
| `footer` | — | Footer slot: a freeform `ReactNode`, or a structured `{ lines?: { text, type? }[]; badges?: ReactNode[] }` (meta lines left, badges right — same shape as `StatCard`/`ContentCard`). |
| `sizeLimit` | — | `0`–`5` — steps the card's own `max-width` cap down from its effective size (the enclosing `DynamicCardGrid`'s `cardSize`, or `'md'` standalone) toward the next-smaller tier's cap, in fifths (`0` = the tier's own cap, `5` = the next-smaller tier's cap). Typography/icon scale are unaffected — they always follow the effective size, never `sizeLimit`. No effect when the effective size is already `'sm'`. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (shorter/wider). |
| `hoverable` | `!!onClick` | Cursor + hover feedback + `:focus-visible` ring on the card root. Default hover feedback is a subtle background tint (`--color-surface-raised`) — see `lift` for movement. |
| `lift` | `false` | Adds a `translateY` + stronger shadow **on top of** the default hover tint, for cards that want a more pronounced affordance. No effect unless `hoverable`. |
| `watermark` | — | Faint background watermark — centred horizontally, dropped a little below centre. A **`string`** is an oversized emoji (e.g. `'🚀'`); a **`ReactNode`** (e.g. a `DrawerMark`) renders in an art layer behind the content and makes the card root a `mrs-reveal-host` (so a hover-reveal mark opens on card hover). |
| `autoscaleWatermark` | `true` | For a **ReactNode** `watermark` only (ignored for a string watermark): scales the node's intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring the string-emoji watermark. Set `false` for a self-sized illustration (e.g. `DrawerMark`). Same as `StatCard`/`ContentCard`/`PaperCard`. |
| `corner` | — | Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered **above** the link overlay (`z-index`) as a sibling of the anchor, so it stays independently clickable — never nested in the link. |
| `tone` | — | Semantic accent hue → a stripe (see `accentPlacement`). **Opt-in** — no accent when unset. `primary`·`info`·`success`·`warning`·`danger`·`neutral`. `color` overrides it. Same accent vocabulary as `StatCard`/`PaperCard`. |
| `color` | — | Raw CSS color for the accent stripe; overrides `tone`. E.g. `'#7c3aed'` or `'var(--color-primary)'`. |
| `accentPlacement` | `'top'` | Where the accent reads when `tone`/`color` is set: a `'top'` stripe or a `'left'` bar. |
| `renderLink` | — | Interactive-root seam. `(linkProps) => ReactNode` — the consumer renders its router `<Link>` spreading `linkProps` (`className` + auto-wired `aria-labelledby` from the title), adding `to`/`params`. The card mounts it as a **full-bleed block-link overlay** so the whole tile is a real, keyboard-activatable anchor while the root `<div>` owns its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives at the call site. |
| `showDragHandle` / `dragHandle` / `dragHandleProps` / `dragHandleLabel` | — | Drag-reorder grip. `showDragHandle` (boolean) renders the built-in **vertical-stripes** handle pinned to the **right edge, vertically centred**; `dragHandle` instead takes a custom handle `ReactNode` (implies a visible handle). Spread your DND library's listeners via `dragHandleProps`. `dragHandleLabel` is the handle's accessible name — **no default**; pass a translated string when a handle is shown (or supply `aria-label` via `dragHandleProps`); absent → the grip glyph stands alone. Same seam as `StatCard`/`ContentCard`/`PaperCard`. |
| `dragWholeCard` | `false` | Binds DND listeners on the card root so the whole body is the drag trigger. **Cursor:** an open hand (`grab`) when the card is drag-only, or the normal `pointer` when it's also clickable (`onClick`/`hoverable`); a short press-and-hold engages the closed hand (`grabbing`), so a quick click never changes the cursor. Can coexist with a focusable `showDragHandle` grip for keyboard/screen-reader sorting. |

```tsx
import { Link } from '@tanstack/react-router'

// Whole-card navigation link with an icon, a footer meta line, and a corner menu:
<DynamicGridCard
  icon="⚙️"
  title="Setup"
  subtitle="Configure the workspace"
  hoverable
  footer={{ lines: [{ text: '4 steps left', type: 'check' }] }}
  corner={<DropdownMenu iconTrigger={<MoreVertical size={16} />} iconTriggerLabel="Card actions" items={[…]} />}
  renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
/>

// Corner-badge icon (never affects layout) and a centre icon (replaces `children`):
<DynamicGridCard title="Synced" icon={{ content: '✅', placement: 'lowerRight' }} />
<DynamicGridCard title="Empty state" icon={{ content: '📭', placement: 'center' }} />
```

#### `DynamicNavCards`

A **self-contained grid of navigation tiles**. Unlike the card family it renders its own lean
tile element — it does **not** use `DynamicGridCard` — but drives that grid through the same
`DynamicCardGrid`, so it inherits the fluid `1fr` columns, `cardSize` scale, and the built-in
search / filter / sort toolbar. Each tile's single **required** `title` is its **centred main
content**, sized fluidly by label length: **large when the label is short**, stepping down and
**clamped at two lines** as it grows — so a grid of short nav labels reads big and bold.

It takes the full `DynamicCardGridProps` surface (`items`, `getKey`, `searchFields`/`searchFn`,
`filters`, `sortOptions`, `cardSize`, `align`, `loading`, empty states, `minColumnWidth`, …)
**minus** `renderCard`, replaced by **`getCard`**:

| Prop | Default | Meaning |
|---|---|---|
| `getCard` | — (**required**) | Maps one item to its tile's content — a `DynamicNavCard` (below). The nav equivalent of the grid's `renderCard`. |
| *(grid props)* | — | Everything else is `DynamicCardGridProps` minus `renderCard`; see `DynamicCardGrid` above. |

Each `DynamicNavCard` (the value `getCard` returns) is a **lean** tile — no `icon`, `subtitle`,
`shape`, or drag seam:

| Field | Default | Meaning |
|---|---|---|
| `title` | — (**required**) | The tile's label — centred main content, sized by length (large when short, two-line clamp). Pass a translated string. |
| `renderLink` | — | Whole-tile navigation seam — the consumer's router `<Link>` mounted as a full-bleed block-link overlay; accessible name auto-wired from `title`. |
| `onClick` | — | Click handler for a non-link tile; sets `hoverable` by default. |
| `hoverable` / `lift` | `hoverable` ← `!!onClick` | Background-tint hover state; `lift` adds a translateY + stronger shadow. |
| `tone` / `color` / `accentPlacement` | none / `top` | Optional accent stripe (semantic `tone` or raw `color`), top or left edge. |
| `footer` | — | Freeform node pinned to the bottom (e.g. a meta line). |
| `corner` | — | Raised top-corner action slot (e.g. a menu trigger). |
| `watermark` / `autoscaleWatermark` | — / `true` | Faint background watermark — a `string` (oversized emoji) or a `ReactNode` art layer; `autoscaleWatermark` scales a glyph node. |

Tiles have no `size` of their own — typography scale follows the enclosing `cardSize` (or `'md'`).

```tsx
import { DynamicNavCards } from 'my-react-shell/components'
import { Link } from '@tanstack/react-router'

<DynamicNavCards
  items={areas}
  getKey={(a) => a.id}
  cardSize="md"
  getCard={(a) => ({
    title: a.label,
    tone: 'primary',
    footer: `${a.count} items`,
    renderLink: (p) => <Link {...p} to="/area/$id" params={{ id: a.id }} />,
  })}
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
// `lift` defaults to `false`, so the card's own hover feedback is just the background
// tint — the drawer's own open-on-hover is the only motion:
<DynamicGridCard
  title="Files"
  subtitle="Project documents"
  footer={{ lines: [{ text: '8 items' }] }}
  hoverable
  onClick={openFiles}
  watermark={<DrawerMark open={isActive} />}
/>
```

> Build a new openable mark on `RevealMark` directly: `<RevealMark closed={…} revealed={…} />`.
> It reveals inside **any** container carrying `mrs-reveal-host` — not only cards.

### `ContentCard`

Self-contained freeform-text or custom-layout counterpart to `StatCard` — same fixed-width golden-ratio
sizing, accent logic, variants, watermark, and footer, but accepts either a `content` string
(`maxLines` clamp, optional sanitized `html`) OR custom React `children` in its main body, alongside a
`value`/`maxValue` completion gauge in place of the medallion. Behaviour + examples:
[card guide → ContentCard](../guides/card-grid.md#contentcard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Auto-fits. |
| `subtitle` | — | Optional subtitle. |
| `icon` | — | `ReactNode` shorthand for `{ content: icon, placement: 'title' }` (inline, beside the title block), **or** the full `{ content, placement }` form. `placement`: `'title'` (default, in-flow) · `'upperLeft'`/`'upperRight'`/`'lowerLeft'`/`'lowerRight'` (absolutely positioned corner overlay, never affects layout) · `'center'` (replaces the `content`/`children` body). Dev-throws if `placement: 'center'` combines with `content` or `children`. A `center`-placed icon **fills the body**, so `content`/`children` become optional in that case. **`'upperLeft'` silently falls back to `'title'`** when `title`/`subtitle` is set — the corner would otherwise land on that text (`title` is required, so this is effectively always). Shared placement vocabulary with the other cards (`CardIconPlacement`/`CardIconConfig`). |
| `content` | — | **Required unless `children` is supplied, or a `center`-placed `icon` fills the body.** The main freeform text. Text is dynamically clamped based on the `maxLines` cap. Mutually exclusive with `children` (throws in dev). |
| `html` | `false` | When true, parses `content` as HTML via `dangerouslySetInnerHTML`. **Automatically sanitized** internally using `isomorphic-dompurify`. (Ignored when using `children`). |
| `children` | — | **Required unless `content` is supplied, or a `center`-placed `icon` fills the body.** Custom layout/elements inside the card body. Mutually exclusive with `content`/`html` (throws in dev). *See layout & overflow warnings below.* |
| `maxLines` | *dynamic* | Number of lines to clamp the `content`. Defaults to `5` if neither subtitle nor footer is present, `4` if either is present, and `3` if both are present. (Ignored when using `children`). |
| `contentAlignX` | `'center'` | Horizontal alignment (`'left'` · `'center'` · `'right'`). Aligns content/children. |
| `contentAlignY` | `'center'` | Vertical alignment (`'top'` · `'center'` · `'bottom'`). Aligns content/children. |
| `value` / `maxValue` | — | Triggers a left-side completion gauge (red→amber→green based on ratio). Equivalent to `sideBarCompleteness` in StatCard. |
| `tone` / `color` | `'neutral'` | Accent stripe color. |
| `accentPlacement` | `'top'` | `'top'` or `'left'` |
| `topStripeFollowsGauge` | `false` | Matches `StatCard` behavior (turns the top stripe into the gauge's completeness color). |
| `variant` | — | `'warning'` · `'danger'`. Colors body text/content to match the alert hue. |
| `footer` | — | Footer slot: a freeform `ReactNode` **or** a structured `{ lines?, badges? }` — same unified slot as `StatCard` (discriminated automatically). |
| `watermark` | — | Faint background watermark — centred horizontally, dropped a little below centre. A **`string`** is an oversized emoji (e.g. `'🏆'`); a **`ReactNode`** (e.g. a `DrawerMark`) renders in an art layer behind the content and makes the card root a `mrs-reveal-host` (so a hover-reveal mark opens on card hover). |
| `autoscaleWatermark` | `true` | For a **ReactNode** `watermark` only (ignored for a string/variant watermark): scales the node's intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring the string-emoji watermark. Set `false` for a self-sized illustration (e.g. `DrawerMark`). Same as `StatCard`/`PaperCard`/`DynamicGridCard`. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl` = 240/312/400/520px wide; height = width / φ. Default `md` ≈312px → four to a `wide` (1440px) row. |
| `shape` | `'standard'` | `'standard'` = φ:1 · `'landscape'` = φ²:1 (`height = width / φ²`, shorter box). |
| `showDragHandle` / `dragHandle` / `dragHandleProps` / `dragHandleLabel` | — | Drag-reorder grip. `showDragHandle` (boolean) renders the built-in vertical-stripes grip (right-edge, vertically centred); `dragHandle` instead takes a custom handle `ReactNode` (implies a visible handle). Spread your DND library's listeners via `dragHandleProps`. `dragHandleLabel` is the handle's accessible name — **no default**; pass a translated string when a handle is shown (or supply `aria-label` via `dragHandleProps`); absent → the grip glyph stands alone. |
| `dragWholeCard` | `false` | Binds DND listeners on the card root so the whole body is the drag trigger. **Cursor:** an open hand (`grab`) when the card is drag-only, or the normal `pointer` when it's also clickable (`onClick`/`hoverable`); a short press-and-hold engages the closed hand (`grabbing`), so a quick click never changes the cursor. Can coexist with a focusable `showDragHandle` grip for keyboard/screen-reader sorting. |
| `renderLink` | — | Interactive-root seam — same block-link-overlay mechanism as `StatCard` (`(linkProps) => ReactNode`; the whole tile becomes the consumer's router `<Link>`, root owns its states, no router dep in the shell). |

> [!WARNING]
> **Layout & Overflow Constraints for `children`:**
> - **Silent Size Overflow:** Since `ContentCard` enforces a strictly fixed width and height with `overflow: hidden`, custom `children` that exceed the remaining vertical space will be silently clipped at the card boundary. There is no automatic scrollbar or line-clamp truncation for custom elements.
> - **Flexbox Alignment:** The body container uses flexbox (`align-items` for horizontal alignment, `justify-content` for vertical alignment). If custom children are flexbox items themselves, or have fixed heights (like standard layout block elements), they might not align as expected unless the consumer handles internal styles.
> - **Nested Interactivity & Focus Conflicts:** If the card uses the interactive overlay pattern (`renderLink`), the entire card is wrapped in a link overlay. Placing interactive elements (buttons, inputs, other links) inside custom `children` will create illegal nested interactive elements in the DOM, which breaks keyboard accessibility (focus traps/skips) and can cause click handler conflicts.

```tsx
<ContentCard size="md" tone="info" title="Status" content="All systems operational" />

// Using custom children:
<ContentCard size="md" tone="info" title="Custom Children">
  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
    <span>Item 1</span>
    <span>Item 2</span>
  </div>
</ContentCard>
```

### `PaperCard`

A small **preview / thumbnail** card styled as a dog-eared A4-portrait sheet
(`height = width × √2`, default `size` `sm`). Shares the card-family `footer`, `watermark`,
hover-lift, `showDragHandle`, and `renderLink` seams; an accent stripe is **opt-in**. Fold/shadow
mechanics + examples: [card guide → PaperCard](../guides/card-grid.md#papercard).

| Prop | Default | Meaning |
|---|---|---|
| `title` | — | Card title. **Required.** Wraps to three lines at a fixed size, then clips (no font-size auto-fit). |
| `subtitle` | — | Optional subtitle / meta line below the title (single line, ellipsised). |
| `icon` | — | `ReactNode` shorthand for `{ content: icon, placement: 'title' }` (inline, beside the title block), **or** the full `{ content, placement }` form. `placement`: `'title'` (default, in-flow) · `'upperLeft'`/`'upperRight'`/`'lowerLeft'`/`'lowerRight'` (absolutely positioned corner overlay, never affects layout) · `'center'` (replaces the `content`/`image` body). `'upperRight'` clears the dog-eared fold (it reuses the `corner` slot's top offset) but **collides with the `corner` slot** — dev-throws if combined with `corner`. `'center'` dev-throws if combined with `content` or `image`. **`'upperLeft'` silently falls back to `'title'`** when `title`/`subtitle` is set — the corner would otherwise land on that text (`title` is required, so this is effectively always). Shared placement vocabulary with the other cards (`CardIconPlacement`/`CardIconConfig`). |
| `content` | — | Optional freeform body text. A thumbnail can carry just a title; when present, the text clamps to `maxLines`. |
| `contentAlignX` | `'left'` | Horizontal alignment (`'left'` · `'center'` · `'right'`). |
| `contentAlignY` | `'top'` | Vertical alignment (`'top'` · `'center'` · `'bottom'`). |
| `maxLines` | *dynamic* | Lines to clamp `content`. Defaults to `7` if neither subtitle nor footer is present, `5` if either is present, `4` if both are. |
| `tone` | — | `'primary'`·`'info'`·`'success'`·`'warning'`·`'danger'`·`'neutral'` — **opt-in** accent stripe (default none). Maps to semantic `--color-*` tokens. |
| `color` | — | Raw CSS color for the accent stripe (overrides `tone`). |
| `accentPlacement` | `'top'` | Where the accent reads when set: a `'top'` stripe or a `'left'` bar. |
| `footer` | — | Footer slot: a freeform `ReactNode` **or** a structured `{ lines?, badges? }` — same unified slot as `StatCard`/`ContentCard` (discriminated automatically). |
| `corner` | — | Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered above the link overlay (`z-index`) as a sibling of the anchor, so it stays independently clickable — never nested in the link. Sits just below the fold triangle to keep the dog-ear visible. |
| `watermark` | — | Faint background watermark. A **`string`** is an oversized emoji drawn via the sheet's CSS `::after` (e.g. `'📄'`); a **`ReactNode`** (e.g. an `<AppIcon>`/`<img>`) renders in a faint art layer, matching `StatCard`/`ContentCard`/`DynamicGridCard`. |
| `autoscaleWatermark` | `true` | For a **ReactNode** `watermark` only (ignored for a string watermark): scales the node's intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring the string-emoji watermark. Set `false` for a self-sized illustration (e.g. `DrawerMark`). Same as `StatCard`/`ContentCard`/`DynamicGridCard`. |
| `image` | — | A real, full-opacity preview layer filling the sheet — e.g. a rendered PDF first page (`<canvas>`/`<img>`). Unlike `watermark` (a faint decorative glyph), `image` is the card's actual visible content; the title/subtitle and footer render over it on a translucent scrim for legibility. |
| `size` | `'md'` | `sm`·`md`·`lg`·`xl`·`xxl` = 134/168/210/264/320px wide; height = width × √2. `lg` is literally A4's mm figures (210×297). |
| `onClick` | — | Click handler; also enables hover lift. |
| `hoverable` | `!!onClick` | Hover lift (translateY + heavier shadow). |
| `showDragHandle` / `dragHandle` / `dragHandleProps` / `dragHandleLabel` | — | Drag-reorder grip. `showDragHandle` (boolean) renders the built-in top-centre grip; `dragHandle` instead takes a custom handle `ReactNode` (implies a visible handle). Spread your DND library's listeners via `dragHandleProps`. `dragHandleLabel` is the handle's accessible name — **no default**; pass a translated string when a handle is shown (or supply `aria-label` via `dragHandleProps`); absent → the grip glyph stands alone. |
| `renderLink` | — | Interactive-root seam — same block-link-overlay mechanism as `StatCard`/`ContentCard` (`(linkProps) => ReactNode`; the whole tile becomes the consumer's router `<Link>`, root owns its states, no router dep in the shell). |
| `className` / `style` | — | Extra classes / style on the outer card. |

```tsx
<PaperCard title="Errand list" subtitle="Personal" />
```

### `UserPreferences`

A fully **controlled** theme/display panel in a Radix dialog: a **theme** group (palette +
light/dark/system) and a **display** group (an optional icons↔emojis switch + an optional
menu-size control that sizes the app-shell header chrome — `small` · `medium` · `large`).
It **persists nothing** — emits `onChange`; the consumer owns storage. Auth-free
(`accountActions` slot); the theme/mode/icons labels are **required, no-default** props —
pass translated strings. Pass `sections` to grow it into a **two-pane sectioned dialog**
(left icon+label nav, swappable right pane): the nav is exactly the ordered sections you
pass. **Three ids are reserved** and render built-in panes when their `content` is omitted:
`'theme'` (palette + light/dark/system), `'display'` (icons↔emojis + the menu-size control)
and `'language'` (the built-in language switcher — inline flag + native-name buttons, driven
off the mounted `<I18nProvider>` read softly; renders empty if no provider). Place them
anywhere, or omit to drop that section. Omit `sections` and it renders the single-column
panel, with both the theme and display groups stacked. Wire the menu-size control to
`useMenuSize()` (`my-react-shell/app-shell`). Notes: [components guide → UserPreferences](../guides/components.md#userpreferences).

| Prop | Default | Meaning |
|---|---|---|
| `theme` / `themes` / `onThemeChange` | — | Active palette, the list to offer (`useTheme().themes`), and the change handler. **Required.** |
| `mode` / `onModeChange` | — | Active color mode and its handler. **Required.** |
| `followSystem` / `onFollowSystemChange` | — | Pass both to show a **System** option that follows the OS. |
| `iconMode` / `onIconModeChange` | — | Pass both to show the **icons↔emojis** switch (from `my-react-shell/icons`), in the display group. |
| `menuSize` / `onMenuSizeChange` | — | Pass both to show the **menu-size** control (`small`·`medium`·`large` header chrome) in the display group. Wire to `useMenuSize()` (`my-react-shell/app-shell`). |
| `accountActions` | — | Rows below a divider — e.g. a sign-out button. Keeps the kit auth-free. |
| `trigger` | icon button | Override the dialog trigger. |
| `open` / `onOpenChange` | self-managed | Control the open state if you need to. |
| `sections` | — | `UserPreferencesSection[]`. **The full, ordered left-nav.** Omit (or empty) → the single-column, no-nav body. Non-empty → a **two-pane** grid (left icon+label nav, swappable right pane) in exactly this order. Include `{ id: 'theme' }` (palette + mode) and/or `{ id: 'display' }` (icons↔emojis + menu size) entries to place the built-in panes; leave one out to omit that section. |
| `activeSection` / `onActiveSectionChange` | self-managed | Control the selected section id. Pass both to own it (e.g. persist to `sessionStorage` so the dialog reopens where the user left off); omit both and the component remembers the last-viewed section within its lifetime. A stale/absent id falls back to the first nav item. |
| label props | — | **Required** (no default): `triggerLabel`, `title`, `themeHeading`, `modeHeading`, `displayHeading`, `lightLabel`, `darkLabel`, `systemLabel`, `iconsLabel`, `emojisLabel`. Optional (default to `mrs.*` chrome keys, override to translate): `menuSizeHeading` (`mrs.prefs.menuSizeHeading`), `menuSizeSmallLabel` (`mrs.prefs.menuSizeSmall`), `menuSizeMediumLabel` (`mrs.prefs.menuSizeMedium`), `menuSizeLargeLabel` (`mrs.prefs.menuSizeLarge`), `closeLabel` (`mrs.action.close`) — text for the lower right-aligned close button and the accessible label of the header ✕; `description` is optional. The reserved `'language'` pane heading uses `mrs.prefs.language`. Pass translated strings. |
| `className` | — | Extra classes on the dialog, merged via `cn()`. |

`UserPreferencesSection` (exported): `{ id: string; icon: ReactNode; label: ReactNode; content?: ReactNode }` — one left-nav item + its right-pane content. The shell stays icon- and language-neutral: the consumer passes already-resolved icon nodes (e.g. `<AppIcon…>`) and translated labels. The nav renders the array verbatim; the reserved `id: 'theme'` (palette + mode) and `id: 'display'` (icons↔emojis + menu size) entries (whose `content` you omit) show the built-in controls, so you choose their position — first, last, or anywhere between your own sections.

```tsx
// wire to useTheme() + useIconMode() + useMenuSize():
<UserPreferences theme={theme} themes={themes} onThemeChange={setTheme}
  mode={mode} onModeChange={setMode}
  followSystem={isSystemMode} onFollowSystemChange={setSystemMode}
  iconMode={iconMode} onIconModeChange={setIconMode}
  menuSize={menuSize} onMenuSizeChange={setMenuSize}
  triggerLabel={t('prefs.open')} title={t('prefs.title')}
  themeHeading={t('prefs.theme')} modeHeading={t('prefs.appearance')} displayHeading={t('prefs.display')}
  lightLabel={t('prefs.light')} darkLabel={t('prefs.dark')} systemLabel={t('prefs.system')}
  iconsLabel={t('prefs.icons')} emojisLabel={t('prefs.emojis')} closeLabel={t('common.close')} />

// Two-pane sectioned dialog — you compose the whole nav order. Here Language leads,
// then the built-in Theme (id: 'theme') and Display (id: 'display') panes, Sound last:
<UserPreferences /* …all the props above… */
  sections={[
    { id: 'language', icon: <AppIcon name="language" />, label: t('prefs.language'),
      content: <LanguageSettings /> },
    { id: 'theme', icon: <AppIcon name="theme" />, label: t('prefs.appearance') },
    { id: 'display', icon: <AppIcon name="display" />, label: t('prefs.display') },
    { id: 'sound', icon: <AppIcon name="sound" />, label: t('prefs.sound'),
      content: <SoundSettings /> },
  ]} />
```

### `EmojiPicker` / `EmojiBar`

**`EmojiPicker`** — a full emoji picker panel. Ships no popover or trigger of its own;
embed it inline or nest it inside a `<Popover>`. Requires the `emojibase-data` optional peer.

| Prop | Default | Meaning |
|---|---|---|
| `onSelect` | — | `(emoji: string) => void`. **Required.** Receives the emoji character on click. Clears the search query after selection. |
| `locale` | `'en'` | Locale for emoji labels and search. `'en'` and `'nb'` are bundled; any other value falls back to `'en'`. |
| `showSearch` | `true` | Show the search input at the top. |
| `searchPlaceholder` | `'🔍'` | Placeholder for the search field. Optional (emoji default); pass a translated string via your i18n seam. |
| `noResultsLabel` | `'🤷'` | Shown when a search returns no matches. Optional (emoji default); pass a translated string. |
| `categoriesLabel` | — | Accessible label for the category tablist. **Required** — pass a translated string. |
| `frequentLabel` | — | Accessible label + tooltip for the frequently-used tab. **Required** — pass a translated string. |
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
import { IconModeProvider, useIconMode, Icon, createIconRenderer,
  EmojiRenderProvider, useEmojiRender } from 'my-react-shell/icons'
import type { IconMode, IconProps, UseIconModeResult, IconModeProviderProps,
  IconModeContextValue, IconGlyph, IconRenderer, CreateIconRendererOptions,
  EmojiRenderProviderProps, EmojiRenderer } from 'my-react-shell/icons'
```

| Export | Kind | Summary |
|---|---|---|
| `IconModeProvider` | component | Owns the icon/emoji preference. Uncontrolled (localStorage) or controlled (`value`+`onChange`). `defaultMode` (`'icon'`), `storageKey`. |
| `useIconMode()` | hook | Returns `{ iconMode, isEmoji, setIconMode, toggleIconMode }`. Throws outside provider. |
| `Icon` | component | `<Icon icon={<Glyph/>} emoji="🎨" size label forceIcon />` — shows one or the other per mode. `forceIcon` always renders the glyph. Defaults to `icon` with no provider. In emoji mode it calls the active `EmojiRenderProvider` renderer (if any) to draw the char; with no provider it renders the raw char. |
| `createIconRenderer(icons, emojis, options?)` | function | Wires a consumer's key→glyph + key→emoji maps into one `renderIcon(key, size, label?)`. `emojis` is typed against `icons`' keys (a missing emoji is a **compile error**), with a **dev** missing-emoji warning as backstop for dynamic maps. `options.force` = keys that stay glyphs in emoji mode (and skip the warning); `fallbackEmoji` (`'●'`), `fallbackGlyph`. Owns no glyphs / no `lucide-react`. |
| `EmojiRenderProvider` | component | **Optional** seam to swap how an emoji char is drawn. `render: (emoji, size) => ReactNode` replaces the raw char in every `<Icon>` emoji branch (so: `createIconRenderer`, chrome `renderIcon`, every consumer `<AppIcon>`). The shell ships **no** renderer — without this provider every emoji renders the raw char as before (backward-compatible). A consumer installs one to e.g. serve a bundled per-codepoint SVG with a native fallback. |
| `useEmojiRender()` | hook | Returns the active `EmojiRenderer` or `null` outside a provider. For a consumer's own non-`<Icon>` emoji surface (e.g. an `<Emoji char>` component) to share the same render policy. |
| `IconMode` | type | `'icon' \| 'emoji'`. |
| `IconGlyph` | type | `(size: number) => ReactNode` — the library-neutral glyph factory `icons` maps to. |
| `IconRenderer` | type | `(key: string, size: number, label?: string) => ReactNode` — drop-in for app-shell's `config.renderIcon`. |
| `EmojiRenderer` | type | `(emoji: string, size: number) => ReactNode` — the renderer `EmojiRenderProvider` publishes. |
| `IconProps`, `CreateIconRendererOptions`, `UseIconModeResult`, `IconModeProviderProps`, `IconModeContextValue`, `EmojiRenderProviderProps` | type | Props / options / results. |

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
         defineShellConfig, ShellConfigError, useShellContext, useAppMode,
         MenuSizeProvider, useMenuSize } from 'my-react-shell/app-shell'
import type { ShellConfig, ShellConfigInput, PageEntry, PageHeaderOptions, PageHeaderAlertSpec /* … */ } from 'my-react-shell/app-shell'
import 'my-react-shell/app-shell/styles.css'
```

| Export | Kind | Summary |
|---|---|---|
| `defineShellConfig(input)` | function | Validates (throws `ShellConfigError`) + brands the config at import time. Requires `renderIcon`. |
| `ShellConfigError` | class | Thrown on a bad config shape. |
| `AppShell` | component | Mount once at root. `config`, `useMenu` (sidebar vs banner), `actions: HeaderAction[]` (declarative — see **Chrome actions** below), `mobileNav` (`'drawer'`\|`'tabBar'`), `children`. |
| `AppHeader`, `AppMenu`, `AppBottomNav` | component | Chrome sub-parts (usually composed by `AppShell`). |
| `HeaderActionButton` | component | The shell's single header-action trigger — the one box model every `actions` entry renders through. Rarely used directly; the `HeaderAction` `custom` hatch is handed a builder for it. `icon` (registry key or node), `label`, `active`, `tone`, `badge`, `hint`, `onClick`, `size` (shared icon-button scale `sm·md·lg·xl`, default `md`); forwards its ref so it works as a Radix `asChild` overlay trigger. |
| `usePageHeader(options)` | hook | Call from a route subtree to add page chrome to the band — `title`/`actions`/`search`/`tabs`/`documentTitle`/`className`. The band shows **automatically** from the URL chain; call this only to *add* chrome. When more than one call is active (e.g. a layout band + a leaf's actions), the **deepest-mounted wins** and updates in place — no flicker. |
| `usePageAlert(spec)` | hook | Set a global page-level alert in the header band (`{ label, tone, hideOtherActions? }`). If `hideOtherActions` is true, the renderer hides the regular actions and search input. |
| `useDocumentTitlePrefix(prefix)` | hook | Set a plain-string prefix prepended to `document.title` with a single space (`"(3) Leaf · App"`) — e.g. an unread-count badge. `null` / `''` = no prefix; cleared on unmount. The shell is the single owner of `document.title`, so this is the ONLY safe seam for a prefix (a direct write is clobbered on the next recompute). One intended producer — last-write-wins. |
| `findActiveChain` | function | Compute the active breadcrumb chain for a pathname — pure function of `(roots, pathname, dynamicByParent)`. Walks `subPages` recursively at each depth level; merges `useDynamicPages` registrations keyed by parent route. |
| `PageTabs` | component | Route-based tab strip (each tab = a route). Pin via `usePageHeader({ tabs: () => <PageTabs … /> })`. Scrolls horizontally when it overflows — edge fades + arrow buttons appear on the side(s) with hidden tabs. Each `PageTab` accepts an optional `tone` (the shared `Tone` — colours that tab's label + icon across active/inactive states, same convention as `SegmentedOption.tone`). `showBaseline` (default `false`) toggles the `underline` variant's full-width `border-bottom`; `true` restores the rail under the whole row (only the active tab's own underline shows by default). |
| `PageSections` | component | In-page sections synced to `?<persistKey>=`. Modes `single` / `list` (scrollspy). Its section-tab strip scrolls horizontally on overflow (edge fades + arrows). `fullHeight` expands sections to fill the scroll container. `showBaseline` (default `false`) toggles the `underline` variant's full-width `border-bottom`, same as `PageTabs`. Each `PageSection` config accepts an optional `tone` (colours that section's tab trigger; same convention as `PageTab.tone`). |
| `PageSection` | component | Standalone section card. `title`, `icon` (string key or custom Node), `actions[]`, `children`, `className`. |
| `useDynamicPages(cfg)` | hook | Register runtime breadcrumb levels (record names, slugs) under a `parent` route. Works at any depth — set `parent` to whichever registered route the dynamic items hang under. Each item may carry `hideCrumb?: () => boolean` to omit it from the rendered trail while keeping it in the chain (the access-gated-ancestor pattern; same semantics as `PageEntry.hideCrumb`), `disableCrumbLink?: () => boolean` to render the ancestor as a plain label with no click target (same semantics as `PageEntry.disableCrumbLink`), or `supportedModes?: string[]` to declare the app-modes it supports when it resolves as the leaf (same semantics as `PageEntry.supportedModes`). |
| `useShellContext()`, `useShellContextOptional()` | hook | Read shell context — incl. `scrollContainer` (the only scroller; use instead of `window`). |
| `useAppMode()`, `useAppModeOptional()` | hook | Read/drive the **app-mode** — the global "what mode is the app in" state declared by the config's `appMode` block. `→ { appMode, setAppMode, modes, setModes, visible, setVisible, selectable, setSelectable }`. Pass a union for exhaustive typing: `useAppMode<'SETUP'\|'MAIN'\|'FINALIZE'>()`. `useAppMode()` throws when no `appMode` block is declared; `useAppModeOptional()` returns `null` instead. Set from end-user selection **or** data (a role/data effect calling `setAppMode`); read `appMode` anywhere as a global mode. |
| `MenuSizeProvider` | component | Owns the **menu-size** preference (header-chrome size `small`·`medium`·`large`). Uncontrolled (localStorage) or controlled (`value`+`onChange`). `defaultSize` (`'medium'`), `storageKey`. `<AppShell>` reads it **softly** — no provider → `medium` (normal). |
| `useMenuSize()`, `useMenuSizeOptional()` | hook | `useMenuSize()` → `{ menuSize, setMenuSize }` (throws outside the provider); feed into `<UserPreferences>` (`menuSize`/`onMenuSizeChange`). `useMenuSizeOptional()` is the non-throwing read (`null` outside a provider) `<AppShell>` uses. |

**Chrome actions (`AppShell` `actions`).** The action row (bell / language / preferences /
account, …) rendered in the header banner's right cluster and the sidebar footer is a
**closed, declarative** list — `actions: HeaderAction[]`. The consumer describes intent (a
clean `renderIcon` **key** + `label` + what happens); the shell renders every entry through
one `HeaderActionButton`, so the whole row shares one size and one box model. There is
deliberately **no** `ReactNode` trigger and **no** `size` prop — uniformity is enforced by
the type, not by convention, and an action whose glyph resolves to nothing is skipped (no
stray wrapper, no phantom gap). The four shapes:

- **Button / toggle** — `{ icon, label, onClick, active?, tone?, badge?, hint? }`. `active`
  drives `aria-pressed`; `badge` (a number, hidden when `0`) draws a count pill.
- **Menu** — `{ icon, label, items, tone?, badge?, align? }`. The shell renders the uniform
  trigger + `<DropdownMenu>`; `items` is the kit `DropdownMenuItem[]`.
- **Panel** — `{ icon, label, panel, tone?, badge?, align? }`. The shell renders the uniform
  trigger + `<Popover>`; `panel()` is the popover body.
- **Custom (escape hatch — last resort)** — `{ custom: (renderTrigger) => ReactNode }`. For
  an overlay component that owns its own trigger (e.g. `UserPreferences`). The shell hands you
  `renderTrigger(props)` — a builder for the **same** `HeaderActionButton` — so even a bespoke
  overlay keeps the identical chrome. Reach for a declarative shape first; a raw element here
  is the one way to reintroduce drift.

```tsx
actions={[
  { icon: 'bell', label: t('nav.alerts'), badge: unread, panel: () => <Alerts /> },
  { icon: 'chat', label: t('nav.chat'), active: open, onClick: toggle },
  { icon: 'account', label: t('nav.account'), items: accountItems },
  { custom: (T) => <UserPreferences trigger={T({ icon: 'settings', label: t('prefs.open') })} /> },
]}
```

**Menu size (header-chrome size).** `<AppShell>` sets `data-menu-size` (`small`·`medium`·`large`)
on its root; for `small`/`large`, app-shell.css scales the page-header band (breadcrumbs +
actions + search) and the top-header action cluster (via `zoom`, so icons, text, and spacing
scale uniformly) down or up — the app title/brand is left untouched. `medium` (the default) is
normal, no-scaling size. Purely a display/accessibility preference; it changes no data or
routing. Tune each step with the `--mrs-menu-scale-small` (default `0.875`) /
`--mrs-menu-scale-large` (default `1.375`) CSS vars.

**App-mode (optional).** Add an `appMode` block to `defineShellConfig` to render a
single-select **"what mode is the app in"** segmented control inline in the header's right
cluster, left of the actions (header mode) / in its own section under the sidebar brand,
above the nav (menu mode). The block
declares only the **static** parts — `modes: string[]` (the consumer's own constant
values), `label: (mode) => string` (**content**, consumer-translated), and optional
`icon: (mode) => ShellIcon | null` (per-mode icon, resolved via `config.renderIcon`),
`iconPosition` (`'leading'`·`'trailing'`, default leading), `tone: (mode) => Tone | null`
(per-mode semantic colour — e.g. a `warning`-toned "Finalize"), `defaultMode`, `ariaLabel`
(a thunk; the module never imports i18n), `visible` (default `true`), `selectable` (default
`true`), `storageKey` (default `'my-react-shell.app-mode'`). The **live** value + flags are
runtime state driven
anywhere via `useAppMode()`: `setAppMode` (end-user *or* data-driven), `setVisible`,
`setSelectable` (`false` → a read-only indicator), and `setModes` (narrow by role at
runtime). The control **auto-hides** when fewer than two modes are available or `visible`
is false — `appMode` stays readable either way. Built on the kit `SegmentedControl`.

**Persistence.** The selected mode persists to `localStorage` under `storageKey` (same
best-effort try/catch as the theme/i18n/menu-size modules) and restores on reload — a
persisted value naming a mode the config no longer ships falls back to `defaultMode`.

**Per-page mode support.** A `PageEntry` — or a `useDynamicPages` item (`DynamicPageInput`) —
may declare `supportedModes: string[]`, the
app-modes valid on that page. **Undefined → all modes** (no narrowing; landing there does
nothing). When the active breadcrumb **leaf** declares it, the control shows only those
modes (intersected with any `setModes` narrowing), and `useAppMode().modes` reports the
narrowed set. Arriving in a mode the leaf excludes runs `appMode.onUnsupportedMode`:
`'warn'` (**default** — switch to the first supported mode + `console.warn`), `'jump'`
(switch silently, no warning), or `'throw'` (treat as a routing/config bug).

```tsx
const MODES = { setup: 'SETUP', main: 'MAIN', finalize: 'FINALIZE' } as const
type AppMode = (typeof MODES)[keyof typeof MODES]
defineShellConfig({
  …,
  appMode: { modes: Object.values(MODES), label: (m) => t(`mode.${m}`), defaultMode: MODES.setup },
})
const { appMode, setAppMode } = useAppMode<AppMode>()   // read/drive anywhere under <AppShell>
```

**Contract types:** `PageEntry`, `ShellConfig`, `ShellConfigInput`, `PageContainerMaxWidth`,
`ShellPageContainerConfig`, `ShellTabsConfig`, `ShellTabsVariant`, `ShellPageHeaderConfig`,
`ShellBreadcrumbCollapseConfig`,
`ShellPageHeaderSearchSlot`, `ShellDocumentTitleMode`, `ShellIconRenderer`,
`ShellChromeLabels`, `ShellAppModeConfig`, `ShellAppModeState`, `ShellAppModeRuntime`, plus component props (`AppShellProps`, `AppShellMobileNav`,
`AppShellContentPadding`, `PageHeaderOptions`, `ChainLevel`, `PageTab`, `PageTabsProps`,
`PageSection`, `PageSectionProps`, `PageSectionsMode`, `PageSectionsProps`, `DynamicPageInput`,
`DynamicPagesConfig`, `ShellContextValue`, `MenuSizeProviderProps`, `UseMenuSizeResult`,
`MenuSize`, `MenuSizeContextValue`).

**Config value sets** (full reference in the [guide](../guides/app-shell.md#optional-config-root-fields)):
`pageContainer.defaultMaxWidth` ∈ `narrow·medium·wide·x-wide·full` (default `x-wide`) · `tabs.variant`
∈ `underline·pill` (default `underline`) · `shellPageHeader.documentTitle` ∈
`composed·leaf·app` (default `composed` → `Leaf · AppName`; `leaf` → leaf only; `app` →
app name only). `usePageHeader({ documentTitle })` takes the same three modes **or** a
custom `() => string` resolver. `pages` may be **empty** for a nav-less card-dashboard app.

```tsx
export const shellConfig = defineShellConfig({
  appName: 'Acme',
  // Internal chrome keys: 'menu', 'home', 'arrowUp', 'chevronRight', 'chevronDown', 'search', 'alert'
  renderIcon: (key, size) => { const I = icons[key] ?? Home; return <I size={size} /> }, // REQUIRED
  pages: [{ id: 'dashboard', route: '/dashboard', label: () => t('nav.dashboard'), icon: 'dashboard' }],
})
<AppShell config={shellConfig} useMenu actions={[() => <ThemeToggle/>]} mobileNav="drawer"><Outlet/></AppShell>
```

> **Band actions.** The `actions` slot in `usePageHeader` accepts thunks `(() => ReactNode)` or preset action items:
> - Preset strings (e.g. `'add'`, `'edit'`, `'delete'`) which render a standard inline `ActionButton`.
> - A `'search'` string which renders a default `SearchInput` component with magnifier icon and debouncing. This is meant to be used for filtering or lookups on the content on the current page.
> - Custom preset objects: `{ action: Exclude<ActionType, 'search'>, onClick?, label?, showEmoji?, tone?, size?, layout?, disabled?, hint? }` to customize standard preset buttons. (`label` is the visible text; pass a translated string. There is no preset default label.)
> - Custom search objects: `{ action: 'search', icon?, endIcon?, onDebounceSearch?, debounceMs?, value?, defaultValue?, loadedIconState? }` to customize the search input field.
> - Custom-icon objects: `{ icon, onClick?, label?, showEmoji?, tone?, size?, layout?, disabled?, hint? }` (no `action`) render an `ActionButton` around a glyph outside the preset `ActionType` enum. **Prefer this over a `() => <ActionButton icon={…} />` thunk** for anything whose content changes at runtime: `usePageHeader`'s value-signature diff reads these scalar props, so a real change (e.g. a view-mode toggle's `label`/`icon` flipping) is detected and pushed, whereas a thunk is opaque to that diff (`'fn'` only) and a change baked into its closure can go unpropagated.
> - Any custom ReactNode thunk. An `ActionButton` mounted here always lays out inline (glyph before label). **Anti-pattern:** Action items in the header should NEVER be styled as normal buttons (e.g. `<Button>`). Action items must either be default supported strings (e.g. `'add'`), a custom label + icon via `ActionButton`, or an icon-only `ActionButton`.
>
> **`route: '/'` is reserved.** Never put `/` in `pages` — `defineShellConfig` throws
> `ShellConfigError` if you do. Home is always reachable via the brand link and the
> breadcrumb house icon; it never appears as a named sidebar entry or breadcrumb level.
> Start your first page at a real feature route (e.g. `/dashboard`, `/data`).
>
> **Breadcrumb "up one level" arrow.** Next to the house icon, the breadcrumb trail
> renders an up-arrow link (`arrowUp` icon key) that navigates to the previous
> visible crumb's route (home when the current page is top-level). It is hidden on
> the home route itself, where there is no level above. `labels.up` supplies its
> accessible name.
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
import { IconModeProvider } from 'my-react-shell/icons'
import { ToastProvider } from 'my-react-shell/components'
import 'my-react-shell/styles.css'
import 'my-react-shell/components/styles.css'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')!).render(
  <AppProviders
    authProvider={ConvexAuthDefaultProvider}
    theme={{ defaultTheme: 'ocean' }}
    i18n={{ messages, defaultLocale: 'en-US' }}
  >
    <IconModeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </IconModeProvider>
  </AppProviders>,
)
```

`AppProviders` already mounts `<ThemeProvider>` and (given `i18n`) `<I18nProvider>` with
the shell's chrome catalog merged, so the kit's built-in copy localizes with the app. The
app-shell (`<AppShell>`) goes inside your router, at the root route's layout — not here.

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
