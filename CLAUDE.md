# CLAUDE.md — my-react-shell

You are the **my-react-shell-master** — you build and maintain a **support and starting
base for React + Convex apps** under `~/Developer/`: the React counterpart to what the
SolidJS `foundation` is for Solid. It ships an opinionated, batteries-included,
**complete** surface — theme, providers, an auth seam, i18n, icons, an app shell, and the
full component surface — as **modular** pieces an app imports à la carte. It is consumed
like a standard npm package, from a GitHub git-dependency. Changes ripple to every app
that imports it, on version bump.

Project guidance for agents. Short by design; depth lives in `docs/`.

## What this is

**my-react-shell** is the **opinionated, complete base** a new React app starts from —
the React counterpart to the SolidJS `foundation`. It ships a set of **self-contained
modules** an app picks from:

- **theme** — light/dark/system + palette selection + consumer palettes, a
  batteries-included drop-in. The `--color-*` token contract + palettes live in the
  shared, framework-neutral `themes` package, shared with the SolidJS
  `foundation`; this module is the React provider + registry on top.
- **providers** — Convex client provider + the single `AppProviders` wrapper.
- **auth** — a pluggable auth **seam** (a TS contract) + the Convex Auth default
  implementation; bring-your-own for Better Auth / SSO.
- **i18n** — the `t()` seam at `my-react-shell/i18n`: `<I18nProvider>` + `useTranslation`,
  a central-key catalog, `{{param}}` interpolation, opt-in compile-time typed keys
  (`createTypedI18n`, generics default to `string` so it's non-breaking), and a
  dev-only missing-translation overlay. Convex- and router-free; bring-your-own
  engine via `resolve`.
- **icons** — an icons↔emojis display-mode seam (`my-react-shell/icons`): a preference
  (`IconModeProvider` / `useIconMode`) + a thin `<Icon>` glyph↔emoji swap, plus an
  optional `createIconRenderer(icons, emojis)` that wires a consumer's maps into one
  `renderIcon` with foundation's guardrails — a compile-time + dev missing-emoji check
  and a `force` (icon-only) list. No icon registry, no `lucide-react` dep.

Each module is **independently importable, self-contained** (never hard-depends on
another module's runtime), and ships a **contract + a guide** so an app can wire it,
swap it, or bring its own. New modules are added when a capability is reused
(rule of two), and every app gets them on the next version bump.

It ships the **complete component surface** at `my-react-shell/components` — the
un-opinionated primitives (Button/Input/Checkbox/…) **and** the opinionated composites
(Alert, dialogs, structured cards, form fields, …) — all built directly on Radix + the
theme tokens, so a consumer needs **no shadcn**. The app-shell ships as an *optional*
module, never mandated.

- What this is + boundary: [docs/concept.md](docs/concept.md)
- **Public API (every export + usage):** [docs/specifications/api-reference.md](docs/specifications/api-reference.md) — the single source of truth; it **ships inside the package** (`package.json` → `files`), so consumer agents read the version-matched copy at `node_modules/my-react-shell/…` via the `my-react-shell` skill
- **Demo & verification surface (where agents test changes + reproduce reported bugs):** [docs/demo.md](docs/demo.md)
- Framework decision / from-scratch consumer guide: the `react-framework` skill ([.claude/skills/react-framework/react-framework-notes.md](.claude/skills/react-framework/react-framework-notes.md))
- Task & decision history: the per-month index in `docs/2-tasks/_index/` and the individual `docs/2-tasks/TXXX-*/task.md` writeups

> **Status: in progress.** The theme, providers, auth seam, i18n, icons, app-shell, and
> component modules have landed — documented in the single API reference
> ([docs/specifications/api-reference.md](docs/specifications/api-reference.md)), with a
> deeper guide in `docs/guides/` per module where there's more to say than the reference
> (the `components` module has none — the reference is its canonical doc), plus the
> module-authoring contract — distributed as a standard node module (a committed,
> precompiled `dist/`). The component module is being widened to the **complete surface**
> — the un-opinionated primitives alongside the composites, built on Radix with no shadcn.
> The theme tokens are **shared** with the SolidJS `zingularis/foundation` via the `themes`
> package; foundation otherwise stays the source of truth for its Solid modules.

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

**Demos show only what the shell ships — never pimp a demo.** Everything a demo
renders (`my-react-shell-demo` and `my-react-shell-theme-demo`) must be **exactly what
the library exports out of the box**, with its real, shipped appearance. **Never** add
demo-local CSS, style overrides, bespoke components, or hand-tuned values that make a
module *look* better than it actually ships — a flattered demo misrepresents the
library, so the user believes the shell is wonderful and is then disappointed building
a real app on it. If something looks wrong in a demo, the fix belongs in the **shell**
(or a task against it), never papered over in the demo. Demo-only scaffolding — page
layout, nav, explanatory copy, how examples are arranged and labelled — is fine;
faking the *product* (the actual exported components, tokens, and defaults) is not.

`my-react-shell-demo` mirrors the structure of **our foundation showcase**: a
**landing page of cards** that each point to a different area, behind a **full
router with navigation** — one route per showcased area, reachable from the
landing cards and the nav.

**It is also the agent test / bug-reproduction surface.** Because it consumes the
published modules over the real `link:` loop, it is where you confirm a
consumer-visible change in-browser and where you reproduce a reported bug — open the
route that exercises the implicated module. The route map, the demo-vs-harness split,
and the "never start the dev server" rules are in [docs/demo.md](docs/demo.md).

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

**New and changed components must reach the demo's kit pages.** The opinionated kit
(`my-react-shell/components`) is showcased section-by-section across the demo's **kit
pages** (`my-react-shell-demo/src/pages/` — `InputsActionsPage`, `TablesCardsPage`,
`TagsAvatarsPage`, `FeedbackOverlaysPage`, each grouping related components); the
library and its showcase ship together, so a component change that never reaches the
demo is unfinished. Whenever you add a kit component or change one's props / variants
/ behavior, keep the two in lockstep:

- **A new component won't appear until you add its `PageSection`** to the relevant kit
  page's `sections` array — import it and render a live example, mirroring the existing
  entries (an `id`, a `label`, an `icon` key, a short `Lead` blurb). The section's
  scroll-spy tab also needs that same `icon` key registered in **both** the `ICONS`
  (lucide) and `EMOJIS` maps in `my-react-shell-demo/src/shell-config.tsx`, or the
  tab falls back to a generic glyph.
- **A changed component** — a new prop, variant, or behavior worth seeing — updates
  its existing section so the demo renders the new surface.

(The un-opinionated primitives are kit components too — they belong on the kit pages
like every other component, rendered from `my-react-shell/components`.)

## Porting from the SolidJS foundation

Much of my-react-shell is a **React re-implementation of the SolidJS `foundation`**
(`~/Developer/zingularis/foundation/src/`) — its app-shell, tab/scroll primitives,
kit composites, and more. **When you port anything from foundation, port it
faithfully: every feature, behavior, and affordance the foundation version has —
unless the user explicitly approves dropping or changing something.** Open the
foundation source and match it; don't reconstruct from memory or the happy path.

- **What legitimately changes is the implementation idiom only:** SolidJS → React
  (signals → hooks, `For`/`Show` → `.map`/conditionals) and foundation's inline
  Tailwind utilities → my-react-shell's `mrs-`-prefixed plain CSS.
- **What must NOT change is the feature set:** scroll affordances, keyboard
  behavior, ARIA wiring, sizing contracts (`min-width: 0`, `shrink-0`, …), edge /
  empty / overflow states, every visible and interactive detail. Dropping a feature
  to "keep it simple" or because it "looked optional" is the exact failure this rule
  exists to prevent — a silently reduced port reads as finished but isn't.
- **A feature that genuinely shouldn't carry over is a choice → STOP and ask** (root
  `CLAUDE.md` → Mandatory User Approval), then record the omission. Never drop it
  silently.

> Example: foundation's scrollable tab strip
> (`kit/layout/ScrollableTabRow.tsx` — `overflow-x` + hidden scrollbar **plus** edge
> fades, arrow buttons, and overflow detection, on a `min-width: 0` sizing contract)
> is ported here as `src/app-shell/ScrollableTabRow.tsx`, with all of those features
> intact — not the bare `overflow-x: auto` an earlier port reduced it to.

## Stack

- **Frontend:** React 19 + Vite SPA (TypeScript 6). **No SSR** — consumers are
  fully behind auth.
- **Routing:** TanStack Router (type-safe, file-based) — used by the dev-harness
  and recommended to consumers; not a module my-react-shell ships, and **not a peer
  dependency** (it's a dev-only harness dep — no shipped module imports a router, so
  consumers bring their own).
- **UI:** my-react-shell ships the **complete component surface**
  (`my-react-shell/components` — primitives + composites) built on Radix + the theme
  tokens, so a consumer needs **no shadcn** and no copy-in registry. Consumers use
  Tailwind v4 for their own app markup. The **theme token contract** is what every
  component renders against.
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
- **Distribution:** a **GitHub git-dependency**, tag-pinned, consumed like an
  npm package (`import { … } from 'my-react-shell'`). Ships a **committed, precompiled
  `dist/`** — zero-config install, no build runs, no registry, no sync. See [docs/guides/distribution-model.md](docs/guides/distribution-model.md).
- **Hosting (consumers):** Vercel (static). **Git remote:**
  `git@github.com:kesteinbakk/my-react-shell.git` (Bitbucket kept as the `bitbucket`
  mirror remote). The shared `themes` package is still on Bitbucket — but vendored,
  so it is never a consumer dependency.

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
- **No hardcoded user-facing text in components.** Shell components cannot call
  `t()` — they have no access to a consumer's i18n instance. Therefore every
  visible or audible string a component emits (placeholder, empty-state label,
  ARIA label, button title, …) must be either a **prop with an emoji or icon-only
  default**, or a **mandatory consumer prop** (no default — the consumer must
  supply a translated string). Never a hardcoded English (or any language) string.
  The consumer passes translated strings via its own i18n seam. A hardcoded
  English default is never acceptable, even temporarily.
- **Semantic tokens only** — no hardcoded colors/shadows; render in light *and* dark.
- **No silent defaults for absent values** (root `CLAUDE.md`) — check, don't
  default; throw on required-but-absent (e.g. `VITE_CONVEX_URL`).
- **The API reference is mandatory and ALWAYS kept current.** Any change that touches
  the public API surface — a new/removed/renamed export, a changed prop, signature,
  default, import path, or peer; new CSS; a new component or module — **must** update
  [docs/specifications/api-reference.md](docs/specifications/api-reference.md) in the
  **same change**. It is the **single source of truth** for *what* is exported and how to
  use it, and there is exactly **one copy**: it **ships inside the package** (it's in
  `package.json` → `files`), so consumers receive the version-matched reference on their
  next tag bump, and the `my-react-shell` skill points consumer agents at it
  (`node_modules/my-react-shell/docs/specifications/api-reference.md`). No mirror to
  maintain — just keep this one file current. Leaving the reference stale is the
  staleness this rule exists to prevent. See root `CLAUDE.md` → docs reflect current state.
- **Guides are for depth, not the export list — and must be kept current.** A module ships
  a `docs/guides/<module>.md` for the *why* + the contract to fill / how to bring your own
  — only when there's more to say than the API reference carries. A module whose guide would
  only restate the reference ships none (e.g. `components`). **When a change affects a
  module's behavior, constraints, or contract — a new validation, a changed default, a
  new concept, a corrected example — the relevant guide must be updated in the same
  change.** Guides ship inside the package alongside the API reference (`package.json` →
  `files`: `docs/guides`), so consumers receive the version-matched guides on their next
  tag bump and agents can read them at
  `node_modules/my-react-shell/docs/guides/<module>.md`.

## Docs & workflow (zingularis conventions)

```
docs/
├── 1-proposals/      # goals-only proposals (_template.md)
├── 2-tasks/          # TXXX-slug/task.md   (index: _index/<YYYY-MM>.md)
├── 3-bugs/           # BXXX-slug/bug.md    (index: _index/<YYYY-MM>.md)
├── 4-reports/        # reviews/ research/ status/
├── specifications/   # present-tense specs of what EXISTS (+ README index)
├── guides/           # one consumer guide per module (ships in the package)
├── maintainers/      # agent/contributor docs, NOT shipped: release-runbook, module-authoring
└── concept.md        # what this is
```

- **In-repo task/bug index** under `docs/{2-tasks,3-bugs}/_index/` — new rows on
  top; `top + 1` = next ID; reserve atomically. See root `CLAUDE.md` → Task & Bug
  Index. Statuses: `planning → in-progress → finished → archived`.
- Bug closure to `resolved` requires explicit user confirmation in the bug doc.
- Specs are present-tense, no task refs / line numbers / inline dates; update them
  when implementations change.

## Branch & commit model

- Single long-lived branch: **`main`.** No feature branches unless asked.
- **Many agents commit to `main` concurrently — and will keep doing so.** Commit
  history here is therefore **disposable**, and collisions are normal: your staged
  work may get swept into another agent's commit, the working tree may hold other
  sessions' in-flight changes, and commits may land bundled or oddly-messaged. That
  is all expected and fine.
- **Commit your own work at natural finish points.** Prefer committing only your own
  changes when that's trivial; **when isolating them isn't trivial, just commit
  everything in the working tree** rather than stall. Never ask the user how to split
  or isolate a commit, never leave your work uncommitted to avoid touching another
  session's changes, and never close a turn reporting which of the two you chose. This
  **overrides** the universal "commit your own changes only" rule (root `CLAUDE.md`).
- **Never rewrite shared history to tidy up.** No `reset` / `rebase` / `amend` / force
  on commits you didn't just create — a bundled or mislabelled commit is never worth
  clobbering another agent's work over. Leave it.
- **Never push** without an explicit instruction (a `push` targets this repo only).
- A **pre-commit guard** (`.githooks/pre-commit`, enabled via `pnpm setup:hooks`)
  rejects committing a `link:`/`file:` dependency specifier — the local dev-loop
  redirect must never land in a commit. Bypass intentionally with `--no-verify`.
- A **second guard in the same hook keeps `dist/` in lockstep with `src/`:** when a
  commit stages *library* source (`src/**/*.ts(x)`, excluding the harness —
  `main.tsx`, `routes/`, `routeTree.gen.ts`, `*.test-d.ts`), it runs `pnpm build:lib`
  and `git add dist`. It only ever stages `dist/`, so it can **never** sweep
  unrelated *source* into your commit, and committing docs / harness / non-lib files
  doesn't trigger it at all. The one real wrinkle: if your lib-src change shares the
  tree with *other* uncommitted lib-src, the rebuild compiles the whole working tree,
  so the staged `dist/` reflects both — harmless here (history is disposable; see the
  commit policy above), so just commit the batch. If you do want a clean `dist/`,
  isolate first (`git stash push -- <files you don't own>`, commit, `git stash pop`).
  Either way **commit — never leave your work uncommitted for the user.**
- A consumer on the **`link:` dev-loop must dedupe React** in its own Vite config
  (`resolve.dedupe`), or the symlinked shell's own React copy collides with the
  app's and first paint crashes with `Invalid hook call`. The same split hits
  **Vitest**: Vitest externalises `node_modules` by default (bypassing
  `resolve.dedupe`), so tests that render Radix-backed components also fail with
  identical errors. The Vitest fix (`server.deps.inline: [/my-react-shell/]` +
  the Radix devDep prerequisite) is in `docs/guides/distribution-model.md` →
  Local dev-loop → Vitest. `link:`-only — the git-dep path is unaffected.
- **A `link:` consumer's dev server sees shell *and* `themes` edits live — only its
  git-dep/production build lags.** A dev project on `link:../my-react-shell` (the demos,
  evaluering) reads the shell checkout directly: a `src`→`dist` rebuild (the `rs:watch`
  sidecar) shows on reload, and a **`themes`** edit propagates too — `themes` palette CSS
  is **vendored** into the shell's `src/themes/*.css` (consumers depend on only
  `my-react-shell`, never a transitive `themes` git-dep), and the same `rs:watch` sidecar
  (`scripts/dev-watch.mjs`) **mirrors the `../themes` checkout → `src/themes/` on save**,
  so one themes edit HMRs into **every** link consumer at once — no tag, no install. So
  "your dev projects won't see the change" is **false** on the link loop — that only holds
  for a consumer's **production / git-dep install** (pinned tag; needs the release chain:
  themes → shell → consumer). Corollary: a *breaking* shell/`themes` change (a renamed
  token) hits link consumers' dev immediately, so migrate them in the same change. Full
  mechanics + the release chain: `docs/guides/distribution-model.md` +
  `docs/maintainers/release-runbook.md`.

## Releases (agent-handled — never hand steps to the user)

**Releasing is an agent responsibility, every time.** All instructions, commands,
and checks for releasing the shell, themes, or a consumer are documented in the
**agent rulebook**:
[docs/maintainers/release-runbook.md](docs/maintainers/release-runbook.md) (authoritative,
self-contained for agents with no context).

Read and follow that file exactly when asked to perform a release.

## Dev servers (agent rules)

- **The user owns dev servers.** Never run `pnpm dev`, `vite`, `convex dev`, or the
  `build:lib:watch` sidecar (long-running, shared; the watcher is started by the
  dev-manager's `dev start` via `watch = true` in the registry). If one is down,
  report and stop.
- Get approval before installing/changing any dependency or editing any `.env*`
  file — state the exact change first.

## How consumers use my-react-shell

A consumer adds the GitHub git-dep, then imports only the modules it wants:

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
Convex Auth default or its own), and builds its UI from the
`my-react-shell/components` surface (primitives + composites — no shadcn). The
stack-level scaffolding sequence is the `react-framework` skill's guide
([.claude/skills/react-framework/react-framework-notes.md](.claude/skills/react-framework/react-framework-notes.md));
my-react-shell's `docs/guides/` are the authority for each module's exact exports
and contract.
