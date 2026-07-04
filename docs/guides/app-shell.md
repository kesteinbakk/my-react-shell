# app-shell module

A React (SPA) re-implementation of the SolidJS `foundation` app shell: header-or-
sidebar chrome with a responsive mobile drawer + optional bottom nav and a single
scrolling body cell, a URL-derived page header (breadcrumbs + actions + search +
`subPages` dropdown), the shell-config contract (the three navigation layers), and
the page-tab primitives. Shipped at the sub-path **`my-react-shell/app-shell`** so the
package barrel stays the theme core.

```ts
import {
  AppShell,
  usePageHeader,
  PageTabs,
  PageSections,
  useDynamicPages,
  defineShellConfig,
} from 'my-react-shell/app-shell'
import 'my-react-shell/app-shell/styles.css'
```

It is **router-coupled** (TanStack Router) and uses **Radix** headless primitives —
both are *optional peers* you install only when you import this module. It renders
against the theme token contract, and every user-facing string comes via config/props
(it never imports the i18n module — you translate at the call site).

## Optional peers

```bash
pnpm add @tanstack/react-router @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

A theme-only consumer installs none of these.

## Define the shell config

`defineShellConfig` validates the config once at import time (throwing
`ShellConfigError` on a bad shape) and brands it — `<AppShell>` re-checks the brand
at runtime. The icon library is yours: pass one `renderIcon(key, size)`.

```tsx
import { defineShellConfig } from 'my-react-shell/app-shell'
import { Home, Database, Shield } from 'lucide-react'

// The shell internally requests keys: 'menu', 'home', 'arrowUp', 'chevronRight', 'chevronDown', 'search', 'alert'
const icons: Record<string, typeof Home> = { home: Home, data: Database, trust: Shield }

export const shellConfig = defineShellConfig({
  appName: 'Acme',
  renderIcon: (key, size) => {
    const Icon = icons[key] ?? Home
    return <Icon size={size} />
  },
  pages: [
    {
      id: 'data',
      route: '/data',
      label: () => t('nav.data'),
      icon: 'data',
      // each subPage adds a breadcrumb level; at the leaf a sibling-switcher dropdown appears
      subPages: [
        {
          id: 'data-core',
          route: '/data/core',
          label: () => t('nav.core'),
          icon: 'data',
          // subPages nest arbitrarily — this adds a third crumb level under /data/core
          subPages: [
            { id: 'data-core-items', route: '/data/core/items', label: () => t('nav.items'), icon: 'data' },
            { id: 'data-core-archive', route: '/data/core/archive', label: () => t('nav.archive'), icon: 'data' },
          ],
        },
        { id: 'data-media', route: '/data/media', label: () => t('nav.media'), icon: 'data' },
      ],
    },
    { id: 'trust', route: '/trust', label: () => t('nav.trust'), icon: 'trust', tabBar: true },
  ],
})
```

**`route: '/'` is reserved.** The home route is never a page entry — it is always
reachable via the brand link and the breadcrumb house icon, and adding it to `pages`
throws a `ShellConfigError` at import time. Start your first page at a real feature
route (e.g. `/dashboard`, `/data`).

`label` is a thunk so you can wire `t()` and have it re-evaluate on locale change.
`renderIcon` is **required**.

#### Optional config-root fields

| Field | Values | Default | Effect |
|---|---|---|---|
| `appNameRender` | `() => ReactNode` | the `appName` text | Custom wordmark/brand node for the header brand area, in place of the plain app-name text. |
| `pageContainer.defaultMaxWidth` | `narrow` (1024px) · `medium` (1280px) · `wide` (1440px - exactly fits four 312px cards) · `x-wide` (1600px) · `full` | `x-wide` | Max width of the centered page-content container (`full` = edge-to-edge). |
| `tabs.variant` | `underline` · `pill` | `underline` | Visual style of `PageTabs` and the `PageSections` tab strip. |
| `shellPageHeader.border` | `boolean` | `true` | Whether the header band draws a bottom border. |
| `shellPageHeader.documentTitle` | `composed` · `leaf` · `app` | `composed` | Project-wide browser-tab title mode — see [Document title](#document-title-browser-tab). |
| `shellPageHeader.breadcrumbCollapse` | `{ leading?, trailing? }` · `false` | `{ leading: 1, trailing: 2 }` | Breadcrumb middle-collapse — see [Overflow](#overflow-the-trail-never-breaks). |
| `labels` | aria-label thunks: `home`, `up`, `breadcrumb`, `openMenu`, `mainNavigation`, `more`, `scrollTabsLeft`, `scrollTabsRight` | none (no language default) | Translated accessible names for the chrome. Each is optional with **no default** — omit one and that control is unnamed (an icon / landmark with no language), never an English fallback. Pass them for accessible chrome. |
| `appMode` | `{ modes, label, defaultMode?, ariaLabel?, visible?, selectable? }` | none (no app-mode surface) | A single-select **app-mode** control under the app title — see [App mode](#app-mode-a-global-what-mode-is-the-app-in). |

#### Optional per-`PageEntry` fields

| Field | Type | Effect |
|---|---|---|
| `subPages` | `PageEntry[]` | Nested entries — each becomes a breadcrumb level and a title-dropdown sibling. Recursive (nests arbitrarily deep). |
| `groupBreak` | `true` | Draws a sidebar divider above this entry (ignored on the first visible page). |
| `tabBar` | `true` | Opts a top-level entry into the mobile bottom tab bar (only when `AppShell mobileNav='tabBar'`). |
| `hideCrumb` | `() => boolean` | Reactive predicate — omit this level from the rendered trail while keeping it in the chain. See [Hiding an access-gated crumb](#hiding-an-access-gated-crumb). |
| `disableCrumbLink` | `() => boolean` | Reactive predicate — render this ancestor as a plain label instead of a clickable link. The crumb still appears; it simply has no click target. Use for structural parents that have no meaningful page of their own. No effect on the leaf. |

#### A nav-less, card-dashboard app

`pages` may be **empty**. A dashboard-style app whose home is a grid of cards — and
which navigates via those cards plus breadcrumbs rather than a fixed sidebar — passes
`pages: []`: the sidebar/banner then renders no nav entries, while the automatic
breadcrumb band, `usePageHeader`, and `useDynamicPages` all keep working. Combined with
the reserved `'/'` route (home is always the brand link + house icon), this is the
supported "no sidebar nav" shape. Register feature routes under real paths as they
appear.

## Mount the shell

Wrap your router outlet in `<AppShell>` once at the root. `useMenu` picks sidebar
(`true`) vs top banner (`false`). `actions` is your chrome action row (theme toggle,
language picker, notification bell — your components, as render thunks).

```tsx
import { AppShell } from 'my-react-shell/app-shell'

function RootLayout() {
  return (
    <AppShell
      config={shellConfig}
      useMenu
      actions={[() => <ThemeToggle />, () => <LanguagePicker />]}
      mobileNav="drawer" // or 'tabBar' for a mobile bottom bar
    >
      <Outlet />
    </AppShell>
  )
}
```

Only the body cell scrolls (`[data-shell-content]`) — the chrome, sidebar, and footer
stay pinned. On mobile the sidebar collapses to a Radix drawer (or a bottom tab bar of
the `tabBar: true` pages when `mobileNav='tabBar'`).

## Menu size (header-chrome size)

An opt-in display/accessibility preference that sizes the shell's **header chrome** —
the page-header band (breadcrumbs + action buttons + search) and the top-header
(`AppHeader`) action cluster — across three steps: `medium` (normal), `large` (~1.375×) and
`xlarge` (~1.75×), always leaving the app **title/brand** at its normal size. It changes no
data and no routing.

Mount `<MenuSizeProvider>` above the shell (mirrors `<IconModeProvider>`): uncontrolled it
seeds from and persists to `localStorage` (`defaultSize` is `'medium'`, so it is normal by
default); pass `value` + `onChange` to own the state yourself (e.g. a per-user preference).
`<AppShell>` reads it **softly** via `useMenuSizeOptional()` — with no provider mounted the
shell simply renders at `medium`, so a standalone consumer is unaffected. Give users the
control by feeding `useMenuSize()` into `<UserPreferences>`'s `menuSize` /
`onMenuSizeChange` (the built-in **Display** section).

```tsx
import { MenuSizeProvider, useMenuSize } from 'my-react-shell/app-shell'

// above the router / shell:
<MenuSizeProvider>{/* … <AppShell> … */}</MenuSizeProvider>

// in your preferences control:
const { menuSize, setMenuSize } = useMenuSize()
<UserPreferences /* … */ menuSize={menuSize} onMenuSizeChange={setMenuSize} />
```

Mechanically, `<AppShell>` sets `data-menu-size` (`medium`·`large`·`xlarge`) on its root, and
for `large`/`xlarge` app-shell.css scales the two chrome regions with `zoom` (so
heterogeneous fixed-px icons, text, and spacing scale uniformly and stay aligned). Tune each
step with the `--mrs-menu-scale-large` (default `1.375`) / `--mrs-menu-scale-xlarge`
(default `1.75`) CSS vars.

## App mode (a global "what mode is the app in")

An opt-in single-select control the shell renders in **its own section directly under the
app title** — the band beneath `AppHeader` in header mode, and between the sidebar brand
head and the nav in menu mode. It answers "what mode/stage is the app in" (e.g. `Setup →
Main → Finalize`) as a **global** value any component can read via `useAppMode()`, and any
component can set — from **end-user selection** *or* from **data** (a role/data effect
calling `setAppMode`, or a data-driven default).

Declare only the static parts in the shell config's `appMode` block; the live value and the
visibility/selectability flags are runtime state:

```tsx
// your own constants — the mode values are yours, the shell just switches between them
const MODES = { setup: 'SETUP', main: 'MAIN', finalize: 'FINALIZE' } as const
type AppMode = (typeof MODES)[keyof typeof MODES]

export const shellConfig = defineShellConfig({
  appName: 'Acme',
  renderIcon,
  pages: [/* … */],
  appMode: {
    modes: Object.values(MODES),          // ordered; the control shows once ≥ 2 are available
    label: (m) => t(`mode.${m}`),         // CONTENT — a mandatory, consumer-translated label per mode
    defaultMode: MODES.setup,             // optional; else modes[0]
    ariaLabel: () => t('mode.aria'),      // optional thunk (the module never imports i18n)
    // visible / selectable default true; override here or at runtime
  },
})
```

Read and drive it anywhere under `<AppShell>` — pass your union for exhaustive typing:

```tsx
const { appMode, setAppMode, modes, setModes, visible, setVisible, selectable, setSelectable } =
  useAppMode<AppMode>()

// data-driven default (instead of / before end-user selection):
useEffect(() => { setAppMode(deriveFromData(record)) }, [record])

// show it read-only (visible, not changeable): setSelectable(false)  → the control greys to an indicator
// hide it entirely:                            setVisible(false)      → no control; `appMode` still readable
// narrow by role at runtime:                   setModes(allowedForRole)  → auto-hides when ≤ 1 remains
```

**Visibility rules the shell enforces:** the control renders **only** when `visible` is true
**and** two or more `modes` are available — a single effective choice (e.g. after a role
narrows the set) shows nothing, matching "if there's only one option, don't show a switcher."
`selectable: false` keeps it visible but non-interactive (a status indicator). In every
hidden/one-choice case `appMode` is still readable via `useAppMode()`.

`useAppMode()` throws if the config declares no `appMode` block; use `useAppModeOptional()` (→
`null`) in a component that may run in an app without an app-mode. The control is built on the
kit `SegmentedControl`, so it inherits the shipped look (full-width, small size in the narrow
sidebar; natural size in the header band).

## Not-found (404)

404 handling is **router config, not a shell prop** — and the router is yours, so the
shell can neither own it nor inject it. Catch an unmatched URL where you create the
router, rendering the kit's `EmptyState` as the body:

```tsx
import { createRouter, Link } from '@tanstack/react-router'
import { EmptyState } from 'my-react-shell/components'

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <EmptyState
      title={t('notFound.title')}
      description={t('notFound.body')}
      action={<Link to="/">{t('notFound.home')}</Link>}
    />
  ),
})
```

Because the not-found renders **inside the root route** — the one that mounts
`<AppShell>` — it keeps the shell chrome: the sidebar/header stay pinned and only the
body cell swaps to the 404. Scope it to one subtree instead with `notFoundComponent`
on that route, or throw `notFound()` from a loader when an id resolves to nothing.

> **Two different 404s.** The above is the *in-app* not-found — an unmatched route in
> the already-loaded SPA. A hard refresh or deep link on an unknown path is a *server*
> 404: the static host must rewrite `/(.*)` → `/index.html` (e.g. in `vercel.json`) so
> the SPA boots at all. Wire both — the shell owns neither.

## The page header

The breadcrumb band renders **automatically** — whenever the current URL resolves to a
breadcrumb chain, the band appears with no work from the page. A page calls
`usePageHeader(...)` only to **add chrome** on top of the band:

```tsx
usePageHeader({
  title: () => t('data.title'),             // overrides only the leaf breadcrumb label
  actions: [() => <NewItemButton />],
  search: { onChange: setQuery, placeholder: () => t('common.search') },
  tabs: () => <PageTabs tabs={dataTabs} />, // pins a route-tab strip under the breadcrumbs
})
```

Stable thunks (`useCallback` / `useMemo` / module-level) are nice but not required — the
hook updates the band **in place** on every change, so inline thunks (`actions: [() =>
<Btn/>]`) are fine and never cause flicker.

An `ActionButton` in the `actions` slot always renders **inline** (glyph before label):
the band's stylesheet overrides its `layout` prop, since the kit default `vertical`
would stack the label under the glyph and blow out the band height. A stacked
header-band action is therefore impossible; icon-only actions are unaffected.

**A layout can own the band; a leaf can add to it.** Because the band is automatic, a
layout that just wants breadcrumbs present mounts nothing — it only registers crumbs (via
`subPages` / `useDynamicPages`). A leaf that needs page chrome calls `usePageHeader`. When
**both** are active (a layout-level band + a leaf's actions), the **deepest-mounted call
wins** and its chrome shows — deterministically, never flipping when either re-renders.
There is no "mount exactly one" rule: layering a leaf's chrome over a layout band is the
supported pattern.

**The breadcrumb chain is a pure function of the URL pathname.** It is built by walking
the config `pages` tree (plus any `useDynamicPages` registrations) against the current
path. Nothing else feeds it — an in-page primitive can never add a crumb, and
`title` overrides only the leaf label, never adds a level. Want a crumb for X → X must
be a route registered in the config (`subPages`) or via `useDynamicPages`.

For dynamic route levels (a record name, a doc slug), register them at runtime:

```tsx
useDynamicPages({
  parent: '/sites',
  items: sites.map((s) => ({ id: s.id, label: s.name, route: `/sites/${s.id}` })),
})
```

### Document title (browser tab)

The shell owns `document.title` and keeps it in sync with the active route — a single
owner, so pages never set it themselves. The composition mode is set project-wide via
`shellPageHeader.documentTitle` and overridden per route via
`usePageHeader({ documentTitle })`:

| Mode | `document.title` |
|---|---|
| `composed` (default) | leaf label `·` app name — e.g. `Items · Acme`. On the home route (no leaf) it falls back to just the app name. |
| `leaf` | the leaf label only — e.g. `Items`. |
| `app` | the app name only — e.g. `Acme`. |

For a fully bespoke title (e.g. a dynamic record name), pass a **resolver** instead of a
mode — `usePageHeader` accepts `documentTitle: () => string`:

```tsx
usePageHeader({ documentTitle: () => invoice.name }) // tab shows "Invoice #42"
```

### Hiding an access-gated crumb

Sometimes a route segment exists structurally but isn't somewhere a given user can go —
they can open `/company/item/leaf` but not the bare `/company` page. Set `hideCrumb` on
that level's `PageEntry` to **omit it from the trail** while keeping it in the chain (the
URL is unchanged and its descendants stay navigable):

```tsx
useDynamicPages({
  parent: '/company',
  items: [
    { id: 'item', label: () => name, route: '/company/item',
      hideCrumb: () => !canAccess('/company') },
  ],
})
// Renders 🏠 › item › leaf instead of 🏠 › company › item › leaf — no dead
// "company" crumb that would error on click for a user who can't open it.
```

`hideCrumb` is a reactive predicate **you** supply (the shell never imports your roles).
The **leaf (current page) is never hidden**, so the trail can't go empty. It works on
static `pages` / `subPages` entries too.

## The three navigation layers

Each layer has one job — don't substitute one for another:

| Layer | Surface | Use for |
|---|---|---|
| `pages` (sidebar / banner) | Persistent sidebar items | Top-level feature areas. |
| `subPages` | Each level adds a breadcrumb crumb; a sibling-switcher dropdown appears at the leaf | Hierarchical sub-areas within a feature. Nests arbitrarily deep. |
| `PageTabs` / `PageSections` | Tab strip below the title | Sub-views of one page. |

The discriminator is the breadcrumb: *should selecting this gain a crumb / a shareable
URL / a back-button stop?* Yes → a route (`subPages` or a nested route). No → in-page
(`PageSections`). A list of articles/records is **peer routes**, not `PageSections`
tabs.

### Multilevel pages (subPages of subPages)

`subPages` is recursive — a sub-page can itself carry `subPages`, creating a 3+ level
breadcrumb chain. The shell walks the tree on every navigation and builds the chain by
longest-prefix match at each depth:

```
🏠  ›  Data  ›  Core  ›  Items ▾
        link    link    leaf dropdown
```

- **Non-leaf ancestors** render as clickable links back up the chain.
- **The leaf** renders as plain text when there is one option at that depth, or as a
  sibling-switcher dropdown when there are two or more (e.g. switching between
  `/data/core/items` and `/data/core/archive` without going up a level).
- **A crumb appears only for registered routes.** Every route that should appear in the
  chain must be in the config tree (`pages` / `subPages`) or added at runtime via
  `useDynamicPages`. Unregistered paths fall through to the nearest matching ancestor.

**An "up one level" arrow sits next to the house icon.** It links to the previous
visible crumb's route (home when the current page is top-level), letting a user step
back up the chain without targeting a specific crumb. It's hidden on the home route
itself, where there is no level above. Uses the `arrowUp` icon key and the
`labels.up` accessible name.

#### Overflow: the trail never breaks

The band stays on **one line** no matter how deep the chain or how long a label
(dynamic record names — a project name, a long task title — can land at *any* level):

- **Every crumb is width-capped and ellipsizes.** Home icon, chevrons, and the leaf's
  dropdown caret never compress; only label text gives up width. Hovering a clipped
  crumb shows its full text (native `title`). Tune the cap per app with the
  `--mrs-breadcrumb-label-max` CSS variable (default `14rem`):

  ```css
  .mrs-breadcrumbs { --mrs-breadcrumb-label-max: 18rem; }
  ```

- **The middle collapses when the chain is deep.** With more than `leading + trailing`
  levels, the trail renders the first `leading` crumbs, a `…` overflow button (a
  dropdown listing the hidden ancestors, each a link back up the chain), then the last
  `trailing`:

  ```
  🏠  ›  Ikomm  ›  …  ›  Bestilling  ›  BE-05: Å få varsel per epost…
  ```

  Configure via `shellPageHeader.breadcrumbCollapse` — default
  `{ leading: 1, trailing: 2 }`. `trailing` clamps to ≥ 1 (the leaf is always shown),
  `leading` to ≥ 0. Pass `false` to disable the collapse (per-crumb truncation still
  applies). The `…` dropdown's aria-label comes from `labels.more`.

  ```ts
  defineShellConfig({
    // …
    shellPageHeader: { breadcrumbCollapse: { leading: 2, trailing: 3 } },
  })
  ```

`useDynamicPages` works at any depth — set `parent` to the ancestor route it hangs off:

```tsx
// Adds: 🏠 › Data › Core › Items › "Invoice #42"
useDynamicPages({
  parent: '/data/core/items',
  items: invoices.map((inv) => ({ id: inv.id, label: inv.name, route: `/data/core/items/${inv.id}` })),
})
```

> **Demonstrated end-to-end** in the `my-react-shell-demo` nested-pages route
> (`src/pages/nested/`): a four-level breadcrumb chain — `pages` → `subPages`
> (regions) → `subPages` (countries) → `useDynamicPages` (cities), with a
> sibling-switcher dropdown at each level.

## Page tabs: route-based vs in-page

- **`PageTabs`** — each tab is its own route. Pin it via `usePageHeader({ tabs: () =>
  <PageTabs tabs={…} /> })`. Selecting a tab navigates; the breadcrumb can move.
- **`PageSections`** — splits one page into in-page sections synced to `?<persistKey>=`
  (deep-linkable, shareable). Modes: `single` (one section at a time) or `list`
  (scrollspy + click-to-scroll over the body cell; sections may be `lazy`). Section
  `children` is a thunk so only the active/visible section mounts.

```tsx
<PageSections
  persistKey="tab"
  mode="single"
  sections={[
    { id: 'overview', label: () => t('overview'), children: () => <Overview /> },
    { id: 'activity', label: () => t('activity'), children: () => <Activity /> },
  ]}
/>
```

## Notes

- **Strings via config/props, no i18n dependency.** The shell never imports the i18n
  module. Feed it translated thunks (`label: () => t('…')`); when you use
  `my-react-shell/i18n`, wire `t` at the call site.
- **Excluded by design** (app-glue, not shell): the notification system, feedback
  modal, and command-bar/action registry. Wire your own into the `actions` slot.
- **Scroll-aware code** must read the shell's scroll container (`useShellContext().
  scrollContainer`), not `window` — the body cell is the only scroller.
- **Tab strips scroll horizontally on overflow.** Both `PageTabs` and the
  `PageSections` section-tab strip wrap their row in a horizontal scroll container
  (hidden scrollbar) with edge-fade gradients and arrow buttons that appear only on
  the side(s) holding hidden tabs — so a long tab list stays usable on narrow
  viewports instead of overflowing the page. No configuration; it engages automatically.
- **The page-header `search` slot is seed-once.** Its `initialValue` sets the input's
  starting text; the input is then self-managed and won't re-sync if `initialValue`
  changes after mount. Drive your query state from the `onChange` callback.
