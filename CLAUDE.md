# CLAUDE.md — my-react-shell

You are the **my-react-shell-master** — you build and maintain a **modular React
foundation**: a menu of optional, versioned **drop-in modules** (theme, providers,
auth seam, i18n, …) that new React + Convex apps under `~/Developer/` import à la
carte. It is consumed like a standard npm package, from a Bitbucket git-dependency.
Changes to a module ripple to every app that imports it, on version bump.

Project guidance for agents. Short by design; depth lives in `docs/`.

## What this is

**my-react-shell** is a **modular foundation library**, not a framework or a fixed
app template. It ships a set of **self-contained modules** an app picks from:

- **theme** — light/dark/system + palette selection + consumer palettes, a
  batteries-included drop-in. The `--color-*` token contract + palettes live in the
  shared, framework-neutral `themes` package (D13), shared with the SolidJS
  `foundation`; this module is the React provider + registry on top.
- **providers** — Convex client provider + the single `AppProviders` wrapper.
- **auth** — a pluggable auth **seam** (a TS contract) + the Convex Auth default
  implementation; bring-your-own for Better Auth / SSO.
- **i18n** — the `t()` seam at `my-react-shell/i18n`: `<I18nProvider>` + `useTranslation`,
  a central-key catalog, `{{param}}` interpolation, and a dev-only missing-translation
  overlay. Convex- and router-free; bring-your-own engine via `resolve`.
- **icons** — an icons↔emojis display-mode seam (`my-react-shell/icons`): a preference
  (`IconModeProvider` / `useIconMode`) + a thin `<Icon>` glyph↔emoji swap. No icon
  registry, no `lucide-react` dep.

Each module is **independently importable, self-contained** (never hard-depends on
another module's runtime), and ships a **contract + a guide** so an app can wire it,
swap it, or bring its own. New modules are added when a capability is reused
(rule of two), and every app gets them on the next version bump.

It ships an **opinionated** component kit at `my-react-shell/components` — the composites
that need a design/layout decision (Alert, dialogs, structured cards, form fields, …) —
but **not** the un-opinionated shadcn primitives (Button/Input/Checkbox/…), which
consumers use shadcn directly for. The app-shell ships as an *optional* module, never mandated.

- What this is + boundary: [docs/concept.md](docs/concept.md)
- Standing decisions + rationale: [docs/strategy.md](docs/strategy.md)
- Framework decision / from-scratch consumer guide: the `react-framework` skill ([.claude/skills/react-framework/react-framework-notes.md](.claude/skills/react-framework/react-framework-notes.md))
- Build plan: **T001** in `docs/2-tasks/` (index: `docs/2-tasks/_index/`)

> **Status: in progress.** The theme, providers, auth seam, i18n, icons, app-shell,
> and component-kit modules have landed — each with a guide in `docs/guides/`, plus the
> module-authoring contract — distributed as a standard node module (prepare-build to
> `dist/`). The theme tokens
> are now **shared** with the SolidJS `zingularis/foundation` via the `themes`
> package (D13); foundation otherwise stays the source of truth for its Solid modules.

## Demos & visual showcasing

**This repo contains no showcase or demo files.** It ships only the library
modules and a dev-only harness. Any file whose purpose is to *show off* a
feature — a gallery, a showcase page, a marketing-style landing, a "look what
this module can do" surface — does **not** belong here.

**All visual showcasing of this library lives in the sister project
`my-react-shell-demo`** (`~/Developer/my-react-shell-demo`). When asked to *show* a
feature, *display* how something works, or *demo* a module, that always means the
demo project's pages — **not** this repo. Build the showcase there, against the
modules this library publishes. Any showcase or demo material that lands in this
repo is to be **moved to `my-react-shell-demo`**.

`my-react-shell-demo` mirrors the structure of **our foundation showcase**: a
**landing page of cards** that each point to a different area, behind a **full
router with navigation** — one route per showcased area, reachable from the
landing cards and the nav.

The in-repo dev-harness exists only for development and behavior verification (test
routes that catch what typecheck can't); it is not where features are shown to the
user.

**Theme edits must reach the demo's color-palette page.** The demo's color palette
(`my-react-shell-demo/src/sections/PaletteReference.tsx`) shows every `--color-*`
token, per palette, in light + dark. Whenever you change theme colors or tokens,
keep it in lockstep: token *values* reflect automatically (the page reads the live
computed color from each scoped `.theme-<name>-<mode>` class — eyeball the page to
confirm the change reads correctly), **but adding, removing, or renaming a
`--color-*` token requires updating that page's `PALETTE_GROUPS` list**, or the
token won't appear (or renders as a stray "unset" hatch).

## Stack

- **Frontend:** React 19 + Vite SPA (TypeScript 6). **No SSR** — consumers are
  fully behind auth.
- **Routing:** TanStack Router (type-safe, file-based) — used by the dev-harness
  and recommended to consumers; not a module my-react-shell ships, and **not a peer
  dependency** (it's a dev-only harness dep — no shipped module imports a router, so
  consumers bring their own).
- **UI:** consumers use shadcn/ui + Tailwind v4 directly for the un-opinionated
  primitives; my-react-shell does **not** host a registry. It **does** ship an
  opinionated component kit (`my-react-shell/components`) for the composites that need a
  design decision, plus the **theme token contract** every component renders against.
- **Backend:** Convex (`eu-west-1`, GDPR). **No trailing slash** in
  `VITE_CONVEX_URL`. The Convex client context (`AppProviders`,
  `ConvexClientProvider`, `createConvexClient`) ships in the `providers` module at
  the `my-react-shell/providers` sub-path, so `convex` is an *optional* peer and the
  barrel (theme) stays Convex-free.
- **Auth:** the `auth` module ships **only the Convex Auth (`@convex-dev/auth`)
  default** — auth-server-less, no cross-domain — behind the seam, at the
  `my-react-shell/auth/convex` sub-path so `@convex-dev/auth` stays an *optional*
  peer. A consumer needing Better Auth (`@convex-dev/better-auth`, crossDomain,
  Convex ≥ 1.25), SSO, or MFA implements the seam itself.
- **Package manager: pnpm** — never `npm install` (it desyncs the lockfile and
  Convex dev then crash-loops). Use `pnpm add` / `pnpm <script>` / `pnpm dlx`.
- **Distribution:** a **Bitbucket git-dependency**, tag-pinned, consumed like an
  npm package (`import { … } from 'my-react-shell'`). A `prepare` build compiles
  `src/ → dist/` on install — no registry, no sync. See [docs/strategy.md](docs/strategy.md) D5.
- **Hosting (consumers):** Vercel (static). **Git remote:**
  `git@bitbucket.org:kesteinbakk/my-react-shell.git`.

## Conventions (what every module upholds)

- **Self-contained modules.** A module is importable on its own and never
  hard-depends on another module's *runtime*; shared pure types live in a small
  internal core. An app takes only the modules it wants.
- **Contract + default + bring-your-own.** Where an app must supply something, the
  module exports a TS **contract** and (where sensible) a shipped default. The
  `auth` seam is the template: `AuthProvider` type + Convex Auth default + BYO.
- **Optional/heavy peers behind sub-paths.** Anything pulling an optional or heavy
  dependency lives behind a sub-path, keeping the main barrel dependency-light: the
  Convex client providers at `my-react-shell/providers` (`convex` optional), the
  Convex Auth default at `my-react-shell/auth/convex` (`@convex-dev/auth` optional).
  The barrel (`my-react-shell`) is the Convex-free theme core.
- **i18n:** every user-facing string through the `t()` seam; central-key policy;
  missing-key dev surface. Code / comments / docs in English.
- **Semantic tokens only** — no hardcoded colors/shadows; render in light *and* dark.
- **No silent defaults for absent values** (root `CLAUDE.md`) — check, don't
  default; throw on required-but-absent (e.g. `VITE_CONVEX_URL`).
- **Every module ships a guide** in `docs/guides/` — what it does, the contract to
  fill, how to wire it, how to bring your own.

## Docs & workflow (zingularis conventions)

```
docs/
├── 1-proposals/      # goals-only proposals (_template.md)
├── 2-tasks/          # TXXX-slug/task.md   (index: _index/<YYYY-MM>.md)
├── 3-bugs/           # BXXX-slug/bug.md    (index: _index/<YYYY-MM>.md)
├── 4-reports/        # reviews/ security/ research/ status/
├── specifications/   # present-tense specs of what EXISTS (+ README index)
├── guides/           # one guide per module + the module-authoring contract
├── concept.md        # what this is
└── strategy.md       # decision log
```

- **In-repo task/bug index** under `docs/{2-tasks,3-bugs}/_index/` — new rows on
  top; `top + 1` = next ID; reserve atomically. See root `CLAUDE.md` → Task & Bug
  Index. Statuses: `planning → in-progress → finished → archived`.
- Bug closure to `resolved` requires explicit user confirmation in the bug doc.
- Specs are present-tense, no task refs / line numbers / inline dates; update them
  when implementations change.

## Branch & commit model

- Single long-lived branch: **`main`.** No feature branches unless asked.
- Commit your own work at natural finish points. **Never push** without an
  explicit instruction (a `push` targets this repo only).
- A **pre-commit guard** (`.githooks/pre-commit`, enabled via `pnpm setup:hooks`)
  rejects committing a `link:`/`file:` dependency specifier — the local dev-loop
  redirect must never land in a commit. Bypass intentionally with `--no-verify`.
- A consumer on the **`link:` dev-loop must dedupe React** in its own Vite config
  (`resolve.dedupe`), or the symlinked shell's own React copy collides with the
  app's and first paint crashes with `Invalid hook call`. `link:`-only — the
  git-dep path is unaffected. See `docs/guides/distribution-model.md` → Local
  dev-loop for the exact package list and why.

## Dev servers (agent rules)

- **The user owns dev servers.** Never run `pnpm dev`, `vite`, or `convex dev`
  (long-running, interactive, shared backend). If one is down, report and stop.
- Get approval before installing/changing any dependency or editing any `.env*`
  file — state the exact change first.

## How consumers use my-react-shell

A consumer adds the Bitbucket git-dep, then imports only the modules it wants:

```ts
import { ThemeProvider } from 'my-react-shell'                       // theme — Convex-free core
import { AppProviders, createConvexClient } from 'my-react-shell/providers'
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
import { Alert, UserPreferences } from 'my-react-shell/components'   // opinionated kit
import { IconModeProvider, useIconMode } from 'my-react-shell/icons' // icons↔emojis seam
import 'my-react-shell/styles.css'
import 'my-react-shell/components/styles.css'
```

It wraps its own TanStack Router in `AppProviders`, picks an auth provider (the
Convex Auth default or its own), and builds its UI with shadcn primitives plus the
opinionated `my-react-shell/components` kit. The
stack-level scaffolding sequence is the `react-framework` skill's guide
([.claude/skills/react-framework/react-framework-notes.md](.claude/skills/react-framework/react-framework-notes.md));
my-react-shell's `docs/guides/` are the authority for each module's exact exports
and contract.
