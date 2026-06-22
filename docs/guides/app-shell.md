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
  ShellPageHeader,
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
`renderIcon` is **required**. Optional config-root fields: `appNameRender`, `pageContainer.defaultMaxWidth`
(default `'2xl'`), `tabs.variant` (`'underline'` | `'pill'`), `shellPageHeader.border`
(default `true`) / `.documentTitle` / `.breadcrumbCollapse` (breadcrumb middle-collapse
— see below), and `labels` (translated aria-label thunks — `home`, `breadcrumb`,
`openMenu`, `mainNavigation`, `more`; English fallbacks apply).

Optional per-`PageEntry` fields: `subPages` (nested entries — each becomes a breadcrumb level and a title-dropdown item), `groupBreak: true` (draws a divider above the entry in the sidebar — ignored on the first visible page), and `tabBar: true` (opts the top-level entry into the mobile bottom tab bar — only when `AppShell mobileNav='tabBar'`).

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

Drop `<ShellPageHeader>` anywhere in a route's subtree. It renders `null` and registers
its props onto the shell, which renders the chrome in the pinned slot:

```tsx
<ShellPageHeader
  title={() => t('data.title')}            // overrides only the leaf breadcrumb label
  actions={[() => <NewItemButton />]}
  search={{ onChange: setQuery, placeholder: () => t('common.search') }}
  tabs={() => <PageTabs tabs={dataTabs} />} // pins a route-tab strip with the breadcrumbs
/>
```

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

- **`PageTabs`** — each tab is its own route. Pin it via `<ShellPageHeader tabs={() =>
  <PageTabs tabs={…} />}>`. Selecting a tab navigates; the breadcrumb can move.
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
