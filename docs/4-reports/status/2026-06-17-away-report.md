# Away report — 2026-06-17

Autonomous run (independent-work). Goal: finish **T1** then build **T3**, replicating
the foundation app shell on this stack. The diff + task docs are the record; this is
the map.

## Completed

- **T2** → finished (owner-confirmed): the `link:` dev-loop dedupe task.
- **T1 — modular foundation, substantively done:**
  - **i18n module** at `my-react-shell/i18n` — zero-dep `t()` seam (`I18nProvider` +
    `useTranslation`, fallback locale, localStorage + browser detection, dev
    missing-key overlay, `translateNow`). 12 pure-core checks pass.
  - **Guides**: theme, providers, auth, i18n, and the **module-authoring contract**
    (records `src/core/` as empty-by-design — types promoted only on rule-of-two).
  - Fixed a wrong import path in the `convex-auth.tsx` docstring.
- **T3 — app-shell module, code complete** at `my-react-shell/app-shell`:
  - Spine (`shellContract`, `shellContext`, `defineShellConfig`, `app-shell.css`),
    chrome (`AppShell` + `AppHeader` + `AppMenu` + `AppBottomNav`), page header
    (`ShellPageHeader` + `findActiveChain` + `useDynamicPages`), page tabs
    (`PageTabs` + `PageSections`). Built from a port blueprint
    (`docs/4-reports/research/app-shell-port-blueprint.md`) the foundation app-shell
    expert produced; leaf components fanned out to 3 parallel code agents, integrated
    by me.
  - **Verified:** `tsc -b` green, `pnpm build:lib` emits `dist/app-shell/`, 13
    `defineShellConfig` validator checks pass.
- **Docs/decisions:** strategy **D10** (app-shell module; router + Radix as optional
  peers behind the sub-path), amended **D2** (router optional peer) and **D8**
  (un-defer), concept boundary updated.
- **Dependencies added** (owner pre-approved Radix + router-A): `@radix-ui/react-dialog`,
  `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover` as devDeps + **optional**
  peers; `@tanstack/react-router` promoted to an **optional** peer. Theme-only
  consumers install none of them.

## Remaining

- **T3 browser verification (user-owned — dev servers are yours).** The responsive
  chrome, body-cell scroll container, breadcrumb derivation, `PageSections` URL↔state
  + scrollspy + deep-link, and `PageTabs` pinning are only fully catchable in-browser.
  **Harness playground routes are not added** — a new route needs a dev-server run to
  regenerate `routeTree.gen.ts`, which agents don't run here. This is T3's gate to
  `finished`.
- **Radix aria-hidden check** (blueprint appendix): open the mobile drawer from a
  focused hamburger, confirm no `aria-hidden` focus-retention console warning. The
  SolidJS Hard Rule #3 blur workaround was intentionally *not* ported (Radix manages
  focus scope) — this is the one empirical confirmation outstanding.
- **T1 v0.1.1 distribution decision (owner call):** zero-config install on pnpm 10/11
  — commit `dist/` vs document the build-script allowlist (build sequence D2 item 5).
- **i18n harness showcase route** — also dev-run gated (route tree regen).

## Flagged concerns discovered mid-work

- **AppMenu rows** are each wrapped in a keyed `<span>` (divider + link), making the
  `<span>` the flex item rather than the `<Link>`. Functionally correct; the `gap`
  rhythm wants a harness visual check.
- **Breadcrumb per-level wrapper** uses one inline `style` (no `.mrs-breadcrumbs__level`
  class). Could be promoted to a class for consistency.
- **`findActiveChain` top-level dynamic key is `''`** (root). Confirm this when first
  wiring `useDynamicPages` for top-level dynamic pages.
- **CSS asset path:** `app-shell.css` ships from `src/` via a dedicated export
  (`my-react-shell/app-shell/styles.css`), mirroring the theme `styles.css` precedent —
  *not* bundled into `dist` (tsc doesn't copy raw assets). Confirm a real consumer
  resolves the import.

## Suggested cleanup (out-of-scope — NOT touched)

- `scripts/contrast-audit.mjs` + `scripts/contrast-complete.mjs` are **untracked**
  (the WCAG contrast sweep). Decide: commit them, or gitignore. Left as-is.
- `my-react-shell-demo` carries an unused `convex` dependency (noted in T002 follow-up).

## Recommended next step

Run the dev harness: add an app-shell playground route + the i18n showcase route
(regenerates `routeTree.gen.ts`), walk the responsive / scroll / deep-link / breadcrumb
behavior and the Radix drawer aria-hidden check in the browser, then flip **T3** to
`finished`. Separately, make the **v0.1.1** distribution call to close T1's last edge.
