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
  husky). Remaining: item 5 (release verify from a real tag) needs a tag push —
  local `pnpm pack` dry-run substitutes until then.
- [ ] **E — module pattern + core** *(next)* — extract shared `core` types; codify
  the module contract; write the **module-authoring guide** (how to add a module,
  the sub-path/optional-peer rule, the self-containment rule).
- [ ] **F — i18n module** — `t()` / `useT` seam + catalog contract + central-key
  policy + missing-key dev surface; barrel + sub-path as appropriate; harness route.
- [ ] **G — guides** — per-module guides (theme, providers, auth, i18n) + the
  `~/config` optional contract + consumer bootstrapping pointer.

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
