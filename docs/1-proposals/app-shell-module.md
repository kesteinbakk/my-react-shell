# Proposal: app-shell module (React port of foundation's app shell)

**Date**: 2026-06-16 | **Status**: approved — sequenced **after** the i18n module (becomes T003 when picked up)

## What

Add an optional **`app-shell`** module to my-react-shell — a React (SPA)
re-implementation of the SolidJS `foundation` app shell: header-or-sidebar chrome
with a responsive mobile drawer + optional bottom nav, a single scrolling body cell,
a page header (breadcrumbs + actions + search), a shell-config contract with the
three navigation layers, and the page-tab primitives (`PageSections` in-page `?tab=`
+ route-based `PageTabs`). Excludes the app-specific glue (notification system,
feedback modal, command-bar/action registry).

## Why

my-react-shell deliberately shipped **no** app-shell (concept "What it is NOT";
strategy D8 *deferred* it as a possible later module). The owner now wants the shell
as a real capability, so a consumer app gets a foundation-grade, responsive page
chrome out of the box instead of rebuilding navbar / menu / breadcrumbs / tabs per
app. The SolidJS `foundation` shell is the proven model; this brings it to the React
era as one more opt-in module — and, being SPA-only, drops the whole SSR/hydration
class of complexity that scars the Solid original.

## User Goals

- A consumer imports the shell from a sub-path, feeds it a config (app name, pages
  tree, nav items), wraps its own router, and gets:
  - **Header mode or sidebar-menu mode**, responsive: the sidebar collapses to a
    mobile drawer; an optional mobile bottom nav; only the body cell scrolls while
    the chrome stays pinned.
  - A **page header**: breadcrumbs derived purely from the URL, page actions, an
    optional search slot, an optional pinned tabs slot, and a `subPages` title
    dropdown for sibling pages.
  - **Three distinct navigation layers** — sidebar (top-level features), `subPages`
    dropdown (sibling pages), tabs (sub-views of one page) — each with its documented
    purpose, so apps don't bolt one onto the wrong layer.
  - **Page tabs**: in-page `?tab=` sections (single / list-with-scrollspy /
    collapsible) and route-based tabs, both deep-linkable and shareable.
- The shell renders against the existing **theme token contract** (light + dark) and
  takes all display strings through its config/props — **no hard dependency on the
  i18n module**.
- The module is **independently importable** and **self-contained**: it never
  hard-depends on the theme/auth/providers runtime. `AppProviders` may compose it for
  convenience later, but it stands alone.
- The shell ships a **guide** (`docs/guides/app-shell.md`): what it owns, the config
  contract, the three nav layers + the breadcrumb-is-the-URL invariant, how to wire
  it, how to bring your own.
- The dev-harness **demonstrates** it (responsive header/menu, sections + tabs
  playgrounds), mirroring foundation's test routes — the only way the responsive,
  scroll-container, and deep-link behavior is verified, since typecheck cannot catch
  these regressions.

## Decisions (resolved 2026-06-16, owner)

- **Router coupling → (A).** Adopt **TanStack Router as an *optional* peer behind the
  `my-react-shell/app-shell` sub-path** — the barrel and every other module stay
  router-free; only an app that imports the shell installs the router. Mirrors how
  Convex is isolated (D9). **Amends strategy D2** to "not a barrel peer; an optional
  peer for the `app-shell` sub-path." (Rejected (B), the router seam — heavier, and the
  breadcrumb / scroll / deep-link machinery leaks router semantics into the contract
  anyway.)
- **Primitive dependency → Radix, approved.** The `app-shell` module may depend on the
  relevant **Radix headless primitives** (mobile Sheet/Drawer, `subPages` DropdownMenu,
  Popover) rather than hand-roll them. **Follow-up:** once Radix is first added, review
  whether it should be used elsewhere in my-react-shell too (a deliberate evaluation,
  not an automatic spread). The actual `pnpm add` is still gated on a per-package
  approval at install time.
- **i18n coupling → config/props, and i18n built FIRST.** The shell takes all display
  strings via its **config/props** (self-contained — never hard-imports the i18n
  module). Separately, the owner has sequenced the **i18n module before this one** so
  the shell's harness and consumers route strings through the `t()` seam from the
  start instead of retrofitting. See *Sequencing* below.
- **Scope → app-glue excluded.** Notification system, feedback modal, and
  command-bar/action registry are out of this module (app-specific, not shell). A
  consumer wires its own into the page-header action slot.

## Sequencing

This module is **parked behind the i18n module.** i18n is already T001 remaining scope
(`t()`/`useT` seam + central-key policy + missing-key dev surface + catalog contract +
default + BYO) and is the smaller, foundational piece. Build order: **i18n → then this
app-shell module (T003).** The app-shell does not *hard-depend* on i18n (it takes
strings via config/props), but building i18n first means every user-facing string the
shell harness and consumers produce honors the `t()` seam from day one, per the
project convention, with no retrofit.

## References

- Foundation app-shell source: `~/Developer/zingularis/foundation/src/shell/` (+
  `kit/layout`, `kit/navigation`) and its working guide
  `docs/guides/app-shell-rules.md` — the three-nav-layers model, the
  breadcrumb-is-a-pure-function-of-the-URL invariant, and the scroll-container rules.
- `concept.md` "What it is NOT" (no fixed app-shell) + strategy **D8** (deferred) —
  this proposal un-defers it; strategy **D2** (router not a peer) — amended by the
  router decision above; strategy **D9** (optional/heavy peers behind sub-paths) — the
  pattern this module follows.
- Becomes **T003** once approved; on approval it updates `concept.md` + `strategy.md`
  (un-defer the module; record the router decision).
