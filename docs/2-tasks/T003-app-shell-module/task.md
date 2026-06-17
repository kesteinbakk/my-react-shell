# T003 — app-shell module (React port of the foundation shell)

- **Status:** in-progress
- **Filed:** 2026-06-17
- **Working branch:** `main` (no worktree — single new module dir `src/app-shell/`, no parallel mutation)
- **Origin:** approved proposal [`app-shell-module.md`](../../1-proposals/app-shell-module.md); strategy [D10](../../strategy.md)
- **Depends on:** T1 (theme tokens, module pattern). **Sequenced after** the i18n module.

## Goal

Ship an **optional `app-shell` module** at the sub-path `my-react-shell/app-shell` —
a React (SPA) re-implementation of the SolidJS `foundation` app shell. Same
architecture and behavior contracts as foundation; fresh implementation on this
stack (React 19 + TanStack Router + Radix), with the SSR/hydration class of
complexity dropped (SPA-only, D2).

## Scope

Carry over, modeled on foundation `src/shell/`:

- **Shell chrome** — `AppShell` (header-mode **or** sidebar-menu-mode orchestration,
  responsive mobile drawer + optional bottom nav, the single scrolling body cell
  `[data-shell-content]` with pinned chrome), `AppHeader`, `AppMenu`, `AppBottomNav`,
  the shell context (config + scroll container + page-header registration + dynamic
  pages).
- **Page chrome** — `ShellPageHeader` (URL-derived breadcrumbs, page actions, search
  slot, pinned tabs slot, `subPages` title dropdown). Registration component: renders
  into AppShell's pinned slot.
- **Config** — `defineShellConfig` (app name, pages tree, the three navigation
  layers) + `useDynamicPages` (runtime page registration for dynamic route levels).
- **Page tabs** — `PageSections` (in-page `?<persistKey>=`, modes single /
  list-with-scrollspy / collapsible) and `PageTabs` (route-based; pinned via
  `ShellPageHeader`).

**Excluded** (app-specific glue, not shell): notification system, feedback modal,
command-bar / action registry. A consumer wires its own into the page-header actions.

## Standing decisions (from the proposal / D10 — do NOT re-litigate)

1. **Router = optional peer.** TanStack Router behind the `my-react-shell/app-shell`
   sub-path (amends D2). Already a devDep for the harness; add to optional peers.
2. **Radix headless primitives** for Sheet/Drawer (Dialog), DropdownMenu, Popover —
   optional peers + devDeps (so harness + lib build compile).
3. **Strings via config/props.** No hard import of the i18n module; consumer
   translates at the call site.
4. **Breadcrumb is a pure function of the URL pathname** (foundation Hard Rule #7) —
   derived from the TanStack Router location against the shell config's pages tree.
   An in-page primitive (`PageSections`) never adds a crumb.

## Plan (phases — each a commit point)

| Phase | Scope |
|-------|-------|
| 0 | Docs + deps: strategy D10 / concept (done), this task, install Radix + promote router to optional peer. |
| 1 | Spec: port blueprint from foundation `src/shell/` (app-shell expert) — file list, props, behavior, the responsive + scroll-container + breadcrumb contracts on TanStack Router. |
| 2 | Core: shell context + `defineShellConfig` + types (the shared spine the rest builds on). |
| 3 | Chrome: `AppShell` + `AppHeader` + `AppMenu` + `AppBottomNav` (responsive header/menu/drawer/bottom-nav, body-cell scroll container). |
| 4 | Page header: `ShellPageHeader` (breadcrumbs + actions + search + tabs slot + subPages dropdown) + `useDynamicPages`. |
| 5 | Page tabs: `PageSections` (3 modes, scrollspy, `?tab=` sync) + `PageTabs`. |
| 6 | Packaging: `exports['./app-shell']`, optional peers; barrel/comment. Guide `docs/guides/app-shell.md`. Harness playground routes (deferred if a dev run is needed to regen the route tree). |

## Verification

`tsc -b` typecheck + `pnpm build:lib` (emits `dist/app-shell/`). Behavior
(responsive, scroll-container, deep-link, breadcrumb) is only fully catchable
in-browser via the harness playgrounds — that run is **user-owned** (dev servers),
so it is the gate the owner runs, like T002's live check. Pure helpers (breadcrumb
chain derivation, flatten/scroll math) get ephemeral node checks where possible.

## Exit criteria

- A consumer installs the sub-path's optional peers, wraps its TanStack Router in
  `<AppShell>` with a `defineShellConfig`, and gets responsive header/menu chrome, a
  URL-derived breadcrumb page header, and the page-tab primitives — all rendering
  against the theme token contract, strings supplied via config/props.
- `docs/guides/app-shell.md` documents the config contract, the three nav layers, the
  breadcrumb-is-the-URL invariant, wiring, and BYO.
- Barrel stays theme-only; theme-only consumers install no router and no Radix.

## Implementation status

| Phase | Status | Summary |
|-------|--------|---------|
| 0 docs + deps | in-progress | strategy D10 + concept done; deps next. |
| 1 spec | — | |
| 2 core | — | |
| 3 chrome | — | |
| 4 page header | — | |
| 5 page tabs | — | |
| 6 packaging + guide | — | |
