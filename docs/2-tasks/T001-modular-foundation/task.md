# T001 — modular-foundation

**Status:** in-progress | **Type:** feature | **Branch:** main
**Origin:** the `react-framework` decision + the modular-foundation pivot (strategy
[D8](../../strategy.md)). **Depends on:** nothing. **Blocks:** every my-react-shell consumer.

## Goal

Stand up **my-react-shell** as a **modular React foundation**: a menu of optional,
self-contained **drop-in modules** (theme, providers, auth seam, i18n) that a new
React + Convex app imports à la carte, consumed like a standard npm package from a
tag-pinned Bitbucket git-dependency. No component kit, no registry, no mandated
app-shell. Each module is independently importable, self-contained, and ships a
contract + a guide so an app can wire it, swap it, or bring its own — and new
modules can be added later and reach every app on version bump.

## Background

This task was originally "port `foundation-react` and rebuild on shadcn" — host a
shadcn registry, carry bespoke composites, and build a mandated app-shell. That is
superseded by the modular-foundation pivot ([strategy D8](../../strategy.md)): the
value wanted is **reuse with per-module propagation** (like the SolidJS
`foundation`) delivered as a *dependency*, plus the freedom for each app to build
its own components and structure. See [concept.md](../../concept.md).

## Scope / deliverables

1. **Module pattern.** Every module is (a) independently importable from the barrel
   or a sub-path, (b) self-contained — never hard-depends on another module's
   runtime, (c) a **contract + default + bring-your-own** where the app must supply
   something, with optional/heavy peers behind a sub-path. Codify this + the small
   shared `core` types, and a **module-authoring guide** (how to add/contribute one).
2. **Standard-node-module distribution.** Consumed as a Bitbucket git-dep; a
   `prepare` build compiles `src/ → dist/` so consumers import compiled JS + types
   with zero bundler config. Push + tag to ship; consumers bump + reinstall.
3. **theme module** — semantic-token contract + 5 palettes + light/dark/system +
   consumer palettes. A batteries-included drop-in.
4. **providers** — Convex client provider (no silent default; rejects trailing
   slash) + the `AppProviders` wrapper composing theme + Convex + optional auth.
5. **auth module** — a pluggable `AuthProvider` **seam** + the Convex Auth default
   at `my-react-shell/auth/convex` (so `@convex-dev/auth` stays an optional peer).
6. **i18n module** — the `t()` / `useT` seam, central-key policy, missing-key dev
   surface; a catalog contract + default + bring-your-own.
7. **Guides** — one per module + the module-authoring contract; the `~/config` IoC
   pattern documented as an **optional** convenience, not a requirement.

## Distribution & repo shape

- **Bitbucket git-dependency, tag-pinned**, consumed like an npm package. The
  `prepare` build emits compiled output; `dist/` is gitignored. See [strategy D5](../../strategy.md).
- **One repo, two roles:** the importable **library** (the modules) + a dev-only
  **harness Vite app** (showcase + test routes) that renders the modules for
  behavior verification. The harness is excluded from the library emit and
  `exports`. See [strategy D7](../../strategy.md).

## Build sequence

Each phase is a commit point.

- [x] **0 — record + scope** — pivot recorded as [strategy D8](../../strategy.md); index re-scoped.
- [x] **A — scaffold** — Vite + TanStack Router + Tailwind v4 + TS6; dev-harness
  entry; empty library barrel.
- [x] **B — theme module** — token contract `src/styles/base.css` + 5 palettes;
  `ThemeProvider` / `useTheme` / `themeContext` (light/dark, system-follow, open
  theme set, persistence); barrel-exported; harness theme playground.
- [x] **C — providers + auth seam** — `createConvexClient` (throws on absent /
  trailing-slash URL), `ConvexClientProvider`, `AppProviders`; the `AuthProvider`
  seam + Convex Auth default at the `my-react-shell/auth/convex` sub-path.
- [x] **D — distribution** — standard-node-module packaging: `tsconfig.lib.json` +
  `prepare` build compiling `src/ → dist/`; `exports` point at `dist/`; harness
  excluded; `dist/` gitignored. Verified: lib emits clean JS + `.d.ts`; harness
  typecheck passes.
- [~] **D2 — distribution hardening** — harden the git-dep package model per
  [distribution-model.md](../../guides/distribution-model.md) "Required changes" 1–6.
  Done: `build:lib:watch` script (1), corrected `vite.config.ts` header (2), package
  README + CSS requirement (3), narrowed `files` allowlist (6), resolved the
  router-peer Open decision — `@tanstack/react-router` removed from
  `peerDependencies` (harness-only dev dep) — and the committed-link guard (4): a
  generalized `pre-commit` hook (`.githooks/pre-commit`, `pnpm setup:hooks`, no
  husky). Item 5 (release verify): tag `v0.1.0` pushed + installed from a scratch
  dir — package contents are correct, but the install is **not zero-config on pnpm
  10/11** (the `prepare`/build-script gate). Open decision recorded in
  distribution-model.md (commit `dist/` vs document the allowlist) — fix ships as
  `v0.1.1`. A `my-react-shell-demo` consumer app (local `link:`, theme + shadcn) was
  built to exercise the package.
- [~] **D3 — Convex isolated, barrel = Convex-free core** ([strategy D9](../../strategy.md)).
  The Convex client providers moved out of the barrel to the `my-react-shell/providers`
  sub-path; `convex` is now an *optional* peer (`peerDependenciesMeta`). Barrel `.` =
  theme only. Surfaced by the demo (a theme-only consumer was forced to install
  `convex` via the barrel) — same trap as the router peer; realigns with the Solid
  foundation's optional/isolated Convex (`zing-shell`).
- [x] **E — module pattern + core** — module contract codified in the
  **module-authoring guide** ([module-authoring.md](../../guides/module-authoring.md));
  `core` documented as **empty by design** — no type is shared across modules yet, so
  no `src/core/` was created; a type is promoted only on rule-of-two. No placeholder.
- [x] **F — i18n module** — zero-dep `t()` seam at the `my-react-shell/i18n` sub-path:
  `I18nProvider` + `useTranslation` (+ namespace) over a pure translator (flatten +
  `{{param}}` + fallback locale), localStorage persistence, browser-locale detection,
  a dev missing-key surface (`MissingTranslationsOverlay` + `missingKeyStore`), and
  `translateNow`. Central-key policy in the guide. *Harness showcase route deferred —
  adding a route needs a dev-server run to regenerate `routeTree.gen.ts` (user-owned).*
- [x] **G — guides** — per-module guides (theme, providers, auth, i18n) + the
  `~/config` optional convention (documented in the authoring guide).

## Exit criteria

- A new app can `pnpm add` the Bitbucket git-dep and
  `import { ThemeProvider, AppProviders, createConvexClient } from 'my-react-shell'`
  (+ `my-react-shell/auth/convex`, + `my-react-shell/styles.css`), picking only the
  modules it wants — compiled output, zero bundler config.
- Each shipped module has a guide; the module-authoring contract is documented so a
  consumer can add and contribute a new module.
- No component kit, no registry, no mandated app-shell in the repo.

## Deferred (optional future modules — not this task)

- A shared **app-shell** (header / nav / scroll container / breadcrumb-from-URL /
  `?tab=` deep links) and page/tab primitives — built when an app needs them.
- Any reusable **components** — added on rule-of-two.

## Out of scope

- Any consumer feature UI; migrating existing apps onto my-react-shell.
- The SolidJS `foundation` (unchanged — it serves Solid consumers).
