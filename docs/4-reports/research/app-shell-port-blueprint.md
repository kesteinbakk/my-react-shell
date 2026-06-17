# App-Shell Port Blueprint — SolidJS `foundation/shell` → my-react-shell module

A file-by-file, implementable design for re-implementing the SolidJS `foundation`
app shell as a my-react-shell module at the sub-path `my-react-shell/app-shell`
(folder `src/app-shell/`). React 19 + TypeScript, SPA only, TanStack Router,
Radix headless primitives, an own precompiled stylesheet on the theme tokens.

This blueprint is self-contained — a code agent can implement each file from
the specs below without re-reading the SolidJS source.

**Conventions every file upholds:** single-quote, no-semicolon TS; JSDoc header
on every file; `import type` for type-only imports (`verbatimModuleSyntax`);
strings come via config/props (NO i18n import — the module ships label thunks
the consumer wires to `t()`); React function components; hooks for context.

---

## 0. What the SolidJS shell does (behavior summary)

`<AppShell>` is an opinionated outer chrome. It renders **either** an
`<AppHeader>` (top banner) **or** an `<AppMenu>` (sidebar), never both. Its
content area is split into a **pinned page-header chrome slot** (where
`<ShellPageHeader>` lands) and a **single scrolling body cell** carrying
`data-shell-content`. Routes mount `<ShellPageHeader>` anywhere in their
subtree; it registers itself on the shell context and AppShell renders it in
the pinned slot. Three navigation layers exist (sidebar items / `subPages`
title dropdown / page tabs). The breadcrumb chain is a pure function of the URL
pathname. `<PageSections>` provides in-page tabbed content with `?<key>=` URL
sync and (in list mode) scrollspy on the body cell.

The seven Hard Rules from the SolidJS working guide are the behavior contracts
to preserve; Section 6 maps each to its React fate.

---

## 1. File-by-file plan for `src/app-shell/`

```
src/app-shell/
├── app-shell.css            # own stylesheet, mrs- prefixed classes on theme tokens
├── shellContract.ts         # pure types: PageEntry, ShellConfig, ShellConfigInput, specs
├── defineShellConfig.ts     # builder + validator (branded ShellConfig)
├── shellContext.ts          # React context + useShellContext / useShellContextOptional
├── AppShell.tsx             # orchestrator: header|menu, pinned chrome slot, body cell, drawer, bottom nav
├── AppHeader.tsx            # full-width top banner (header mode)
├── AppMenu.tsx              # sidebar column (menu mode) + mobile drawer body
├── AppBottomNav.tsx         # mobile bottom tab bar (optional)
├── ShellPageHeader.tsx      # registration component + ShellPageHeaderUI renderer + findActiveChain + Breadcrumbs + LeafDropdown
├── useDynamicPages.ts       # register runtime children for the breadcrumb chain
├── PageTabs.tsx             # route-level tab strip (each tab is a route)
├── PageSections.tsx         # in-page tabbed content (single / list modes)
├── pageSections/
│   ├── types.ts             # PageSection, PageSectionsProps
│   ├── modes.tsx            # SectionsListMode, SectionsSingleMode, SectionTabsStrip, LazyContent
│   └── scrollspy.ts         # setupScrollspy + scrollToSection (pure DOM glue)
└── index.ts                 # the sub-path barrel
```

**Dropped vs the SolidJS source** (out of scope per the task + SPA simplifications):
`actionRow.tsx` / `actionRegistry.ts` / `notificationSystem.ts` /
`ShellNotificationBell.tsx` / `FeedbackModal.tsx` / `PillPopover.tsx` /
`LanguageDropdown.tsx` / `AppFooter.tsx` / `UpdateAvailableHint.tsx` and the
`pages/` route-helper glue. The notification/feedback/command-bar machinery is
app-glue: it surfaces only as the page-header **action slot** the consumer
fills. The action row becomes a plain `actions` array of render thunks — no
built-in keys, no registry, no validator (see AppHeader / AppMenu below).

---

### 1.1 `shellContract.ts` — pure types

The SolidJS code splits these across `core/shell-contract/{types,context}.ts`.
Here they collapse into one types file (`shellContract.ts`) plus the context
file (`shellContext.ts`, §1.4). No `NavBadgeSpec` / `CoreVariant` imports
(notification/badge system is out of scope) — `PageEntry.badge` is dropped.

```ts
import type { ReactNode } from 'react'

/** Brand symbol — Symbol.for so HMR / multi-bundle duplication compares equal.
 *  @internal — never import to forge a brand; go through defineShellConfig. */
export const SHELL_CONFIG_BRAND: unique symbol = Symbol.for('mrs.shell.config')

/** Max-width values the shell's content Container accepts. */
export type PageContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

/** Visual variant for PageTabs + the PageSections tab strip. */
export type ShellTabsVariant = 'underline' | 'pill'

/** Browser-tab document-title composition mode. */
export type ShellDocumentTitleMode = 'composed' | 'leaf' | 'app'

/** One navigation entry — sidebar list + breadcrumb chain. subPages recursive. */
export interface PageEntry {
  /** Stable id; unique across the whole tree. */
  id: string
  /** Pathname. Starts with '/'. Sub-page routes start with parent route + '/'. */
  route: string
  /** Display-label resolver. Thunk so the consumer can wire t('…') and have it
   *  re-evaluate inside a tracked render. Called during render. */
  label: () => string
  /** Icon key — resolved by the consumer-supplied icon renderer (see config). */
  icon: string
  /** Nested entries — render as breadcrumb chain after the parent. */
  subPages?: PageEntry[]
  /** Sidebar divider before this entry. Ignored on the first visible page. */
  groupBreak?: boolean
  /** Mobile bottom-bar opt-in (only when AppShell mobileNav='tabBar'). Top-level only. */
  tabBar?: boolean
}

export interface ShellPageContainerConfig {
  defaultMaxWidth: PageContainerMaxWidth
}
export interface ShellTabsConfig {
  variant: ShellTabsVariant
}
export interface ShellPageHeaderConfig {
  /** Header band gets a bottom border. Default true. */
  border: boolean
  /** Project-wide default browser-tab mode. Default 'composed'. */
  documentTitle?: ShellDocumentTitleMode
}

/**
 * Icon renderer. The shell is icon-library-agnostic: the consumer passes one
 * function that turns an icon key + pixel size into a node. Replaces the
 * SolidJS `<Icon icon=… />` kit dependency — the React module ships no icon kit.
 */
export type ShellIconRenderer = (key: string, size: number) => ReactNode

/** Author-facing config — passed to defineShellConfig(). */
export interface ShellConfigInput {
  /** App name — home-link text + document-title suffix. Plain string. */
  appName: string
  /** Optional custom wordmark render for the brand area. */
  appNameRender?: () => ReactNode
  /** Top-level nav entries. At least one. */
  pages: PageEntry[]
  /** Page-container defaults. Omitted → '2xl'. */
  pageContainer?: ShellPageContainerConfig
  /** Tab strip variant. Omitted → 'underline'. */
  tabs?: ShellTabsConfig
  /** ShellPageHeader visual options. border default true. */
  shellPageHeader?: ShellPageHeaderConfig
  /** Renders icon keys. REQUIRED — sidebar / breadcrumb / tabs all need it. */
  renderIcon: ShellIconRenderer
  /**
   * Aria-label / tooltip strings the chrome needs (home link, breadcrumb nav,
   * open-menu, more). Consumer supplies translated thunks; the module never
   * imports i18n. All optional — sensible English fallbacks when omitted.
   */
  labels?: ShellChromeLabels
}

export interface ShellChromeLabels {
  home?: () => string
  breadcrumb?: () => string
  openMenu?: () => string
  mainNavigation?: () => string
  more?: () => string
}

/** Validated, branded config — what AppShell accepts. */
export interface ShellConfig extends ShellConfigInput {
  readonly [SHELL_CONFIG_BRAND]: true
}

/** Page-level search slot for ShellPageHeader. */
export interface ShellPageHeaderSearchSlot {
  onChange: (value: string) => void
  placeholder?: () => string
  initialValue?: string
}

/**
 * Spec registered by ShellPageHeader onto shell context, consumed by AppShell.
 * In React these are PLAIN values (not Solid getter proxies) — the registration
 * effect re-runs on prop change and re-registers, which re-renders AppShell.
 * See §1.5 for the React registration mechanism.
 */
export interface ShellPageHeaderSpec {
  title?: () => string
  actions?: Array<() => ReactNode>
  search?: ShellPageHeaderSearchSlot
  tabs?: () => ReactNode
  documentTitle?: ShellDocumentTitleMode | (() => string)
  className?: string
}
```

**Behavior:** types only; `PageEntry.label` stays a thunk (the consumer wires
`t()`), `documentTitle` keeps the three modes + verbatim-thunk escape hatch.

---

### 1.2 `defineShellConfig.ts` — builder + validator

Port the SolidJS validator near-verbatim; **drop the notification validators**
(`notificationTypes` / `notificationBell`). Add a `renderIcon` presence check.

```ts
export function defineShellConfig(input: ShellConfigInput): ShellConfig
```

**Validations (synchronous, throw `ShellConfigError` on violation):**

- `input` is an object; `appName` non-empty string; `appNameRender` (if present)
  a function; `renderIcon` is a function (NEW — required).
- `pages` is a non-empty array.
- Recursive `validatePageEntry`: every `id` unique across the whole tree; every
  `route` unique across the whole tree (keep the two-id "already declared by X"
  message); `label` a function; `icon` a non-empty string; `route` starts with
  `/`; every sub-page route nested under `parent + '/'` (and `!== parent`).
- `pageContainer.defaultMaxWidth` ∈ the 6-value set; `tabs.variant` ∈
  `{underline, pill}`; `shellPageHeader.border` a boolean.

Return `Object.freeze({ …input, [SHELL_CONFIG_BRAND]: true })`. Keep
`ShellConfigError extends Error` with the `[AppShell config]` prefix. Errors
surface at module-load time (the consumer imports its `shell.ts`).

**Why the brand survives the port:** the SolidJS runtime brand-check in
`<AppShell>` stays valuable in React too — re-imports / dynamic factories can
forge a raw object that satisfies the structural type; the symbol check is
defense in depth. Keep it.

---

### 1.3 `shellContext.ts` — React context

Replaces the SolidJS `createContext` + `useContext` with React's. The context
**value shape changes** because React state is not Solid signals: instead of an
`Accessor<HTMLElement>` for the scroll container, expose the element plus a
setter; the page-header spec is plain React state.

```ts
import { createContext, useContext } from 'react'
import type { ShellConfig, ShellPageHeaderSpec, PageEntry } from './shellContract'

/** One dynamic page — same fields as PageEntry, produced at runtime. */
export interface DynamicPagesEntry extends PageEntry {}

export interface ShellContextValue {
  config: ShellConfig
  /** The body-cell element, or null before mount. A state value (re-renders
   *  consumers when it resolves) — NOT an accessor. */
  scrollContainer: HTMLElement | null
  /** Internal — AppShell's body-cell ref callback calls this. */
  setScrollContainer: (el: HTMLElement | null) => void
  /** Map keyed by parent-route → that parent's dynamic children. */
  dynamicPages: Record<string, DynamicPagesEntry[]>
  /** Internal — useDynamicPages registers/replaces a parent's children. Returns unregister. */
  registerDynamicPages: (parent: string, items: DynamicPagesEntry[]) => () => void
  /** Currently-registered page-header spec, or null. */
  pageHeaderSpec: ShellPageHeaderSpec | null
  /** Internal — ShellPageHeader registers its spec. Returns unregister. Last-mounted wins. */
  registerPageHeader: (spec: ShellPageHeaderSpec) => () => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function useShellContext(): ShellContextValue { /* throw if null */ }
export function useShellContextOptional(): ShellContextValue | null { /* useContext */ }
```

**Behavior:** `useShellContext` throws the same "must be called inside
<AppShell>" message. `useShellContextOptional` returns `null` for components
that legitimately work standalone (AppHeader, PageSections, PageTabs,
SectionTabsStrip).

**React reactivity note (load-bearing):** the SolidJS version reads `config`
via a getter so prop changes propagate. In React, AppShell owns `config` as a
prop and the context value is rebuilt each render via `useMemo` keyed on the
state pieces — so any change to `config`, `scrollContainer`, `dynamicPages`, or
`pageHeaderSpec` produces a new context value and re-renders consumers. This is
the React-idiomatic equivalent of the Solid getter proxy; do not memo so
aggressively that a spec/container change is missed.

---

### 1.4 `AppShell.tsx` — orchestrator

The single biggest file. Drops every SSR scar (see Section 6); the rest ports
structurally.

**Props (`AppShellProps`):**

```ts
export type AppShellContentPadding = 'default' | 'none'
export type AppShellMobileNav = 'drawer' | 'tabBar'

export interface AppShellProps {
  config: ShellConfig                                  // must be branded
  useMenu: boolean                                      // true → AppMenu, false → AppHeader
  actions: Array<() => ReactNode>                       // render thunks; [] for none
  subtitle?: () => ReactNode                            // under brand
  titleAdornment?: () => ReactNode                      // right of brand (badge/pill)
  footer?: () => ReactNode
  contentPadding?: AppShellContentPadding               // default 'default'
  mobileNav?: AppShellMobileNav                         // default 'drawer'; menu mode only
  menuSide?: 'left' | 'right'                            // default 'left' (see note)
  children: ReactNode
}
```

> **`useMenu` simplification:** SolidJS accepts `boolean | (() => boolean)` and
> memoizes. In React just take `boolean` — the consumer re-renders AppShell with
> a different value when it needs to swap, which is the React-native way. No
> accessor arm.

> **`actions` simplification:** the SolidJS `ShellActionEntry` (built-in keys +
> registered keys + thunks, with a validator) collapses to `Array<() => ReactNode>`.
> No built-in `theme`/`language`/`notificationBell` keys (those are
> consumer-owned widgets in this ecosystem), no `actionRegistry`, no
> `validateActions`. The consumer composes the row from its own components.

> **`menuSide`:** SolidJS reads `configStore.menuSide` (a global store). This
> module ships no global store — take `menuSide` as a prop (default `'left'`),
> letting the consumer wire it to its own preference store. Document that it's a
> user preference, not a route decision.

**Runtime guard (keep):** throw if `config[SHELL_CONFIG_BRAND] !== true`.
Drop the notify↔notificationTypes asymmetric checks entirely.

**State:**
- `const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)` — set by
  the body-cell `ref` callback.
- `const [headerStack, setHeaderStack] = useState<ShellPageHeaderSpec[]>([])` —
  last-mounted wins; `pageHeaderSpec = headerStack.at(-1) ?? null`. `register`
  pushes and returns a pop-by-identity unregister (same stack semantics as
  SolidJS, expressed with `setState(prev => …)`).
- `const [dynamicPages, setDynamicPages] = useState<Record<string, DynamicPagesEntry[]>>({})`
  with `registerDynamicPages(parent, items)` returning an unregister that deletes
  the key.
- `registerPageHeader` / `registerDynamicPages` are wrapped in `useCallback` so
  their identity is stable (the registering effects in ShellPageHeader /
  useDynamicPages depend on them).

**Context value:** `useMemo` over `{ config, scrollContainer: scrollEl,
setScrollContainer: setScrollEl, dynamicPages, registerDynamicPages,
pageHeaderSpec, registerPageHeader }`, keyed on the reactive pieces.

**Document title:** port `documentTitleText` as a derived value computed each
render (no `<Title>` meta tag — SPA). Resolution order unchanged:
spec.documentTitle thunk → mode string → config.shellPageHeader.documentTitle →
'composed'; mode application composed/leaf/app exactly as SolidJS; leaf from
`spec.title?.()` else `findActiveChain(...).at(-1).entry.label()`. **Apply it
with `useEffect(() => { document.title = text }, [text])`** (no `@solidjs/meta`,
no SSR-rendered `<title>`). The SolidJS dispose-race rationale for centralizing
`<Title>` at AppShell evaporates — there is no meta-tag add/remove lifecycle in
a plain `document.title` write. Compute it at AppShell still (single owner), so
routes without a page header fall through to `appName`.

**Router reads:** `const pathname = useRouterState({ select: s => s.location.pathname })`
(see Section 4). Used by `findActiveChain` for the leaf label and by the two
navigation effects below.

**Mobile drawer state:** `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)`.
Two effects:
- Close on navigation: `useEffect(() => setMobileMenuOpen(false), [pathname])`
  (React fires on every pathname change including first; that's harmless — it
  just sets `false` to `false`. If you want SolidStart's `defer` semantics, gate
  with a `useRef` first-run flag, but it's unnecessary here).
- Auto-close past `lg`: `useEffect` adding a `matchMedia('(min-width: 1024px)')`
  `change` listener that closes the drawer when it matches; cleanup removes it.
  No `isServer` guard needed (SPA — always client).

**Derived helpers:** `showMenu = useMenu`; `useTabBar = showMenu && (mobileNav ?? 'drawer') === 'tabBar'`;
`menuOnLeft = (menuSide ?? 'left') !== 'right'`; `maxWidth =
config.pageContainer?.defaultMaxWidth ?? '2xl'`; `containerPadding =
contentPadding ?? 'default'`.

**Render structure (CSS-class equivalents of the SolidJS Tailwind tree — see
§3 for the class definitions):**

```
<ShellContext.Provider value={ctx}>
  <div className="mrs-shell" data-content-padding={containerPadding} data-max-width={maxWidth}>
    {!showMenu && <div className="mrs-shell__header-row"><AppHeader …/></div>}

    <div className="mrs-shell__middle">
      {showMenu && menuOnLeft && (
        <div className="mrs-shell__sidebar mrs-shell__sidebar--left">
          <AppMenu …/>
        </div>
      )}

      <div className="mrs-shell__page-area" data-shell-page-area>
        {pageHeaderSpec ? (
          <div className="mrs-shell__chrome">
            <div className="mrs-shell__container">      {/* maxWidth + padding via data-attrs */}
              <ShellPageHeaderUI
                spec={pageHeaderSpec}
                shell={ctx}
                showMenuButton={showMenu && !useTabBar}
                onOpenMenu={() => setMobileMenuOpen(true)}
              />
            </div>
          </div>
        ) : (
          showMenu && (
            <div className="mrs-shell__mobile-brand">     {/* lg:hidden via CSS */}
              {!useTabBar && (
                <button className="mrs-shell__hamburger" onClick={() => setMobileMenuOpen(true)}
                  aria-label={label('openMenu')}>{config.renderIcon('menu', 20)}</button>
              )}
              <Link to="/" className="mrs-shell__brand-link">{brand()}</Link>
            </div>
          )
        )}

        <div ref={setScrollEl} className="mrs-shell__content" data-shell-content>
          <div className="mrs-shell__container mrs-shell__container--fill">
            {children}
          </div>
        </div>
      </div>

      {showMenu && !menuOnLeft && (
        <div className="mrs-shell__sidebar mrs-shell__sidebar--right"><AppMenu …/></div>
      )}
    </div>

    {footer && <div className={useTabBar ? 'mrs-shell__footer mrs-shell__footer--hide-mobile' : 'mrs-shell__footer'}>{footer()}</div>}

    {useTabBar && <AppBottomNav onOpenMore={() => setMobileMenuOpen(true)} moreOpen={mobileMenuOpen} />}
  </div>

  {showMenu && (
    <MobileMenuDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} side={menuOnLeft ? 'left' : 'right'}>
      <AppMenu …/>
    </MobileMenuDrawer>
  )}
</ShellContext.Provider>
```

`MobileMenuDrawer` is a styled Radix Dialog (see §5). It mounts unconditionally
when `showMenu` (Radix manages mount/unmount on `open`); no SolidStart
eager-JSX-trigger workaround needed. The desktop static sidebar (`mrs-shell__sidebar`)
is `display:none` below `lg` and `display:block` at `lg+` purely in CSS (§3) —
no JS breakpoint branch, so there is no hydration concern (and none anyway, SPA).

**Container:** there is no `<Container>` component in this module. The shared
max-width + horizontal padding is a CSS class `mrs-shell__container` whose
behavior is driven by `data-max-width` / `data-content-padding` attributes on
the shell root (§3). Both the chrome slot and body cell use the same class so
breadcrumbs align with content. This replaces the SolidJS `<Container maxWidth=…
padding=…>` instances.

---

### 1.5 `ShellPageHeader.tsx` — registration component + UI renderer

Two exports plus the pure chain function and internal sub-renderers.

**`ShellPageHeader` (registration component, public):**

```ts
export interface ShellPageHeaderProps {
  title?: () => string
  actions?: Array<() => ReactNode>
  search?: ShellPageHeaderSearchSlot
  tabs?: () => ReactNode
  documentTitle?: ShellDocumentTitleMode | (() => string)
  className?: string
}
export function ShellPageHeader(props: ShellPageHeaderProps): null
```

Renders `null`. Registers on mount via effect:

```ts
const shell = useShellContext()
useEffect(() => {
  const spec: ShellPageHeaderSpec = {
    title: props.title, actions: props.actions, search: props.search,
    tabs: props.tabs, documentTitle: props.documentTitle, className: props.className,
  }
  const unregister = shell.registerPageHeader(spec)
  return unregister
}, [shell.registerPageHeader, props.title, props.actions, props.search,
    props.tabs, props.documentTitle, props.className])
```

**Mechanism difference vs SolidJS (important):** SolidJS registers ONCE in
`onMount` and exposes props via live getters, so AppShell reads fresh prop
values without re-registration. React has no getter-proxy idiom; instead the
effect re-registers whenever a prop changes (deps array above), pushing a new
spec object and re-rendering AppShell's chrome. Because the spec carries
**thunks** (`title`, `actions[]`, `tabs`) rather than computed values, the deps
compare the thunk identities — consumers should pass stable thunks
(`useCallback` or module-level) where they want to avoid re-registration churn,
but correctness does not depend on it (re-register is idempotent: pop-old-spec
is by the previous identity, push-new). Document this in the file header.

> SPA simplification: the SolidJS "chrome appears on first client render, not in
> SSR HTML" caveat is gone — there is no SSR. The chrome renders on the first
> (only) client render after the registration effect commits, i.e. effectively
> immediately. No `<Show when={runtime.isReady()}>` interplay to reason about.

**`findActiveChain` (pure, exported):** port verbatim — it is already a pure
function of `(roots, pathname, dynamicByParent)`. Longest-prefix match per
level, descend via `subPages`, merge `dynamicByParent[parentKey]` into the
candidate pool, stop when no match or a leaf with no dynamic children. This is
the breadcrumb's sole input (Hard Rule #7). Signature unchanged:

```ts
export interface ChainLevel { entry: PageEntry; siblings: PageEntry[] }
export function findActiveChain(
  roots: PageEntry[], pathname: string, dynamicByParent: Record<string, PageEntry[]>,
): ChainLevel[]
```

**`ShellPageHeaderUI` (internal, rendered by AppShell):** props
`{ spec, shell, showMenuButton?, onOpenMenu? }`. Reads pathname via
`useRouterState`/`useLocation`. Computes `activeChain` (memo), `leafMatchesPath`,
`leafLabel`, the `show*` predicates, `bandOnlyForMenu`. Renders the band:
breadcrumbs (with optional leading hamburger, mobile-only via CSS), an
`actions` cluster (`spec.actions.map(thunk => thunk())`), a search input
(`SearchInput`), and an optional pinned tabs row (`spec.tabs()`).

- The DEV "unregistered route" warning (`reportDevWarning`) ports to a
  `if (import.meta.env.DEV) { … console.warn(…) }` inside a `useEffect` keyed on
  `[pathname, leafMatchesPath]`. There is no `devBridge` in this module — use
  `console.warn` directly with the same message text (route + resolved
  ancestor + "register it in shell config `pages` or useDynamicPages").
- All icons via `shell.config.renderIcon(key, size)` — no `<Icon>` import.
- Labels via `shell.config.labels?.home?.() ?? 'Home'` etc.
- The home-link `homeTooltip` slot from SolidJS is **dropped** (it depended on
  the kit `<Tooltip>` + a project preference hook); the home link keeps a native
  `title` set to the home label. If a consumer wants a richer tooltip it wraps
  its own — out of scope.

**`SearchInput` (internal):** uncontrolled-ish `useState(initialValue ?? '')`;
`onInput` updates local state and calls `slot.onChange(v)`. Class
`mrs-page-header__search` (§3) with the search icon via `renderIcon('search', 16)`.

**`Breadcrumbs` (internal):** maps the chain. Home link first (`<Link to="/">`),
then each level: a chevron (`renderIcon('chevronRight', 14)`) before every
non-first level, the leaf either a `LeafDropdown` (siblings > 1) or plain text,
non-leaf levels plain `<Link to={level.entry.route}>`. `leafOverride` applies
only when `spec.title && leafMatchesPath()`.

**`LeafDropdown` (internal):** a Radix DropdownMenu (§5). Trigger is the leaf
label + a chevron-down icon; items are the siblings, each `onSelect`
→ `navigate({ to: s.route })`. `selectedId` highlights the current entry.

---

### 1.6 `useDynamicPages.ts`

```ts
export interface DynamicPageInput { id: string; label: string; route: string; icon?: string }
export interface DynamicPagesConfig { parent: string; items: DynamicPageInput[] }
export function useDynamicPages(config: DynamicPagesConfig): void
```

**Signature change:** SolidJS takes `() => DynamicPagesConfig` (a thunk, because
Solid tracks signal reads inside it). React takes the **plain object** `config` —
the caller already re-renders when its data (Convex query etc.) updates, so the
hook just runs an effect keyed on the relevant pieces.

```ts
const ctx = useShellContext()
useEffect(() => {
  const entries: DynamicPagesEntry[] = config.items.map(i => ({
    id: i.id, route: i.route, label: () => i.label, icon: i.icon ?? 'circle',
  }))
  const unregister = ctx.registerDynamicPages(config.parent, entries)
  return unregister
}, [ctx.registerDynamicPages, config.parent, serializeItems(config.items)])
```

`serializeItems` = a stable key over `items` (e.g. `items.map(i => i.id+i.route+i.label).join('|')`)
so the effect re-registers when the list content changes, not on every render
(the caller likely passes a fresh array each render). Wrap each plain-string
`label` in `() => label` to stay `PageEntry`-shaped.

> **The SolidJS `createComputed` (synchronous, SSR-correct) choice is moot.**
> Its entire purpose was to register during SSR render so server HTML carried the
> dynamic chain and avoided a hydration mismatch. SPA has no SSR HTML — a normal
> `useEffect` (post-commit) is correct, and the chain fills in on the same first
> paint cycle. Note this in the header.

Throws (via `useShellContext`) when outside `<AppShell>`.

---

### 1.7 `AppHeader.tsx`

Top banner. `useShellContextOptional()` (usable standalone). Props:

```ts
export interface AppHeaderProps {
  actions: Array<() => ReactNode>
  title?: string                 // standalone requires this; inside shell → config.appName
  homeRoute?: string             // default '/'
  titleAdornment?: () => ReactNode
  subtitle?: () => ReactNode
  className?: string
}
```

- `resolvedTitle`: `props.title ?? shell?.config.appName ?? throw`.
- `renderBrand`: `appNameRender` when showing config name, else text.
- **No `validateActions`** — actions are plain thunks. Render
  `actions.map(thunk => thunk())` in the right zone.
- Classes: `mrs-app-header`, `mrs-app-header__brand`, `mrs-app-header__subtitle`,
  `mrs-app-header__actions` (§3). Home link is a TanStack `<Link to={homeRoute}>`.

---

### 1.8 `AppMenu.tsx`

Sidebar column. `useShellContext()` (requires shell). Props:

```ts
export interface AppMenuProps {
  actions: Array<() => ReactNode>
  titleAdornment?: () => ReactNode
  subtitle?: () => ReactNode
  size?: 'sm' | 'md' | 'lg'      // 160 / 224 / 288 px, default 'md'
  className?: string
}
```

- `activePageId`: longest-match memo over `config.pages` against `pathname` —
  port verbatim (it's pure logic). `useMemo` keyed on `[pathname, config.pages]`.
- Render header (brand + adornment + subtitle), the page list, the action footer.
- **Drop ALL badge/pill/notification rendering** (`NavBadge`, `NavDot`,
  `PillPopover`, `resolveBadge`, `systemCounts`, `notify`). A page row is just
  `<Link to={page.route}>` with `renderIcon(page.icon, 18)` + `page.label()`.
  `groupBreak` still renders a divider before the entry (index > 0).
- Active row gets `data-active` (CSS highlight). Width by `data-size` attribute
  driving the `mrs-app-menu` width (§3).
- Action footer: `actions.map(thunk => thunk())`; spacing class chosen by
  `actions.length <= 3` (justify-around) vs more (justify-between) — a
  `data-action-count` attribute or a conditional class.

This same component renders both the static desktop column and the mobile-drawer
body (AppShell mounts `<AppMenu>` inside `MobileMenuDrawer`). It's side-agnostic.

---

### 1.9 `AppBottomNav.tsx`

Mobile bottom tab bar; rendered by AppShell only when `mobileNav='tabBar'` and
menu mode. `useShellContext()`. Props `{ onOpenMore, moreOpen?, className? }`.

- `barPages = config.pages.filter(p => p.tabBar)`; `overflowExists =
  config.pages.some(p => !p.tabBar)`; `activePageId` (same longest-match memo);
  `moreActive = moreOpen || (active && !barPageIds.has(active))`.
- DEV soft-cap warning at > 5 bar pages and a "no page marked tabBar" warning —
  `if (import.meta.env.DEV) console.warn(…)` inside an effect (run once-ish; key
  on `barPages.length`).
- **Drop the per-page presence dot** (it read `notify` / `resolveBadge`). Bar
  tabs are icon-over-label `<Link>`s; the More tab is a `<button onClick=onOpenMore>`.
- CSS: `mrs-bottom-nav` is `display:none` at `lg+`, `display:flex` below (§3),
  with `padding-bottom: env(safe-area-inset-bottom)`. Icons via `renderIcon`.

---

### 1.10 `PageTabs.tsx`

Route-level tab strip. `useShellContextOptional()` (variant from config; tolerates
standalone). Props:

```ts
export interface PageTab { id: string; label: string; icon?: string; route: string }
export interface PageTabsProps { tabs: PageTab[]; match?: 'exact' | 'prefix'; className?: string }
```

- `findActiveTabId` — port verbatim (pure longest-match; exact mode is a
  `find`).
- `variant = shell?.config.tabs?.variant ?? 'underline'`.
- **Drop `activePageId` + all system-pill/badge rendering** — those existed only
  for the notification key derivation `${pageId}:${tabId}`. A tab is a
  `<Link to={tab.route}>` with optional `renderIcon(tab.icon, 16)` + label.
- Wrap in a horizontally-scrollable row (`mrs-tab-row`, the
  `ScrollableTabRow` equivalent — a flex row with `overflow-x: auto` and hidden
  scrollbar via the existing `.scrollbar-hidden` from base.css, see §3).
- Active tab: `data-active` + `data-variant` driving underline vs pill styling
  (§3).

> `PageTab.icon` widens from `IconRegistryKey` to `string` (the module ships no
> icon registry; `renderIcon` resolves keys). Pinning: a route layout mounts
> `<ShellPageHeader tabs={() => <PageTabs …/>}>` so the strip rides into the
> pinned chrome slot — unchanged contract.

---

### 1.11 `PageSections.tsx` + `pageSections/`

The most behavior-dense port. Preserves Hard Rules #4b (scrolls the body cell),
#5 (URL↔state via router primitives), and the scrollspy-not-IO rule (#1
secondary).

**`pageSections/types.ts`:**

```ts
export interface PageSection {
  id: string
  label: () => string
  icon?: string
  children: () => ReactNode      // THUNK — not eager. See note below.
  tooltip?: () => string
  actions?: Array<() => ReactNode>   // list-mode header bar, right-aligned
  lazy?: boolean                      // list mode only
}
export type PageSectionsMode = 'list' | 'single'
export interface PageSectionsProps {
  sections: PageSection[]
  mode?: PageSectionsMode            // default 'single'
  className?: string
  onActiveChange?: (sectionId: string) => void
  activeId?: string                  // externally controlled
  persistKey?: string                // ?<key>= sync; omit to disable
}
```

> **`children` thunk — keep it, but the rationale changes.** The SolidJS reason
> was hydration-walker crashes on eager JSX for unmounted sections AND
> hooks-evaluated-too-early (Hard Rule #4). In React/SPA there is no hydration
> walker. BUT the thunk is still correct and recommended: single mode mounts
> only the active section, and eager `children: <SectionThatCallsHooks/>` in the
> caller's `sections` array would mount/run every section's component eagerly
> regardless of active state (and pay their effects/queries up front). Keeping
> `() => ReactNode` defers each section's element creation to the branch that
> actually renders it. Type stays `() => ReactNode`; do NOT widen. Note in the
> file: the SSR-crash half of the SolidJS rule is moot, the lazy-mount half holds.

**`pageSections/scrollspy.ts`:** port **verbatim** — it is already
framework-agnostic pure DOM glue (`setupScrollspy(container, refs, hooks)` adds a
rAF-free `scroll` listener that picks the closest section by reference line;
`scrollToSection(opts)` does the force-mount-then-measure click-to-scroll with
the two-rAF wait). No Solid/React specifics inside. Constants
`ACTIVE_THRESHOLD_PX = -30`, `PROGRAMMATIC_SCROLL_GUARD_MS = 800` unchanged. The
hooks interface (`getActiveId/setActiveId/isProgrammatic/getTopOffset`) is
plain callbacks — fed by PageSections refs/state.

> This directly satisfies the Hard Rule #1 secondary rule: **use a throttled
> `scroll` listener on the body cell for "is X on screen" UI state, NOT IO
> sentinels** (which miss threshold crossings at slow velocity). The IO use is
> confined to LazyContent lazy-loading, where a missed frame is fine.

**`pageSections/modes.tsx`** — `SectionsListMode`, `SectionsSingleMode`,
`SectionTabsStrip`, `LazyContent`:

- `LazyContent`: port the **reactive-wait-for-container** logic (Hard Rule #4a).
  In React: `const [visible, setVisible] = useState(false)`; a ref on the
  placeholder div; an effect that creates the `IntersectionObserver` only once
  `scrollRoot()` resolves when a shell is present (`if (shell && !root) return`)
  — standalone observes the viewport (`root: null`). `rootMargin: '200px 0px'`.
  Render `{visible || forceMountAll() ? children : <placeholder/>}`. The
  effect's deps include the resolved root so it re-runs when the body-cell ref
  arrives. **This is the critical regression-prone spot** — with a premature
  `root: null`, the 200px margin extends the viewport frame and every section
  mounts at once. Keep the wait-for-container guard.
- `SectionsListMode`: `sections.map` → a card per section with header bar
  (icon + `label()` + right-aligned `actions`), wrapping `children()` in
  `LazyContent`. Register each section's DOM node via `registerRef(id, el)` (ref
  callback). `scroll-mt-24` equivalent via a `mrs-section` class with
  `scroll-margin-top`.
- `SectionsSingleMode`: `sections.map` → render only the section whose `id ===
  activeId()`.
- `SectionTabsStrip`: the tab buttons. **Drop the badge/pill/notification code +
  `activePageId`** (notification key derivation only). Keep the variant
  underline/pill styling, `role="tablist"`/`role="tab"`/`aria-selected`, and
  `onTabClick(section.id)`. Wrap in the `mrs-tab-row` scrollable row.

**`PageSections.tsx` (component):** port the state machine, translating Solid
signals/effects to React:

- `mode = props.mode ?? 'single'`.
- Router: `pathname` + `search` from `useRouterState`/`useLocation`; `navigate`
  from `useNavigate` (§4). `shell = useShellContextOptional()`.
- `setTabInUrl(key, value)`: build params from the **router's** `search` (NOT
  `window.location.search` — Hard Rule #5 / the in-flight-transition bleed),
  early-return if unchanged, else `navigate({ to: pathname, search: nextSearch,
  replace: true })`. TanStack's `search` is an object — merge rather than string
  manipulation (§4).
- `initialId()`: external `activeId` > URL param (validated against sections) >
  (single mode + return-from-descendant via the module-scoped
  `lastSingleByPath` Map) > first section. Port the module-scoped `previousPath`
  + `lastSingleByPath` + `isReturnFromDescendant` verbatim (they survive
  unmount/remount; React doesn't change that).
- `const [activeId, setActiveId] = useState(initialId())`.
- **Effects (React translations of the Solid `createEffect`s):**
  - Sync external `activeId`: `useEffect(() => { if (props.activeId !==
    undefined) setActiveId(props.activeId) }, [props.activeId])`.
  - `onActiveChange`: `useEffect(() => { props.onActiveChange?.(activeId) },
    [activeId])` (fires on every change; the SolidJS `on(activeId,…)` is the same
    contract — every mutation path flows through here).
  - **URL → state** (same-path deep links): effect keyed on `[search]`; read
    `fromUrl = search[persistKey]`; bail if controlled / no key / not a real
    section / equals current `activeId`. The SolidJS `untrack(activeId)` guard
    becomes: **do NOT put `activeId` in the deps** (so the effect runs on URL
    changes only), and read the current `activeId` from a ref
    (`activeIdRef.current`) for the equality check — this reproduces the
    load-bearing untrack (Hard Rule #5: without it the effect re-runs on user
    clicks and snaps the tab back). On a real change `setActiveId(fromUrl)` and,
    in list mode, `scrollActiveIntoView(fromUrl, 'smooth')`.
  - **state → URL** (edge-triggered, skip first): a `prevActiveForUrl` ref; on
    `activeId` change, if `persistKey` and `prevActiveForUrl.current !==
    undefined && !== current`, call `setTabInUrl`. Then update the ref. Also
    `lastSingleByPath.set(pathname, current)` in single mode. **Skipping the
    first write is load-bearing** — writing on mount can cancel an in-flight
    cross-page navigation (the SolidJS incident: `/risk → /trust` landing on
    `/risk?tab=…`). Keep the edge trigger.
  - **previousPath tracking:** effect keyed on `[pathname]` storing the prior
    pathname to the module-scoped `previousPath` (use a ref for "prev").
- **Scroll container + scrollspy** (Hard Rule #4b): an effect that reads
  `shell?.scrollContainer` (now a state value, not an accessor) — when it
  resolves and differs from the attached one, attach `setupScrollspy(sc, refs,
  hooks)` and clean up the previous; do the one-shot initial deep-link scroll
  (`scrollActiveIntoView(initial, 'instant')`) when `initial !== sections[0].id`.
  Deps include `shell?.scrollContainer` so it re-runs when the body-cell ref
  arrives — **this is the React equivalent of the SolidJS "reactive, not bare
  onMount" requirement** (the body-cell ref can resolve after PageSections
  mounts; reading once on mount would skip scrollspy forever). Guard the
  one-shot with a ref so it runs once.
- `scrollActiveIntoView`, `handleTabClick`, `registerRef` — port as plain
  functions (closure over refs/state).
- **Render:** outer `div.mrs-sections`; the sticky strip
  (`div.mrs-sections__strip` with the `position: sticky; top: 0` + opaque
  background from §3) wrapping `<SectionTabsStrip>`; then the body with
  `<SectionsListMode>` (passing `scrollRoot={() => shell?.scrollContainer ??
  undefined}`) or `<SectionsSingleMode>` by mode.

---

### 1.12 `index.ts` — sub-path barrel

```ts
export { AppShell } from './AppShell'
export type { AppShellProps, AppShellContentPadding, AppShellMobileNav } from './AppShell'
export { AppHeader } from './AppHeader'
export type { AppHeaderProps } from './AppHeader'
export { AppMenu } from './AppMenu'
export type { AppMenuProps } from './AppMenu'
export { AppBottomNav } from './AppBottomNav'
export type { AppBottomNavProps } from './AppBottomNav'
export { ShellPageHeader, findActiveChain } from './ShellPageHeader'
export type { ShellPageHeaderProps, ChainLevel } from './ShellPageHeader'
export { useDynamicPages } from './useDynamicPages'
export type { DynamicPageInput, DynamicPagesConfig } from './useDynamicPages'
export { defineShellConfig, ShellConfigError } from './defineShellConfig'
export { useShellContext, useShellContextOptional } from './shellContext'
export type { ShellContextValue } from './shellContext'
export { PageTabs } from './PageTabs'
export type { PageTab, PageTabsProps } from './PageTabs'
export { PageSections } from './PageSections'
export type { PageSection, PageSectionsMode, PageSectionsProps } from './PageSections'
export type {
  PageEntry, ShellConfig, ShellConfigInput, PageContainerMaxWidth,
  ShellPageContainerConfig, ShellTabsConfig, ShellTabsVariant,
  ShellPageHeaderConfig, ShellPageHeaderSearchSlot, ShellDocumentTitleMode,
  ShellIconRenderer, ShellChromeLabels,
} from './shellContract'
```

The stylesheet `app-shell.css` is a side-effect import — the consumer either
imports `my-react-shell/app-shell/styles.css` (add an export entry) OR the
barrel imports it at the top (`import './app-shell.css'`, which `sideEffects`
in package.json already preserves). **Recommend the barrel-side import** so the
consumer can't forget it; add `'**/*.css'` is already in `sideEffects`.

**package.json export entry to add:**

```json
"./app-shell": { "types": "./dist/app-shell/index.d.ts", "import": "./dist/app-shell/index.js" }
```

And ship `src/app-shell/app-shell.css` in `files` (or rely on it being compiled
into the import graph; since Vite/tsc-only `prepare` compiles JS and the CSS is
a raw asset, list `src/app-shell/app-shell.css` under `files` and have the
barrel `import './app-shell.css'`). Confirm the `prepare` (`tsc -p
tsconfig.lib.json`) copies/leaves the CSS — if tsc alone won't emit the asset,
either (a) keep the CSS under `src/styles/` and add it to the existing
`styles.css` aggregate, or (b) add a copy step. Flag for the implementer.

---

## 2. Shell context + defineShellConfig type shapes (consolidated)

See §1.1 (`shellContract.ts`) and §1.3 (`shellContext.ts`) for the full
interfaces. The two diffs vs SolidJS worth restating:

1. **No notification surface anywhere** — `notificationTypes`,
   `notificationBell`, `notify`, `NavBadgeSpec`, `CoreVariant`, `PageEntry.badge`,
   `PageTab.badge`, `PageSection.badge` all removed. The notification system is
   app-glue (out of scope); a consumer fills the page-header action slot with its
   own bell.
2. **`scrollContainer` is a state value, not an accessor.** `ShellContextValue.scrollContainer:
   HTMLElement | null` (+ `setScrollContainer`). Consumers read it directly;
   React re-renders them when it resolves. (SolidJS exposed an `Accessor<HTMLElement
   | undefined>` because Solid components don't re-render — they track.)
3. **`renderIcon` is a required config field** — the module ships no icon kit.

---

## 3. Responsive layout + `app-shell.css` (on real theme tokens)

The library ships precompiled JS; a consumer's Tailwind never scans
`node_modules`, so **no Tailwind utility classes survive the build.** Every
shell style lives in `src/app-shell/app-shell.css` as stable `mrs-`-prefixed
semantic classes on the theme tokens, plus media queries (which inline styles
cannot express). Components reference class names; inline `style` only for truly
dynamic values (none needed here — `data-*` attributes drive all variants).

**Tokens used (verified present in `src/styles/base.css`):**
`--color-background-primary`, `--color-surface-primary`,
`--color-surface-secondary`, `--color-border-primary`, `--color-border-secondary`,
`--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`,
`--color-primary`, `--color-primary-bg`, `--color-hover`, `--color-focus-ring`,
`--color-overlay` (drawer scrim). The existing `.scrollbar-hidden` helper in
base.css is reused for the tab rows.

**Breakpoint:** one media query at **1024px** (the SolidJS `lg`). Below =
"mobile" (drawer / optional bottom nav, static sidebar hidden); at/above =
"desktop" (persistent sidebar, no drawer trigger, no bottom nav).

### 3.1 Class list (grouped by component)

**Shell frame**
- `.mrs-shell` — `display:flex; flex-direction:column; height:100dvh; min-height:0;
  background: var(--color-background-primary)`.
- `.mrs-shell__header-row` — `flex-shrink:0` (header mode banner wrapper).
- `.mrs-shell__middle` — `display:flex; flex:1; min-height:0`.
- `.mrs-shell__page-area` — `flex:1; min-width:0; min-height:0; display:flex;
  flex-direction:column`.
- `.mrs-shell__chrome` — `flex-shrink:0` (pinned page-header slot).
- `.mrs-shell__content` — `flex:1; min-width:0; min-height:0; overflow-y:auto`.
  **This is `[data-shell-content]`; the ONLY scroller (Hard Rule #1).**
- `.mrs-shell__footer` — `flex-shrink:0`. `.mrs-shell__footer--hide-mobile` adds
  a `@media (max-width: 1023.98px){ display:none }`.

**Container (max-width + padding, replacing `<Container>`)**
- `.mrs-shell__container` — `width:100%; margin-inline:auto`. Horizontal padding
  via attribute selectors keyed on the shell root:
  - `.mrs-shell[data-content-padding="default"] .mrs-shell__container { padding-inline: 1rem }`
    then `@media (min-width:640px){ … 1.5rem }`, `@media (min-width:1024px){ … 2rem }`
    (the `px-4 sm:px-6 lg:px-8` rhythm).
  - `.mrs-shell[data-content-padding="none"] .mrs-shell__container { padding-inline: 0 }`.
  - Max-width by `data-max-width`: `sm`→640, `md`→768, `lg`→1024, `xl`→1280,
    `2xl`→1536px `max-width`; `full`→none. (`.mrs-shell[data-max-width="lg"]
    .mrs-shell__container { max-width: 1024px }`, etc.)
- `.mrs-shell__container--fill` — adds `height:100%` (the body-cell container).

**Sidebar (`AppMenu`)**
- `.mrs-shell__sidebar` — desktop static column wrapper:
  `flex-shrink:0; display:none; @media (min-width:1024px){ display:block }`.
  `--left` adds `border-right: 1px solid var(--color-border-primary)`; `--right`
  `border-left:…`.
- `.mrs-app-menu` — `display:flex; flex-direction:column; height:100%;
  flex-shrink:0; background: var(--color-surface-primary)`. Width by
  `data-size`: `sm`→10rem, `md`→14rem, `lg`→18rem.
- `.mrs-app-menu__head` — `flex-shrink:0; padding:1rem; border-bottom:1px solid
  var(--color-border-primary)`.
- `.mrs-app-menu__brand` — `font-size:1.125rem; font-weight:700; color:
  var(--color-text-primary)`; `:hover { color: var(--color-primary) }`.
- `.mrs-app-menu__subtitle` — `margin-top:.25rem; font-size:.75rem; color:
  var(--color-text-tertiary)`.
- `.mrs-app-menu__nav` — `flex:1; min-height:0; overflow-y:auto; padding:.75rem;
  display:flex; flex-direction:column; gap:.25rem`.
- `.mrs-app-menu__divider` — `margin-block:.5rem; border-top:1px solid
  var(--color-border-primary)` (the `groupBreak`).
- `.mrs-app-menu__item` — `display:flex; align-items:center; gap:.75rem;
  padding:.375rem .5rem; border-radius:.375rem; font-size:.875rem; color:
  var(--color-text-secondary); text-decoration:none`. `:hover { background:
  var(--color-hover); color: var(--color-text-primary) }`.
  `[data-active="true"] { color: var(--color-primary); font-weight:500;
  background: var(--color-primary-bg) }`.
- `.mrs-app-menu__actions` — `flex-shrink:0; padding:.75rem; border-top:1px solid
  var(--color-border-primary); display:flex; align-items:center`. Spacing by
  `data-dense`: ≤3 → `justify-content:space-around`, else `space-between`.

**Header banner (`AppHeader`)**
- `.mrs-app-header` — `display:flex; align-items:center; gap:.75rem;
  padding:.75rem 1.5rem; border-bottom:1px solid var(--color-border-primary);
  background: var(--color-surface-primary)`.
- `.mrs-app-header__brand` — `font-size:1.25rem; font-weight:700; color:
  var(--color-text-primary)`; hover → primary.
- `.mrs-app-header__subtitle`, `.mrs-app-header__actions` (`display:flex;
  align-items:center; gap:.5rem; margin-left:auto`).

**Mobile brand strip + hamburger (no page header)**
- `.mrs-shell__mobile-brand` — `display:flex; align-items:center; gap:.5rem;
  padding:.5rem 1rem; border-bottom:1px solid var(--color-border-primary);
  @media (min-width:1024px){ display:none }`.
- `.mrs-shell__hamburger` — ghost icon button; `display:inline-flex`.

**Page header chrome (`ShellPageHeaderUI`)**
- `.mrs-page-header` — the band: `padding-top:.75rem; padding-bottom:.25rem`.
  `[data-border="true"]` adds `border-bottom:1px solid var(--color-border-primary)`.
  `[data-menu-only="true"]` adds a `@media (min-width:1024px){ display:none }`
  (band exists only for the mobile hamburger).
- `.mrs-page-header__row` — `display:flex; flex-wrap:wrap; align-items:flex-start;
  column-gap:1rem; row-gap:.5rem`. `align-items:flex-start` anchors breadcrumbs to
  the top so tall actions don't re-center them (preserve this).
- `.mrs-breadcrumbs` — `display:flex; align-items:center; gap:.5rem;
  font-size:1.125rem; font-weight:600; min-width:0`. Order-1.
- `.mrs-breadcrumbs__home`, `.mrs-breadcrumbs__link` (text-secondary → hover
  text-primary), `.mrs-breadcrumbs__leaf` (`color: var(--color-primary)`),
  `.mrs-breadcrumbs__chevron`.
- `.mrs-page-header__actions` — `display:flex; align-items:center; gap:.5rem;
  margin-left:auto`. Order: mobile `order:2`, desktop `order:3` (a `@media
  (min-width:640px)` flip).
- `.mrs-page-header__search` — `position:relative; flex-basis:100%; order:3` on
  mobile; `@media (min-width:640px){ flex-basis:auto; flex:1; min-width:220px;
  order:2 }`. The input: `width:100%; height:2.25rem; padding-left:2.25rem;
  border-radius:.375rem; background: var(--color-surface-secondary); border:1px
  solid var(--color-border-primary); color: var(--color-text-primary)`;
  `:focus { outline:none; box-shadow:0 0 0 2px var(--color-focus-ring) }`.
- `.mrs-page-header__tabs` — `margin-top:.5rem` (pinned tabs row).

**Tab rows (`PageTabs` + `SectionTabsStrip`)**
- `.mrs-tab-row` — `display:flex; align-items:stretch; overflow-x:auto`; compose
  with the existing `.scrollbar-hidden`. `[data-variant="underline"] {
  gap:.25rem; border-bottom:1px solid var(--color-border-primary) }`;
  `[data-variant="pill"] { gap:.5rem; padding-block:.5rem }`.
- `.mrs-tab` — the tab cell. Underline variant: `border-bottom:2px solid
  transparent; margin-bottom:-1px`; `[data-active="true"] { border-color:
  var(--color-primary) }`. Pill variant: `border-radius:.375rem`;
  `[data-active="true"] { background: var(--color-primary-bg) }`.
- `.mrs-tab__button` / `.mrs-tab__link` — `display:flex; align-items:center;
  gap:.5rem; padding:.5rem .75rem; font-size:.875rem; font-weight:500;
  white-space:nowrap; color: var(--color-text-secondary); text-decoration:none`.
  `[data-active="true"] { color: var(--color-primary) }`; hover → text-primary
  (underline) or `background: var(--color-hover)` (pill).

**PageSections frame**
- `.mrs-sections` — `min-width:0`.
- `.mrs-sections__strip` — `position:sticky; top:0; z-index:20; background:
  var(--color-background-primary)`. **Sticky against the body cell (Hard Rule
  #4b).**
- `.mrs-sections__body` — `display:flex; flex-direction:column; gap:1.5rem;
  padding-top:1rem`.
- `.mrs-section` — `scroll-margin-top:6rem; margin-right:.5rem` (clears the
  scrollbar track).
- `.mrs-section__card` — `background: var(--color-surface-secondary);
  border-radius:.5rem; border:1px solid var(--color-border-secondary)`.
- `.mrs-section__head` — `display:flex; align-items:center; gap:.5rem;
  padding:.625rem 1rem; border-bottom:1px solid var(--color-border-secondary)`.
- `.mrs-section__title` — `font-size:.875rem; font-weight:600; color:
  var(--color-text-primary)`. `.mrs-section__actions` — `margin-left:auto;
  display:flex; gap:.25rem`.
- `.mrs-section__placeholder` — `padding-block:3rem` (lazy fallback).

**Bottom nav (`AppBottomNav`)**
- `.mrs-bottom-nav` — `display:flex; border-top:1px solid
  var(--color-border-primary); background: var(--color-surface-primary);
  padding-bottom: env(safe-area-inset-bottom); @media (min-width:1024px){
  display:none }`. (Hidden on desktop where the sidebar takes over.)
- `.mrs-bottom-nav__tab` — `flex:1; min-width:0; min-height:3.5rem;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:.125rem; padding:.375rem .25rem; text-decoration:none; color:
  var(--color-text-secondary)`. `[data-active="true"] { color: var(--color-primary) }`.
- `.mrs-bottom-nav__label` — `font-size:11px; line-height:1; font-weight:500;
  max-width:100%; overflow:hidden; text-overflow:ellipsis`.

**Mobile drawer (Radix Dialog, §5)**
- `.mrs-drawer__overlay` — `position:fixed; inset:0; background:
  var(--color-overlay)` (only when scrim wanted; the menu drawer can omit it).
- `.mrs-drawer__content` — `position:fixed; top:0; bottom:0; width:auto;
  max-width:85vw; background: var(--color-surface-primary); z-index:50`. `--left
  { left:0; border-right:1px solid var(--color-border-primary) }`; `--right {
  right:0; border-left:… }`. Optional slide-in keyframes (the consumer's
  styles already carry `slide-in-*` patterns; ship minimal ones here or rely on
  Radix data-state attributes `[data-state="open"]` for a transform animation).

### 3.2 Responsive behavior summary

| Viewport | Sidebar mode (`useMenu`) | Header mode |
|---|---|---|
| ≥ 1024px | Static `.mrs-shell__sidebar` shown; no hamburger; no bottom nav; drawer closed/unused. | Full-width banner. |
| < 1024px, `mobileNav='drawer'` (default) | Static sidebar hidden; hamburger in the page-header row (or the `.mrs-shell__mobile-brand` strip when no page header) opens the Radix Dialog drawer rendering `<AppMenu>`. | Banner unchanged (already mobile-friendly). |
| < 1024px, `mobileNav='tabBar'` | Static sidebar hidden; **no** hamburger; `.mrs-bottom-nav` shows `tabBar:true` pages + a "More" tab opening the same drawer; footer hidden on mobile. | n/a (tabBar is menu-mode only). |

All show/hide is CSS media queries (`@media (max-width:1023.98px)` /
`(min-width:1024px)`) on the classes above. The only JS that touches the
breakpoint is the auto-close-drawer-past-`lg` `matchMedia` effect in AppShell.

---

## 4. TanStack Router mapping

SolidStart `@solidjs/router` → TanStack `@tanstack/react-router`. TanStack is an
**optional peer** already in package.json; import lazily/normally (the consumer
brings it).

| Need | SolidJS | TanStack React |
|---|---|---|
| Read pathname (reactive) | `useLocation().pathname` | `useRouterState({ select: s => s.location.pathname })` — re-renders only when pathname changes. |
| Read search (reactive, object) | `useLocation().search` (string) | `useRouterState({ select: s => s.location.search })` — an **object**, or typed `useSearch({ strict: false })`. |
| Navigate | `useNavigate()` → `navigate(url, { replace })` | `useNavigate()` → `navigate({ to, search, replace: true })`. |
| Link | `<A href=…>` | `<Link to={…}>` (`@tanstack/react-router`). |
| Active/prefix match | manual `pathname.startsWith(route + '/')` | keep the **manual** longest-prefix logic — it's pure and identical. (TanStack's `matchRoute`/`useMatches` exist but the shell's longest-match-across-a-config-tree is its own algorithm; don't replace it.) |

**Concrete usages:**

- **AppShell:** `const pathname = useRouterState({ select: s => s.location.pathname })`
  for the document-title leaf, the close-drawer-on-nav effect.
- **ShellPageHeaderUI / AppMenu / AppBottomNav / PageTabs:** same pathname read;
  manual longest-prefix `activePageId` / `findActiveChain` / `findActiveTabId`
  (all pure, ported verbatim).
- **Breadcrumb home/links + AppMenu items + PageTabs tabs:** `<Link to={route}>`.
- **LeafDropdown / dynamic navigation:** `const navigate = useNavigate(); navigate({ to: route })`.
- **PageSections URL sync:** read `search` (object) via `useRouterState`; write
  via `navigate({ to: pathname, search: prev => ({ ...prev, [persistKey]: value }),
  replace: true })`. **Search is an object in TanStack** — this is cleaner than
  SolidStart's string `URLSearchParams` dance. Equality guard: compare
  `search[persistKey] === value` before navigating. Keep the **router** `search`
  as the source (never `window.location.search`) — the in-flight-transition
  bleed (Hard Rule #5 / the SolidJS `getTabFromSearch` jsdoc) is a TanStack
  concern too: during a pending navigation the committed `window.location` can
  lag the router's location.

### 4.1 The breadcrumb-chain pure function (restated, TanStack-fed)

`findActiveChain(roots, pathname, dynamicByParent)` is unchanged pure logic
(§1.5). The ONLY router coupling is the `pathname` argument, sourced from
`useRouterState({ select: s => s.location.pathname })`. **The breadcrumb is a
pure function of the TanStack location pathname** (Hard Rule #7) — nothing else
feeds it. Longest-prefix match per level, descend via `subPages`, merge dynamic
children at each level by parent route.

```ts
// caller (ShellPageHeaderUI):
const pathname = useRouterState({ select: s => s.location.pathname })
const chain = useMemo(
  () => findActiveChain(shell.config.pages, pathname, shell.dynamicPages),
  [shell.config.pages, pathname, shell.dynamicPages],
)
```

---

## 5. Radix primitive mapping

All three Radix packages are optional peers already declared in package.json.

| SolidJS (Kobalte) | Radix React | Where used | Notes |
|---|---|---|---|
| Kobalte `Dialog` (mobile drawer) | `@radix-ui/react-dialog` | AppShell `MobileMenuDrawer` | A styled Dialog used as a side sheet. `Dialog.Root open onOpenChange` (controlled), `Dialog.Portal` → `Dialog.Overlay` (optional `.mrs-drawer__overlay`) + `Dialog.Content` (`.mrs-drawer__content--left/right`). Provide a visually-hidden `Dialog.Title` for a11y. Radix mounts Content only while open. |
| Kobalte `DropdownMenu` (subPages title dropdown) | `@radix-ui/react-dropdown-menu` | `LeafDropdown` in ShellPageHeader | `DropdownMenu.Root` → `Trigger` (the leaf label + chevron button) → `Portal` → `Content` → `Item` per sibling with `onSelect={() => navigate({ to: s.route })}`. Mark the current entry (e.g. `data-current`). |
| Kobalte `Popover` | `@radix-ui/react-popover` | (none in scope) | Only the notification `PillPopover` used it — out of scope. **Likely unused** by the ported module; keep the peer for parity but don't import it unless a consumer composes a popover into an action thunk. |

**Radix manages focus scope + `aria-hidden` itself.** The SolidJS Hard Rule #3
manual closed→open blur workaround (blur `document.activeElement` before
Kobalte's `hideOutside` runs, to avoid "Blocked aria-hidden on an element
because its descendant retained focus") is **unnecessary with Radix.** Radix
Dialog's `FocusScope` moves focus into the dialog on open and Radix
`react-remove-scroll` / its own `aria-hidden` handling does not leave the
trigger focused inside an aria-hidden subtree. **Confirm during implementation
by opening the mobile drawer from a focused hamburger and checking the console
for the aria-hidden warning** — but do NOT pre-emptively port the blur effect.
Note this verification step in the file header.

> Trigger-based Kobalte primitives in SolidJS (`Dropdown`, `Tooltip`, `Select`)
> never needed the blur workaround because the focus scope handled it; Radix is
> the same. The only place the SolidJS shell opened a modal from a controlled
> `open` (not a `Trigger`) was the mobile drawer — and Radix's `Dialog` with
> `open`/`onOpenChange` handles focus correctly out of the box.

---

## 6. Behavior contracts to preserve + which Hard Rules go moot

### Preserve verbatim

1. **Scroll container = the body cell (`[data-shell-content]`), the only
   scroller** (Hard Rule #1). `.mrs-shell__content` is `overflow-y:auto`; the
   document, the chrome slot, the sidebar, the footer all stay pinned. The body
   cell registers itself on context (`setScrollContainer`). Scroll-driven code
   reads `shell.scrollContainer` and never `window.scrollY` / default-root IO.
   The secondary rule holds: scrollspy uses a `scroll` listener on the body cell,
   IO is confined to LazyContent lazy-loading.

2. **Breadcrumb chain is a pure function of the URL pathname** (Hard Rule #7).
   `findActiveChain` over `config.pages` + `useDynamicPages` registrations by
   longest-prefix, descending via `subPages`. Nothing else feeds it. An in-page
   primitive (PageSections `?<key>=`) can never add a crumb. A crumb appears only
   if a `subPages` entry or a `useDynamicPages` registration registers that URL
   level. `<ShellPageHeader title=…>` overrides only the leaf label, never adds a
   level.

3. **PageSections URL↔state sync via router primitives only** (Hard Rule #5).
   Read `search` from the router (`useRouterState`/`useSearch`), write via
   `navigate({ …, replace: true })`. **Never** `window.history.replaceState`
   (the router wouldn't observe it; the read-side effect would see stale search
   forever). The untrack guard → drop `activeId` from the URL→state effect deps
   and read it via a ref. The write effect is edge-triggered (skip the first
   activeId) so mount-time writes can't cancel an in-flight cross-page nav.

4. **Three navigation layers, never substituted** (Hard Rule #6). Sidebar items
   (`config.pages`, top-level features) / `subPages` (sibling pages within a
   feature, the title dropdown) / page tabs (`PageTabs` route-per-tab or
   `PageSections` in-page `?<key>=`). The discriminator stays the breadcrumb:
   "should selecting this gain a crumb?" yes → a route (`subPages`/nested), no →
   in-page. A list of articles/docs is **peer routes**, not `PageSections` tabs.

5. **PageSection.children stays a thunk** (`() => ReactNode`). The hydration half
   of Hard Rule #4 is moot (no SSR), but the lazy-mount half holds: single mode
   mounts only the active section; thunk defers element creation per branch.

6. **PageSections scrolls the body cell, sticky tab strip** (Hard Rule #4b).
   PageSections owns no inner scroll container; it renders in normal flow inside
   the body cell, pins its strip with `position:sticky; top:0`, and scrolls
   `shell.scrollContainer` for scrollspy/click/deep-link, offsetting by the
   strip height. The container is resolved **reactively** (the body-cell ref can
   arrive after PageSections mounts — an effect keyed on `shell.scrollContainer`,
   not a once-on-mount read). The LazyContent IO root is the body cell, resolved
   reactively, with a wait-for-container guard (Hard Rule #4a) — a premature
   `root: null` + `rootMargin: 200px` mounts every section at once.

### Go moot (SPA / React / Radix simplifications)

| SolidJS rule / scar | Why it disappears in the port |
|---|---|
| **Hard Rule #3** — manual closed→open `activeElement.blur()` before Kobalte `hideOutside` (aria-hidden focus retention) | Radix Dialog manages focus scope + aria-hidden itself; the controlled-open mobile drawer doesn't leave the trigger focused inside an aria-hidden subtree. Drop the workaround. (Verify once with the console open.) |
| **Hard Rule #4, hydration half** — eager JSX in `sections[]` crashes the hydration walker (`template2 is not a function`) | No SSR, no hydration walker. The thunk stays for the lazy-mount reason, not the crash reason. |
| **Thunked slot props** (`subtitle`, `titleAdornment`, `actions[]`, `footer`, `tabs`) "for hydration safety" | The hydration-key-divergence rationale is SSR-only. Thunks are still used — but now purely to **defer evaluation to the slot's render position** (so an action that reads context evaluates inside the shell). Keep the thunk shape; drop the "hydration safety" justification from docstrings. |
| **`isServer` guards** (the `matchMedia` effect, the Modal blur effect) | SPA — code always runs client-side. No `isServer` import, no guards. |
| **`createComputed` in useDynamicPages** (synchronous, SSR-correct registration) | Existed to register during SSR render to avoid a mismatch. A plain `useEffect` is correct in SPA; the chain fills on the first paint cycle. |
| **`<Title>` centralized at AppShell** (`@solidjs/meta` dispose-race) | No `@solidjs/meta`. `document.title` is written in a `useEffect`; there is no meta-tag add/remove lifecycle, so no dispose-race. Keep AppShell as the single title owner (clean ownership), but the mechanism is a one-line effect. |
| **Portal-returns-empty-string-on-SSR** caveat for ShellPageHeader registration | No SSR. The chrome renders on the first/only client render after the registration effect commits. |
| **`pnpm-workspace.yaml onlyBuiltDependencies`** typecheck gotcha (vinxi/SolidStart) | my-react-shell is Vite-SPA; the `@parcel/watcher`/`esbuild` pre-run abort is a vinxi-only issue. N/A. |

---

## 7. Suggested build order (with dependency notes)

Build leaf-first so each file's dependencies already exist and typecheck as you go.

1. **`shellContract.ts`** — pure types, no deps. Everything imports from here.
2. **`app-shell.css`** — author the full class list (§3) up front so components
   reference stable names. No code dep; just needs the token names (verified).
3. **`shellContext.ts`** — depends on `shellContract` types only. Defines the
   context + the two hooks.
4. **`defineShellConfig.ts`** — depends on `shellContract`. Self-contained
   validator. Unit-testable in isolation (port the SolidJS `defineShellConfig.test`
   shape, minus notification cases) — good early confidence.
5. **`pageSections/scrollspy.ts`** — zero deps (pure DOM glue). Port verbatim.
6. **`pageSections/types.ts`** — depends on nothing but `react` types.
7. **`pageSections/modes.tsx`** — depends on `types`, `scrollspy` (indirectly
   via PageSections), `shellContext` (for the optional shell in LazyContent /
   SectionTabsStrip), and the config's `renderIcon` (via `useShellContextOptional`).
   The `mrs-tab-row` / `mrs-section*` classes from step 2.
8. **`PageSections.tsx`** — depends on `modes`, `scrollspy`, `types`,
   `shellContext`, router (`useRouterState`/`useNavigate`). The hardest file —
   build after its parts (5–7) exist. Verify URL↔state + scrollspy in a harness.
9. **`PageTabs.tsx`** — depends on `shellContext`, router, `mrs-tab-row`. Small.
10. **`ShellPageHeader.tsx`** — depends on `shellContract`, `shellContext`,
    router (pathname + navigate), Radix DropdownMenu (LeafDropdown). Exports
    `findActiveChain` (also consumed by AppShell's title resolver), so build
    before AppShell.
11. **`useDynamicPages.ts`** — depends on `shellContext`. Small; build before/with
    ShellPageHeader since the chain merges its registrations (but no compile dep).
12. **`AppHeader.tsx`** — depends on `shellContext` (optional), router (`Link`),
    `mrs-app-header*`.
13. **`AppMenu.tsx`** — depends on `shellContext`, router (`Link` + pathname),
    `mrs-app-menu*`.
14. **`AppBottomNav.tsx`** — depends on `shellContext`, router, `mrs-bottom-nav*`.
15. **`AppShell.tsx`** — depends on everything above (`AppHeader`, `AppMenu`,
    `AppBottomNav`, `ShellPageHeaderUI` + `findActiveChain`, `shellContext`,
    `defineShellConfig` brand, Radix Dialog drawer, router). Build last.
16. **`index.ts`** — the barrel; add the `./app-shell` export entry to
    package.json + the CSS import. Build last; verify the consumer-facing surface.

**Cross-file dependency notes:**
- `findActiveChain` lives in `ShellPageHeader.tsx` and is imported by `AppShell.tsx`
  (document title) — same as SolidJS. Don't duplicate it.
- `shell.scrollContainer` is a **state value**; PageSections' scrollspy effect and
  LazyContent's IO both depend on it in their effect deps so they re-run when the
  body-cell ref resolves. Get the deps right or you reintroduce the
  "never-attaches" / "all-mount-at-once" regressions.
- The `renderIcon` config field threads to every component that draws an icon —
  pass it via context (`shell.config.renderIcon`), not a prop, so deep
  sub-renderers (Breadcrumbs, LeafDropdown, section headers) reach it without
  prop-drilling.
- After the module typechecks, write a `docs/guides/app-shell.md` (per the
  "every module ships a guide" convention) documenting the contract + the
  preserved behavior rules — but that's a follow-up, not part of this blueprint.

---

## Appendix — open implementation flags

- **CSS asset in `dist`:** confirm the `prepare` (`tsc -p tsconfig.lib.json`)
  ships `app-shell.css`. tsc alone emits JS, not raw CSS assets. Options: (a)
  list `src/app-shell/app-shell.css` in package.json `files` and `import
  './app-shell.css'` from the barrel (the consumer's bundler resolves it through
  the JS import graph); (b) fold the classes into the existing `src/styles/`
  aggregate exposed at `my-react-shell/styles.css`. (a) keeps the module
  self-contained; prefer it, verify the import resolves from `dist/`.
- **`renderIcon` default:** consider shipping a no-op/placeholder that renders the
  key as text in DEV so a missing renderer is visible, but keep it required in the
  type (the SolidJS shell hard-depended on an icon kit; this module externalizes
  it cleanly).
- **Radix aria-hidden verification:** the one behavior to confirm empirically
  (open drawer from focused hamburger, watch console) before declaring Hard Rule
  #3 moot. Everything else is a structural port.
